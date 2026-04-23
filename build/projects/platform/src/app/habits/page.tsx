"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Flame, Target } from "lucide-react";
import clsx from "clsx";

type Completion = { id: string; completedDate: string };
type Habit = {
  id: string;
  name: string;
  color: string;
  targetDays: number[];
  completions: Completion[];
};

const COLORS = [
  { name: "blue", bg: "bg-blue-500", ring: "ring-blue-500/30" },
  { name: "green", bg: "bg-emerald-500", ring: "ring-emerald-500/30" },
  { name: "purple", bg: "bg-purple-500", ring: "ring-purple-500/30" },
  { name: "red", bg: "bg-red-500", ring: "ring-red-500/30" },
  { name: "orange", bg: "bg-orange-500", ring: "ring-orange-500/30" },
  { name: "pink", bg: "bg-pink-500", ring: "ring-pink-500/30" },
  { name: "yellow", bg: "bg-yellow-500", ring: "ring-yellow-500/30" },
  { name: "teal", bg: "bg-teal-500", ring: "ring-teal-500/30" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7Days(): { date: string; dayOfWeek: number; label: string; isToday: boolean }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      dayOfWeek: d.getDay(),
      label: i === 0 ? "Today" : i === 1 ? "Yesterday" : DAY_LABELS[d.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

function getStreak(completions: Completion[]): number {
  const dates = new Set(completions.map((c) => c.completedDate.split("T")[0]));
  let streak = 0;
  const d = new Date();
  const todayStr = d.toISOString().split("T")[0];
  if (!dates.has(todayStr)) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const dateStr = d.toISOString().split("T")[0];
    if (dates.has(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getColorClasses(color: string) {
  return COLORS.find((c) => c.name === color) || COLORS[0];
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");

  const days = getLast7Days();

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits)
      .finally(() => setLoading(false));
  }, []);

  const addHabit = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    if (res.ok) {
      const habit = await res.json();
      setHabits((prev) => [...prev, habit]);
      setNewName("");
      setShowAdd(false);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm("Archive this habit?")) return;
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleDay = async (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const existing = h.completions.find(
          (c) => c.completedDate.split("T")[0] === date
        );
        if (existing) {
          return {
            ...h,
            completions: h.completions.filter((c) => c.id !== existing.id),
          };
        } else {
          return {
            ...h,
            completions: [
              ...h.completions,
              { id: `temp-${Date.now()}`, completedDate: date },
            ],
          };
        }
      })
    );

    const res = await fetch(`/api/habits/${habitId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });

    if (!res.ok) {
      const data = await fetch("/api/habits").then((r) => r.json());
      setHabits(data);
    }
  };

  const totalToday = habits.filter((h) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return h.completions.some((c) => c.completedDate.split("T")[0] === todayStr);
  }).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64 text-gray-500">
        Loading habits...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Habits
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {totalToday}/{habits.length} completed today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "New Habit"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Habit name (e.g. Study 2 hours, Exercise, Read)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Color:</span>
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setNewColor(c.name)}
                className={clsx(
                  "w-6 h-6 rounded-full transition-all",
                  c.bg,
                  newColor === c.name
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-darkBg " + c.ring + " scale-110"
                    : "opacity-60 hover:opacity-100"
                )}
              />
            ))}
          </div>
          <button
            onClick={addHabit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Create Habit
          </button>
        </div>
      )}

      {habits.length > 0 && (
        <div className="flex items-center mb-2 pl-4">
          <div className="flex-1" />
          <div className="flex gap-1 mr-12">
            {days.map((day) => (
              <div
                key={day.date}
                className={clsx(
                  "w-9 text-center text-[10px] font-medium",
                  day.isToday ? "text-blue-500" : "text-gray-400"
                )}
              >
                {day.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No habits yet. Create one to start building consistency.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const colorClasses = getColorClasses(habit.color);
            const streak = getStreak(habit.completions);
            const completedDates = new Set(
              habit.completions.map((c) => c.completedDate.split("T")[0])
            );

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 group hover:shadow-sm transition-shadow"
              >
                <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", colorClasses.bg)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {habit.name}
                  </p>
                </div>

                {streak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 flex-shrink-0">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{streak}</span>
                  </div>
                )}

                <div className="flex gap-1 flex-shrink-0">
                  {days.map((day) => {
                    const isCompleted = completedDates.has(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleDay(habit.id, day.date)}
                        className={clsx(
                          "w-9 h-9 rounded-md border-2 transition-all flex items-center justify-center text-xs font-bold",
                          isCompleted
                            ? clsx(colorClasses.bg, "border-transparent text-white scale-100")
                            : "border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                        )}
                      >
                        {isCompleted ? "✓" : day.date.split("-")[2]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
