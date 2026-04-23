"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import clsx from "clsx";

type Resource = {
  id: string;
  title: string;
  type: "BOOK" | "VIDEO" | "ARTICLE" | "COURSE";
  url: string | null;
  isCompleted: boolean;
  course?: { title: string; code: string } | null;
};

type Course = {
  id: string;
  title: string;
  code: string;
};

const typeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  BOOK: <Book className="w-4 h-4" />,
  COURSE: <GraduationCap className="w-4 h-4" />,
  ARTICLE: <FileText className="w-4 h-4" />,
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("ARTICLE");
  const [newUrl, setNewUrl] = useState("");
  const [newCourseId, setNewCourseId] = useState("");

  const fetchResources = async () => {
    const res = await fetch("/api/resources");
    if (res.ok) setResources(await res.json());
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/resources").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([r, c]) => {
        setResources(r);
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
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isCompleted: !current } : r))
      );
    }
  };

  const addResource = async () => {
    if (!newTitle.trim() || !newCourseId) return;
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        type: newType,
        url: newUrl.trim() || null,
        courseId: newCourseId,
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
    if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = resources.filter((r) => {
    const matchesType = filter === "ALL" || r.type === filter;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.course?.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const completedCount = resources.filter((r) => r.isCompleted).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resource Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {resources.length} resources &bull; {completedCount} completed
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
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.code} — ` : ""}{c.title}
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

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "BOOK", "VIDEO", "ARTICLE", "COURSE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={clsx(
                "px-3 py-2 text-xs font-medium rounded-md transition-colors",
                filter === type
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                  : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading resources...</div>
      ) : (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden md:table-cell">Course</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((resource) => (
                <tr
                  key={resource.id}
                  className={clsx(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    resource.isCompleted && "opacity-60"
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleComplete(resource.id, resource.isCompleted)}
                      className={clsx(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        resource.isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                      )}
                    >
                      {resource.isCompleted && <Check className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {typeIcons[resource.type]}
                      {resource.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <span className={resource.isCompleted ? "line-through" : ""}>
                      {resource.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {resource.course?.code || resource.course?.title || "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1 text-xs"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No resources found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
