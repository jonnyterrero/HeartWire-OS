"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, TrendingUp, TrendingDown, Plus, History } from "lucide-react";

type Session = {
  id: string;
  duration: number;
  durationMinutes: number | null;
  notes: string | null;
  date: string;
  trackId: string | null;
  courseId: string | null;
  sessionType: string | null;
};
type Stats = {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  prevTotalMinutes: number;
  prevTotalHours: number;
  trendDelta: number;
  trendDeltaHours: number;
  avgMinutesPerSession: number;
};
type CourseOption = {
  id: string;
  title: string;
  code: string | null;
  track: { title: string; color: string };
};

function todayInputValue() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function StudyHoursPage() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [retroMode, setRetroMode] = useState(false);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [sessionDate, setSessionDate] = useState(todayInputValue);
  const [sessionTime, setSessionTime] = useState("12:00");
  const [courseId, setCourseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/sessions?days=7");
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions);
      setStats(data.stats);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/courses")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCourses)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("retro") === "1") {
      setRetroMode(true);
      setShowForm(true);
    }
  }, [searchParams]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      duration,
      notes: notes || undefined,
    };

    if (retroMode && sessionDate) {
      const [y, m, d] = sessionDate.split("-").map(Number);
      const [hh, mm] = sessionTime.split(":").map(Number);
      const when = new Date(y, m - 1, d, hh, mm, 0, 0);
      if (Number.isNaN(when.getTime())) {
        setError("Invalid date or time");
        setSubmitting(false);
        return;
      }
      if (when.getTime() > Date.now()) {
        setError("Session date cannot be in the future");
        setSubmitting(false);
        return;
      }
      payload.date = when.toISOString();
      payload.startedAt = when.toISOString();
      const ended = new Date(when.getTime() + duration * 60 * 1000);
      payload.endedAt = ended.toISOString();
    }

    if (courseId) payload.courseId = courseId;

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      setNotes("");
      setDuration(30);
      setCourseId("");
      setSessionDate(todayInputValue());
      setSessionTime("12:00");
      setRetroMode(false);
      load();
    } else {
      try {
        const data = await res.json();
        setError(data?.error ?? "Failed to save session");
      } catch {
        setError("Failed to save session");
      }
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Study Hours
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            7-day rolling window
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRetroMode(false);
              setShowForm((v) => !v);
            }}
            className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded hover:opacity-90 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log session
          </button>
          <button
            onClick={() => {
              setRetroMode(true);
              setShowForm(true);
            }}
            className="px-3 py-1.5 text-sm font-medium rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Log past session
          </button>
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-3 bg-white dark:bg-darkSurface"
        >
          {retroMode && (
            <p className="text-xs text-gray-500">
              Backfill a study session from a previous day.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label>
              <span className="block text-xs text-gray-500 mb-1">
                Duration (min)
              </span>
              <input
                type="number"
                min={1}
                max={1440}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
                required
              />
            </label>
            {retroMode && (
              <>
                <label>
                  <span className="block text-xs text-gray-500 mb-1">Date</span>
                  <input
                    type="date"
                    value={sessionDate}
                    max={todayInputValue()}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
                    required
                  />
                </label>
                <label>
                  <span className="block text-xs text-gray-500 mb-1">
                    Start time
                  </span>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
                    required
                  />
                </label>
              </>
            )}
            <label className={retroMode ? "" : "sm:col-span-2"}>
              <span className="block text-xs text-gray-500 mb-1">
                Course (optional)
              </span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
              >
                <option value="">— None —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} · ` : ""}
                    {c.title} ({c.track.title})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || duration < 1}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save session"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRetroMode(false);
                setError(null);
              }}
              className="px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat
          label="Hours this week"
          value={stats ? `${stats.totalHours}h` : "—"}
          icon={<Clock className="w-4 h-4" />}
        />
        <Stat
          label="Sessions"
          value={stats ? String(stats.totalSessions) : "—"}
          icon={<Clock className="w-4 h-4" />}
        />
        <Stat
          label="Trend vs prior 7d"
          value={
            stats
              ? `${stats.trendDeltaHours >= 0 ? "+" : ""}${stats.trendDeltaHours}h`
              : "—"
          }
          icon={
            (stats?.trendDelta ?? 0) >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )
          }
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Recent sessions
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No sessions in the last 7 days.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md">
            {sessions.map((s) => {
              const minutes = s.durationMinutes ?? s.duration;
              const courseLabel = courses.find((c) => c.id === s.courseId);
              return (
                <li
                  key={s.id}
                  className="px-3 py-2 flex items-center justify-between text-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="tabular-nums text-gray-900 dark:text-white font-medium shrink-0">
                      {minutes}m
                    </span>
                    <span className="text-gray-500 shrink-0">
                      {new Date(s.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {courseLabel && (
                      <span className="text-[11px] text-primary truncate">
                        {courseLabel.code || courseLabel.title}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 truncate max-w-md text-right">
                    {s.notes || "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}
