"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckSquare,
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Video,
  BookMarked,
  Newspaper,
  GraduationCap,
  Clock,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

type Resource = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  isCompleted: boolean;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
};

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type CourseDetail = {
  id: string;
  title: string;
  code: string | null;
  description: string | null;
  status: string;
  track: { title: string; color: string };
  resources: Resource[];
  tasks: Task[];
  notes: Note[];
};

const typeIcons: Record<string, React.ReactNode> = {
  BOOK: <BookMarked className="w-4 h-4" />,
  VIDEO: <Video className="w-4 h-4" />,
  ARTICLE: <Newspaper className="w-4 h-4" />,
  COURSE: <GraduationCap className="w-4 h-4" />,
};

const statusConfig: Record<string, { label: string; style: string }> = {
  NOT_STARTED: {
    label: "Not Started",
    style: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  COMPLETED: {
    label: "Completed",
    style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
};

const priorityColors: Record<string, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

const taskStatusStyles: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resources" | "tasks" | "notes">("resources");

  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", type: "BOOK", url: "" });

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM" });

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchCourse = useCallback(async () => {
    const res = await fetch(`/api/courses/${id}`);
    if (!res.ok) {
      router.push("/courses");
      return;
    }
    setCourse(await res.json());
    setIsLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const updateCourseStatus = async (status: string) => {
    await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setCourse((prev) => (prev ? { ...prev, status } : prev));
  };

  const addResource = async () => {
    if (!newResource.title.trim()) return;
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newResource, courseId: id }),
    });
    if (res.ok) {
      setNewResource({ title: "", type: "BOOK", url: "" });
      setShowAddResource(false);
      fetchCourse();
    }
  };

  const toggleResource = async (resourceId: string, current: boolean) => {
    await fetch(`/api/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !current }),
    });
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === resourceId ? { ...r, isCompleted: !current } : r
        ),
      };
    });
  };

  const deleteResource = async (resourceId: string) => {
    await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
    setCourse((prev) =>
      prev ? { ...prev, resources: prev.resources.filter((r) => r.id !== resourceId) } : prev
    );
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, courseId: id, status: "TODO" }),
    });
    if (res.ok) {
      setNewTask({ title: "", priority: "MEDIUM" });
      setShowAddTask(false);
      fetchCourse();
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      };
    });
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setCourse((prev) =>
      prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) } : prev
    );
  };

  const addNote = async () => {
    if (!newNote.title.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newNote, courseId: id }),
    });
    if (res.ok) {
      setNewNote({ title: "", content: "" });
      setShowAddNote(false);
      fetchCourse();
    }
  };

  const deleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setCourse((prev) =>
      prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : prev
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-gray-500">Loading course...</div>
    );
  }

  if (!course) return null;

  const completedResources = course.resources.filter((r) => r.isCompleted).length;
  const doneTasks = course.tasks.filter((t) => t.status === "DONE").length;

  const tabs = [
    { key: "resources" as const, label: "Resources", count: course.resources.length, icon: LinkIcon },
    { key: "tasks" as const, label: "Tasks", count: course.tasks.length, icon: CheckSquare },
    { key: "notes" as const, label: "Notes", count: course.notes.length, icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: course.track.color + "22", color: course.track.color }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {course.code && <span className="font-medium">{course.code}</span>}
                  {course.code && " · "}
                  <span style={{ color: course.track.color }}>{course.track.title}</span>
                </p>
              </div>
            </div>
            {course.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
                {course.description}
              </p>
            )}
          </div>

          <div className="relative">
            <select
              value={course.status}
              onChange={(e) => updateCourseStatus(e.target.value)}
              className={clsx(
                "text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer appearance-none pr-8",
                statusConfig[course.status]?.style
              )}
            >
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedResources}/{course.resources.length}
            </p>
            <p className="text-xs text-gray-500">Resources Done</p>
          </div>
          <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {doneTasks}/{course.tasks.length}
            </p>
            <p className="text-xs text-gray-500">Tasks Done</p>
          </div>
          <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {course.notes.length}
            </p>
            <p className="text-xs text-gray-500">Notes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={clsx(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h2>
            <button
              onClick={() => setShowAddResource(!showAddResource)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {showAddResource ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddResource ? "Cancel" : "Add"}
            </button>
          </div>

          {showAddResource && (
            <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Resource title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BOOK">Book</option>
                  <option value="VIDEO">Video</option>
                  <option value="ARTICLE">Article</option>
                  <option value="COURSE">Course</option>
                </select>
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addResource}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Add Resource
              </button>
            </div>
          )}

          {course.resources.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No resources yet. Add books, videos, or articles.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {course.resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 group hover:shadow-sm transition-shadow"
                >
                  <button
                    onClick={() => toggleResource(r.id, r.isCompleted)}
                    className={clsx(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      r.isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                    )}
                  >
                    {r.isCompleted && <span className="text-xs">&#10003;</span>}
                  </button>
                  <div
                    className={clsx(
                      "flex items-center gap-2 flex-1 min-w-0",
                      r.isCompleted && "opacity-50"
                    )}
                  >
                    <span className="text-gray-400 flex-shrink-0">
                      {typeIcons[r.type] || <LinkIcon className="w-4 h-4" />}
                    </span>
                    <span
                      className={clsx(
                        "text-sm truncate",
                        r.isCompleted
                          ? "line-through text-gray-400"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {r.title}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{r.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteResource(r.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {showAddTask ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddTask ? "Cancel" : "Add"}
            </button>
          </div>

          {showAddTask && (
            <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Add Task
              </button>
            </div>
          )}

          {course.tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {course.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 group hover:shadow-sm transition-shadow"
                >
                  <span className={clsx("text-sm font-bold", priorityColors[t.priority])}>
                    {t.priority === "HIGH" ? "!" : t.priority === "MEDIUM" ? "~" : "-"}
                  </span>
                  <span
                    className={clsx(
                      "flex-1 text-sm truncate",
                      t.status === "DONE"
                        ? "line-through text-gray-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {t.title}
                  </span>
                  {t.dueDate && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    className={clsx(
                      "text-xs font-semibold px-2 py-1 rounded-full cursor-pointer appearance-none",
                      taskStatusStyles[t.status]
                    )}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {showAddNote ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddNote ? "Cancel" : "Add"}
            </button>
          </div>

          {showAddNote && (
            <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Note content..."
                rows={4}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={addNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Add Note
              </button>
            </div>
          )}

          {course.notes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes for this course yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 group hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {n.title}
                    </h3>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                    {n.content || "No content"}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Updated {new Date(n.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
