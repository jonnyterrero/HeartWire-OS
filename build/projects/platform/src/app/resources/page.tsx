"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ExternalLink,
  FileText,
  Video,
  Book,
  GraduationCap,
  Plus,
  Check,
  Trash2,
  X,
  BookMarked,
  Github,
  Globe,
  Youtube,
  Library,
} from "lucide-react";
import clsx from "clsx";
import { CURATED_RESOURCES, TRACK_LABELS } from "@/lib/curated";

type UserResource = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  isCompleted: boolean;
  course?: { title: string; code: string } | null;
};

type Course = { id: string; title: string; code: string };

type UnifiedResource = {
  key: string;
  source: "user" | "curated";
  title: string;
  type: string;
  resourceType?: string | null;
  url: string | null;
  isCompleted: boolean;
  courseLabel?: string;
  description?: string;
  curatedSource?: string;
  curatedTracks?: string[];
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  BOOK: <Book className="w-4 h-4" />,
  COURSE: <GraduationCap className="w-4 h-4" />,
  ARTICLE: <FileText className="w-4 h-4" />,
  GITHUB_REPO: <Github className="w-4 h-4" />,
  PDF: <FileText className="w-4 h-4" />,
  WEBSITE: <Globe className="w-4 h-4" />,
  YOUTUBE_VIDEO: <Youtube className="w-4 h-4" />,
  YOUTUBE_PLAYLIST: <Youtube className="w-4 h-4" />,
  DOCUMENTATION: <FileText className="w-4 h-4" />,
  HANDBOOK: <BookMarked className="w-4 h-4" />,
  REPO: <Github className="w-4 h-4" />,
  REFERENCE: <Library className="w-4 h-4" />,
  PRACTICE: <FileText className="w-4 h-4" />,
  TEXTBOOK: <BookMarked className="w-4 h-4" />,
  OTHER: <Library className="w-4 h-4" />,
};

const TYPE_FILTERS = [
  "ALL",
  "BOOK",
  "TEXTBOOK",
  "VIDEO",
  "COURSE",
  "ARTICLE",
  "GITHUB_REPO",
  "PDF",
  "WEBSITE",
  "YOUTUBE_VIDEO",
  "PRACTICE",
  "HANDBOOK",
] as const;

export default function ResourcesPage() {
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<(typeof TYPE_FILTERS)[number] | "ALL">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [showCurated, setShowCurated] = useState(true);
  const [showUser, setShowUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("ARTICLE");
  const [newUrl, setNewUrl] = useState("");
  const [newCourseId, setNewCourseId] = useState("");

  const fetchResources = async () => {
    const res = await fetch("/api/resources");
    if (res.ok) setUserResources(await res.json());
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/resources").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/courses").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([r, c]) => {
        setUserResources(r);
        setCourses(c);
        if (c.length > 0) setNewCourseId(c[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleComplete = async (id: string, current: boolean) => {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !current }),
    });
    if (res.ok) {
      setUserResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isCompleted: !current } : r))
      );
    }
  };

  const addResource = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        type: newType,
        url: newUrl.trim() || null,
        courseId: newCourseId || null,
      }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewUrl("");
      setShowAdd(false);
      fetchResources();
    }
  };

  const deleteResource = async (id: string) => {
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (res.ok) setUserResources((prev) => prev.filter((r) => r.id !== id));
  };

  const unified = useMemo<UnifiedResource[]>(() => {
    const out: UnifiedResource[] = [];
    if (showUser) {
      for (const r of userResources) {
        out.push({
          key: `user-${r.id}`,
          source: "user",
          title: r.title,
          type: r.type,
          url: r.url,
          isCompleted: r.isCompleted,
          courseLabel: r.course?.code || r.course?.title,
        });
      }
    }
    if (showCurated) {
      for (const r of CURATED_RESOURCES) {
        out.push({
          key: `curated-${r.id}`,
          source: "curated",
          title: r.title,
          type: r.type.toUpperCase(),
          url: r.url,
          isCompleted: false,
          description: r.description,
          curatedSource: r.source,
          curatedTracks: r.tracks.map((t) => TRACK_LABELS[t] ?? t),
        });
      }
    }
    return out;
  }, [userResources, showCurated, showUser]);

  const filtered = unified.filter((r) => {
    const matchesType =
      filter === "ALL" ||
      r.type === filter ||
      r.type.toUpperCase() === filter;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.curatedSource ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.courseLabel ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totals = {
    user: userResources.length,
    curated: CURATED_RESOURCES.length,
    completed: userResources.filter((r) => r.isCompleted).length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Resources
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {totals.user} added · {totals.curated} curated · {totals.completed}{" "}
            completed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "Add Resource"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Resource title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="URL (optional)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white"
            >
              {["BOOK", "VIDEO", "ARTICLE", "COURSE"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white"
            >
              <option value="">No course (library only)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.code} — ` : ""}
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addResource}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Add Resource
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, source, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs px-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showCurated}
              onChange={(e) => setShowCurated(e.target.checked)}
            />
            Curated
          </label>
          <label className="flex items-center gap-1.5 text-xs px-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showUser}
              onChange={(e) => setShowUser(e.target.checked)}
            />
            My adds
          </label>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
              filter === type
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
            )}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading resources...
        </div>
      ) : (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden md:table-cell">Source</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((r) => (
                <tr
                  key={r.key}
                  className={clsx(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    r.isCompleted && "opacity-60"
                  )}
                >
                  <td className="px-4 py-3">
                    {r.source === "user" ? (
                      <button
                        onClick={() =>
                          toggleComplete(
                            r.key.replace("user-", ""),
                            r.isCompleted
                          )
                        }
                        className={clsx(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          r.isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                        )}
                      >
                        {r.isCompleted && <Check className="w-3 h-3" />}
                      </button>
                    ) : (
                      <span
                        className="text-[9px] uppercase font-bold tracking-wide text-blue-500"
                        title="Curated reference resource"
                      >
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {TYPE_ICON[r.type] ?? <Library className="w-4 h-4" />}
                      {r.type.replace("_", " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">
                      <span className={r.isCompleted ? "line-through" : ""}>
                        {r.title}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        {r.description}
                      </p>
                    )}
                    {r.curatedTracks && r.curatedTracks.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {r.curatedTracks.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] uppercase tracking-wide border border-gray-200 dark:border-gray-700 rounded px-1 text-gray-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {r.curatedSource ?? r.courseLabel ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1 text-xs"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {r.source === "user" && (
                      <button
                        onClick={() =>
                          deleteResource(r.key.replace("user-", ""))
                        }
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No resources match. Try clearing filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
