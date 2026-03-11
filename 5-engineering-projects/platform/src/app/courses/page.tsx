"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Trash2, X } from "lucide-react";
import clsx from "clsx";

type Track = {
  id: string;
  title: string;
  color: string;
};

type Course = {
  id: string;
  title: string;
  code: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  track: { title: string; color: string };
  _count: { resources: number; tasks: number; notes: number };
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newTrackId, setNewTrackId] = useState("");
  const [filterTrack, setFilterTrack] = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/tracks").then((r) => r.json()),
    ])
      .then(([c, t]) => {
        setCourses(c);
        setTracks(t);
        if (t.length > 0) setNewTrackId(t[0].id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addCourse = async () => {
    if (!newTitle.trim() || !newTrackId) return;
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), code: newCode.trim(), trackId: newTrackId }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewCode("");
      setShowAdd(false);
      const data = await fetch("/api/courses").then((r) => r.json());
      setCourses(data);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: status as Course["status"] } : c))
      );
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course and all its resources/tasks/notes?")) return;
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const statusColors = {
    NOT_STARTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  const statusOptions = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

  const filtered =
    filterTrack === "ALL"
      ? courses
      : courses.filter((c) => c.track?.title === filterTrack);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {courses.length} courses across {tracks.length} tracks
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "Add Course"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Course title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Code (e.g. ECE 301)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newTrackId}
              onChange={(e) => setNewTrackId(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addCourse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Create Course
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterTrack("ALL")}
          className={clsx(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            filterTrack === "ALL"
              ? "bg-gray-900 dark:bg-white text-white dark:text-black"
              : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
          )}
        >
          All
        </button>
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterTrack(t.title)}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              filterTrack === t.title
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/courses/${course.id}`)}
              className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-shadow group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={course.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); updateStatus(course.id, e.target.value); }}
                    className={clsx(
                      "text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer appearance-none",
                      statusColors[course.status]
                    )}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {course.code} &bull;{" "}
                <span className="text-blue-500">{course.track?.title || "General"}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {course._count?.resources || 0}
                  </strong>{" "}
                  Resources
                </span>
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {course._count?.tasks || 0}
                  </strong>{" "}
                  Tasks
                </span>
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {course._count?.notes || 0}
                  </strong>{" "}
                  Notes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
