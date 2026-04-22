"use client";

import { useState, useEffect, useMemo } from "react";
import { Hammer, ChevronDown, Filter } from "lucide-react";
import clsx from "clsx";
import { TRACK_GROUPS } from "@/lib/track-groups";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  sortOrder: number;
  course?: { title: string; code: string; track?: { title: string; color: string } } | null;
};

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

const priorityLabels: Record<string, string> = {
  LOW: "Level 1 — Beginner",
  MEDIUM: "Level 2 — Intermediate",
  HIGH: "Level 3 — Advanced",
};

const statusColors: Record<string, string> = {
  TODO: "text-gray-500",
  IN_PROGRESS: "text-blue-500",
  DONE: "text-green-500",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetch("/api/tasks?includeTrack=1")
      .then((r) => r.json())
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    }
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterGroup !== "ALL") {
        const group = TRACK_GROUPS.find((g) => g.id === filterGroup);
        if (group) {
          const trackTitle = t.course?.track?.title;
          if (!trackTitle || !group.dbTrackTitles.includes(trackTitle)) return false;
        }
      }
      if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
      if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterGroup, filterPriority, filterStatus]);

  const grouped = useMemo(() => {
    const map = new Map<string, { course: string; code: string; trackTitle: string; tasks: Task[] }>();
    for (const t of filtered) {
      const key = t.course?.title || "General";
      if (!map.has(key)) {
        map.set(key, {
          course: t.course?.title || "General",
          code: t.course?.code || "",
          trackTitle: t.course?.track?.title || "",
          tasks: [],
        });
      }
      map.get(key)!.tasks.push(t);
    }
    return Array.from(map.values()).sort((a, b) => a.course.localeCompare(b.course));
  }, [filtered]);

  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {doneCount}/{tasks.length} completed &bull; {filtered.length} showing
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Track</span>
          <div className="flex gap-1 flex-wrap">
            <FilterChip
              active={filterGroup === "ALL"}
              onClick={() => setFilterGroup("ALL")}
              label="All"
            />
            {TRACK_GROUPS.map((g) => (
              <FilterChip
                key={g.id}
                active={filterGroup === g.id}
                onClick={() => setFilterGroup(g.id)}
                label={g.name}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Level</span>
          <div className="flex gap-1">
            <FilterChip active={filterPriority === "ALL"} onClick={() => setFilterPriority("ALL")} label="All" />
            <FilterChip active={filterPriority === "LOW"} onClick={() => setFilterPriority("LOW")} label="L1" />
            <FilterChip active={filterPriority === "MEDIUM"} onClick={() => setFilterPriority("MEDIUM")} label="L2" />
            <FilterChip active={filterPriority === "HIGH"} onClick={() => setFilterPriority("HIGH")} label="L3" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
          <div className="flex gap-1">
            <FilterChip active={filterStatus === "ALL"} onClick={() => setFilterStatus("ALL")} label="All" />
            <FilterChip active={filterStatus === "TODO"} onClick={() => setFilterStatus("TODO")} label="To Do" />
            <FilterChip active={filterStatus === "IN_PROGRESS"} onClick={() => setFilterStatus("IN_PROGRESS")} label="Active" />
            <FilterChip active={filterStatus === "DONE"} onClick={() => setFilterStatus("DONE")} label="Done" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No projects match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.course}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {group.code && (
                    <span className="text-gray-400 mr-1">{group.code}</span>
                  )}
                  {group.course}
                </h3>
                {group.trackTitle && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                    {group.trackTitle}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {group.tasks.filter((t) => t.status === "DONE").length}/{group.tasks.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={clsx(
                      "bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between transition-all",
                      task.status === "DONE" && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() =>
                          updateStatus(
                            task.id,
                            task.status === "DONE"
                              ? "TODO"
                              : task.status === "TODO"
                              ? "IN_PROGRESS"
                              : "DONE"
                          )
                        }
                        className={clsx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          task.status === "DONE"
                            ? "bg-green-500 border-green-500 text-white"
                            : task.status === "IN_PROGRESS"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                        )}
                      >
                        {task.status === "DONE" && (
                          <span className="text-[10px]">✓</span>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </button>

                      <p
                        className={clsx(
                          "text-sm font-medium truncate",
                          task.status === "DONE"
                            ? "text-gray-400 line-through"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span
                        className={clsx(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                          priorityColors[task.priority]
                        )}
                      >
                        {task.priority === "LOW" ? "L1" : task.priority === "MEDIUM" ? "L2" : "L3"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
        active
          ? "bg-gray-900 dark:bg-white text-white dark:text-black"
          : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      {label}
    </button>
  );
}
