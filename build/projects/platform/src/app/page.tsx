"use client";

import { useState, useEffect } from "react";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { BookOpen, CheckSquare, Clock, Trophy } from "lucide-react";

type Track = {
  id: string;
  title: string;
  color: string;
  _count: { courses: number };
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  course?: { title: string; code: string } | null;
};

type SessionStats = {
  totalSessions: number;
  totalHours: number;
  avgMinutesPerSession: number;
};

export default function Dashboard() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    totalHours: 0,
    avgMinutesPerSession: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tracksRes, tasksRes, sessionsRes] = await Promise.all([
          fetch("/api/tracks"),
          fetch("/api/tasks"),
          fetch("/api/sessions?days=7"),
        ]);

        if (tracksRes.ok) setTracks(await tracksRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessionStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const activeCourses = tracks.reduce((sum, t) => sum + t._count.courses, 0);
  const streak = sessionStats.totalSessions;

  const upNext = tasks
    .filter((t) => t.status === "TODO")
    .slice(0, 4);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/planner"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Open Planner
          </a>
          <a
            href="/notes"
            className="px-4 py-2 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Quick Note
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Study Hours (7d)"
          value={`${sessionStats.totalHours}h`}
          color="blue"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5" />}
          label="Tasks Done"
          value={`${doneTasks}/${totalTasks}`}
          color="green"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Total Courses"
          value={String(activeCourses)}
          color="purple"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Sessions (7d)"
          value={String(streak)}
          color="orange"
        />
      </div>

      {tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Track Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <ProgressCard
                key={track.id}
                title={track.title}
                value={tasks.filter((t) => t.status === "DONE" && t.course).length}
                total={Math.max(track._count.courses, 1)}
                color={track.color}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Up Next
          </h2>
          <div className="space-y-3">
            {upNext.length === 0 ? (
              <p className="text-sm text-gray-500">
                No tasks in the queue. Add some in the{" "}
                <a href="/planner" className="text-blue-500 hover:underline">
                  Planner
                </a>
                .
              </p>
            ) : (
              upNext.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-darkBg rounded-md border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.priority === "HIGH"
                          ? "bg-red-500"
                          : task.priority === "MEDIUM"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                  </div>
                  {task.course && (
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                      {task.course.code || task.course.title}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
              <h3 className="font-medium text-indigo-400 text-sm uppercase tracking-wide mb-1">
                This Week
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {sessionStats.totalHours}h studied &bull;{" "}
                {sessionStats.totalSessions} sessions
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {sessionStats.avgMinutesPerSession > 0
                  ? `Avg ${sessionStats.avgMinutesPerSession} min/session`
                  : "Log your first session to start tracking"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
