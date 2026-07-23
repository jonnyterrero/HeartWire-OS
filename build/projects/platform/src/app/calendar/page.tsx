"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import clsx from "clsx";
import { expandOccurrences } from "@/lib/recurrence";

type Aggregated = {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }[];
  events: {
    id: string;
    title: string;
    eventType: string;
    startTime: string | null;
    endTime: string | null;
    allDay: boolean;
    recurrenceRule: string | null;
  }[];
  studySessions: {
    id: string;
    duration: number;
    durationMinutes: number | null;
    startedAt: string | null;
    date: string;
    notes: string | null;
  }[];
  examSessions: {
    id: string;
    examType: string;
    discipline: string | null;
    topic: string | null;
    sessionDate: string | null;
  }[];
};

type DayItem =
  | { kind: "task"; id: string; title: string; ts: Date }
  | { kind: "event"; id: string; title: string; ts: Date; allDay: boolean }
  | { kind: "study"; id: string; title: string; ts: Date }
  | { kind: "exam"; id: string; title: string; ts: Date };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [data, setData] = useState<Aggregated | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState("CUSTOM");
  const [evStart, setEvStart] = useState("");
  const [evEnd, setEvEnd] = useState("");

  async function load(monthCursor: Date) {
    setLoading(true);
    const from = startOfMonth(monthCursor).toISOString();
    const to = endOfMonth(monthCursor).toISOString();
    const res = await fetch(
      `/api/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load(cursor);
  }, [cursor]);

  const items: DayItem[] = useMemo(() => {
    if (!data) return [];
    const out: DayItem[] = [];
    for (const t of data.tasks) {
      if (t.dueDate) {
        out.push({
          kind: "task",
          id: t.id,
          title: `Task: ${t.title}`,
          ts: new Date(t.dueDate),
        });
      }
    }
    const rangeStart = startOfMonth(cursor);
    const rangeEnd = endOfMonth(cursor);
    for (const e of data.events) {
      // Expand recurring events (weekly study blocks) into per-day
      // occurrences within the visible month; one-off events yield their
      // single anchor. Keys stay unique via the occurrence timestamp.
      for (const ts of expandOccurrences(e, rangeStart, rangeEnd)) {
        out.push({
          kind: "event",
          id: `${e.id}:${ts.getTime()}`,
          title: e.title,
          ts,
          allDay: e.allDay,
        });
      }
    }
    for (const s of data.studySessions) {
      const ts = s.startedAt ? new Date(s.startedAt) : new Date(s.date);
      out.push({
        kind: "study",
        id: s.id,
        title: `Study: ${s.durationMinutes ?? s.duration}m`,
        ts,
      });
    }
    for (const x of data.examSessions) {
      if (x.sessionDate) {
        out.push({
          kind: "exam",
          id: x.id,
          title: `${x.examType}${x.discipline ? ` · ${x.discipline.charAt(0)}` : ""}${x.topic ? ` — ${x.topic}` : ""}`,
          ts: new Date(x.sessionDate),
        });
      }
    }
    return out;
  }, [data, cursor]);

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startDayOfWeek = first.getDay();
    const last = endOfMonth(cursor);
    const totalDays = last.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let i = 1; i <= totalDays; i++)
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    for (const it of items) {
      const key = it.ts.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }, [items]);

  const today = new Date();
  const selectedItems = (itemsByDay.get(selected.toDateString()) ?? []).sort(
    (a, b) => a.ts.getTime() - b.ts.getTime()
  );
  const upcoming = useMemo(() => {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    return items
      .filter((i) => i.ts >= today && i.ts <= horizon)
      .sort((a, b) => a.ts.getTime() - b.ts.getTime())
      .slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      title: evTitle,
      eventType: evType,
    };
    if (evStart) body.startTime = new Date(evStart).toISOString();
    if (evEnd) body.endTime = new Date(evEnd).toISOString();
    const res = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setEvTitle("");
      setEvStart("");
      setEvEnd("");
      setShowForm(false);
      load(cursor);
    }
  }

  return (
    <div className="max-w-7xl">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
              setSelected(d);
            }}
            className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Today
          </button>
          <button
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New event
          </button>
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={submitEvent}
          className="border border-gray-200 dark:border-gray-800 rounded-md p-4 mb-4 space-y-3 bg-white dark:bg-darkSurface"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              required
              placeholder="Title"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              className="md:col-span-2 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            />
            <select
              value={evType}
              onChange={(e) => setEvType(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            >
              <option value="CUSTOM">Custom</option>
              <option value="DEADLINE">Deadline</option>
              <option value="STUDY_SESSION">Study session</option>
              <option value="FE_PE_PRACTICE">FE/PE practice</option>
              <option value="HABIT">Habit</option>
              <option value="JOURNAL">Journal</option>
            </select>
            <button
              type="submit"
              disabled={!evTitle.trim()}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
            <input
              type="datetime-local"
              value={evStart}
              onChange={(e) => setEvStart(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            />
            <input
              type="datetime-local"
              value={evEnd}
              onChange={(e) => setEvEnd(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            />
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden bg-white dark:bg-darkSurface">
          <div className="grid grid-cols-7 text-[11px] font-semibold text-gray-500 uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-800"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((cell, i) => {
              if (!cell) return <div key={i} className="h-24 border-t border-r border-gray-100 dark:border-gray-800" />;
              const dayKey = cell.toDateString();
              const dayItems = itemsByDay.get(dayKey) ?? [];
              const isToday = isSameDay(cell, today);
              const isSelected = isSameDay(cell, selected);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(cell)}
                  className={clsx(
                    "h-24 p-1 text-left text-xs border-t border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors",
                    isSelected &&
                      "bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/40"
                  )}
                >
                  <div
                    className={clsx(
                      "text-[11px] font-medium",
                      isToday ? "text-primary" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {cell.getDate()}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {dayItems.slice(0, 2).map((it) => (
                      <div
                        key={`${it.kind}-${it.id}`}
                        className={clsx(
                          "truncate text-[10px] px-1 py-0.5 rounded",
                          it.kind === "task" &&
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
                          it.kind === "event" &&
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
                          it.kind === "study" &&
                            "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
                          it.kind === "exam" &&
                            "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                        )}
                      >
                        {it.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-[10px] text-gray-500">
                        +{dayItems.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface">
            <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {selected.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            {selectedItems.length === 0 ? (
              <p className="text-xs text-gray-500">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-1">
                {selectedItems.map((it) => (
                  <li
                    key={`${it.kind}-${it.id}`}
                    className="text-xs flex items-start gap-2"
                  >
                    <span className="text-[10px] text-gray-500 tabular-nums shrink-0 mt-0.5">
                      {it.kind === "event" && (it as { allDay?: boolean }).allDay
                        ? "All day"
                        : it.ts.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                    <span className="text-gray-700 dark:text-gray-200">
                      {it.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface">
            <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upcoming (next 14 days)
            </h2>
            {loading ? (
              <p className="text-xs text-gray-500">Loading…</p>
            ) : upcoming.length === 0 ? (
              <p className="text-xs text-gray-500">Nothing upcoming.</p>
            ) : (
              <ul className="space-y-1">
                {upcoming.map((it) => (
                  <li
                    key={`${it.kind}-${it.id}`}
                    className="text-xs flex items-start gap-2"
                  >
                    <span className="text-[10px] text-gray-500 tabular-nums shrink-0 mt-0.5">
                      {it.ts.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-gray-700 dark:text-gray-200 truncate">
                      {it.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
