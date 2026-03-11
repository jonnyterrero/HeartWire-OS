"use client";

import { useState, useEffect } from "react";
import { Hammer, ExternalLink } from "lucide-react";
import clsx from "clsx";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  course?: { title: string; code: string } | null;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState("ALL");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) setTasks(await res.json());
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filtered = tasks.filter(
    (t) => filterPriority === "ALL" || t.priority === filterPriority
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {tasks.length} project tasks across your curriculum.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["ALL", "LOW", "MEDIUM", "HIGH"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              filterPriority === p
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            {p === "ALL" ? "All" : p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <Hammer className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {task.course?.code || task.course?.title || "General"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={clsx("text-xs font-medium px-2 py-1 rounded", priorityColors[task.priority])}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-500">{statusLabels[task.status] || task.status}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No projects found.</div>
          )}
        </div>
      )}
    </div>
  );
}
