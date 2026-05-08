"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, TrendingDown, Plus } from "lucide-react";

type Session = {
  id: string;
  duration: number;
  durationMinutes: number | null;
  notes: string | null;
  date: string;
  trackId: string | null;
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

export default function StudyHoursPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration, notes: notes || undefined }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      setNotes("");
      setDuration(30);
      load();
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Study Hours
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            7-day rolling window
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded hover:opacity-90 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log session
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-3 bg-white dark:bg-darkSurface"
        >
          <div className="flex items-end gap-3">
            <label className="flex-1">
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
            <label className="flex-[2]">
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
            <button
              type="submit"
              disabled={submitting || duration < 1}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
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
              return (
                <li
                  key={s.id}
                  className="px-3 py-2 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-gray-900 dark:text-white font-medium">
                      {minutes}m
                    </span>
                    <span className="text-gray-500">
                      {new Date(s.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-gray-500 truncate max-w-md">
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
