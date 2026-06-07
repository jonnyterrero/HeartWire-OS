"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { BookOpen, FolderKanban } from "lucide-react";

type CourseOption = {
  id: string;
  title: string;
  code: string | null;
  status: string;
  track: { title: string; color: string };
};

type TaskOption = {
  id: string;
  title: string;
  status: string;
  priority: string;
  course?: {
    title: string;
    code: string | null;
    track?: { title: string; color: string };
  } | null;
};

type FocusData = {
  courses: { id: string }[];
  projects: { id: string }[];
  limits: { maxCourses: number; maxProjects: number };
};

type Props = {
  onSaved?: () => void;
};

export default function FocusPicker({ onSaved }: Props) {
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [allTasks, setAllTasks] = useState<TaskOption[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [maxCourses, setMaxCourses] = useState(5);
  const [maxTasks, setMaxTasks] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [coursesRes, tasksRes, focusRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/tasks?includeTrack=1"),
        fetch("/api/focus"),
      ]);
      if (coursesRes.ok) setAllCourses(await coursesRes.json());
      if (tasksRes.ok) setAllTasks(await tasksRes.json());
      if (focusRes.ok) {
        const focus: FocusData = await focusRes.json();
        setSelectedCourseIds(focus.courses.map((c) => c.id));
        setSelectedTaskIds(focus.projects.map((p) => p.id));
        setMaxCourses(focus.limits.maxCourses);
        setMaxTasks(focus.limits.maxProjects);
      }
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const q = courseFilter.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.code?.toLowerCase().includes(q) ?? false) ||
        c.track.title.toLowerCase().includes(q)
    );
  }, [allCourses, courseFilter]);

  const filteredTasks = useMemo(() => {
    const q = taskFilter.trim().toLowerCase();
    const active = allTasks.filter((t) => t.status !== "DONE");
    if (!q) return active;
    return active.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.course?.title.toLowerCase().includes(q) ?? false)
    );
  }, [allTasks, taskFilter]);

  function toggleCourse(id: string) {
    setSelectedCourseIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxCourses) return prev;
      return [...prev, id];
    });
  }

  function toggleTask(id: string) {
    setSelectedTaskIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxTasks) return prev;
      return [...prev, id];
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseIds: selectedCourseIds,
        taskIds: selectedTaskIds,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Focus updated.");
      onSaved?.();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("heartwire:focus-changed"));
      }
    } else {
      let detail = "";
      try {
        const data = await res.json();
        detail = data?.error ? `: ${data.error}` : "";
      } catch {}
      setMessage(`Failed to save${detail}`);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading focus options…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <BookOpen className="w-4 h-4" />
            Focus courses
            <span className="text-xs font-normal text-gray-500">
              ({selectedCourseIds.length}/{maxCourses})
            </span>
          </div>
        </div>
        <input
          type="search"
          placeholder="Filter courses…"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full mb-2 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
        />
        {filteredCourses.length === 0 ? (
          <p className="text-xs text-gray-500">No courses found.</p>
        ) : (
          <ul className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-800 rounded-md p-2">
            {filteredCourses.map((c) => {
              const selected = selectedCourseIds.includes(c.id);
              const atLimit = !selected && selectedCourseIds.length >= maxCourses;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    disabled={atLimit}
                    className={clsx(
                      "w-full text-left px-2 py-1.5 rounded text-sm flex items-center justify-between gap-2",
                      selected
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white",
                      atLimit && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="truncate">
                      {c.code && (
                        <span className="text-gray-400 mr-1">{c.code}</span>
                      )}
                      {c.title}
                    </span>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {c.track.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FolderKanban className="w-4 h-4" />
            Focus projects
            <span className="text-xs font-normal text-gray-500">
              ({selectedTaskIds.length}/{maxTasks})
            </span>
          </div>
        </div>
        <input
          type="search"
          placeholder="Filter projects…"
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="w-full mb-2 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
        />
        {filteredTasks.length === 0 ? (
          <p className="text-xs text-gray-500">No active projects found.</p>
        ) : (
          <ul className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-800 rounded-md p-2">
            {filteredTasks.map((t) => {
              const selected = selectedTaskIds.includes(t.id);
              const atLimit = !selected && selectedTaskIds.length >= maxTasks;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    disabled={atLimit}
                    className={clsx(
                      "w-full text-left px-2 py-1.5 rounded text-sm flex items-center justify-between gap-2",
                      selected
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white",
                      atLimit && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="truncate">{t.title}</span>
                    {t.course && (
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {t.course.code || t.course.title}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save focus"}
        </button>
        {message && <p className="text-xs text-gray-500">{message}</p>}
      </div>
    </div>
  );
}
