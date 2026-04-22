"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, RotateCcw, Clock, Timer } from "lucide-react";
import clsx from "clsx";

type Mode = "pomodoro" | "stopwatch";

const POMODORO_PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "50 min", seconds: 50 * 60 },
  { label: "90 min", seconds: 90 * 60 },
];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function StudyTimer() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const remaining = Math.max(targetSeconds - elapsed, 0);
  const isPomodoroDone = mode === "pomodoro" && elapsed >= targetSeconds && targetSeconds > 0;
  const displayTime = mode === "pomodoro" ? remaining : elapsed;
  const progress = mode === "pomodoro" && targetSeconds > 0 ? Math.min(elapsed / targetSeconds, 1) : 0;

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;
    const now = Date.now();
    const newElapsed = Math.floor((now - startTimeRef.current) / 1000);
    setElapsed(newElapsed);
  }, []);

  useEffect(() => {
    if (running) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - elapsed * 1000;
      }
      intervalRef.current = setInterval(tick, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  useEffect(() => {
    if (isPomodoroDone && running) {
      setRunning(false);
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1ubJOPlIV0aW6Dj5GNf3Bzd4aKiIF0bXJ/hoqIgXVvcHyEh4aBdXBwfoWIh4F1b3B+hYiGgXVwcH6FiIeBdW9wfoWIhoF1cHB+hYiH");
        audio.play().catch(() => {});
      } catch {}
    }
  }, [isPomodoroDone, running]);

  const start = () => {
    setSaved(false);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    startTimeRef.current = null;
    setSaved(false);
  };

  const stop = async () => {
    setRunning(false);
    const minutes = Math.max(Math.round(elapsed / 60), 1);
    if (minutes < 1) return;

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duration: minutes,
        notes: sessionNote.trim() || `${mode === "pomodoro" ? "Pomodoro" : "Stopwatch"} session`,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => {
        reset();
        setSessionNote("");
      }, 2000);
    }
  };

  const switchMode = (newMode: Mode) => {
    if (running) return;
    setMode(newMode);
    reset();
  };

  const ringColor = isPomodoroDone
    ? "text-green-500"
    : running
    ? "text-blue-500"
    : "text-gray-300 dark:text-gray-700";

  return (
    <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-center gap-1 mb-6">
        <button
          onClick={() => switchMode("pomodoro")}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-l-md text-xs font-medium border transition-colors",
            mode === "pomodoro"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-darkBg text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
          )}
        >
          <Timer className="w-3.5 h-3.5" /> Pomodoro
        </button>
        <button
          onClick={() => switchMode("stopwatch")}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-r-md text-xs font-medium border transition-colors",
            mode === "stopwatch"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-darkBg text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
          )}
        >
          <Clock className="w-3.5 h-3.5" /> Stopwatch
        </button>
      </div>

      {mode === "pomodoro" && !running && elapsed === 0 && (
        <div className="flex justify-center gap-2 mb-4">
          {POMODORO_PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => setTargetSeconds(p.seconds)}
              className={clsx(
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                targetSeconds === p.seconds
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {mode === "pomodoro" && (
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                strokeWidth="4"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                className={clsx("transition-all duration-500", ringColor)}
                style={{ stroke: "currentColor" }}
              />
            </svg>
          )}
          <div className="text-center z-10">
            <p
              className={clsx(
                "font-mono font-bold tabular-nums",
                isPomodoroDone ? "text-green-500 text-4xl" : "text-gray-900 dark:text-white text-5xl"
              )}
            >
              {formatTime(displayTime)}
            </p>
            {isPomodoroDone && (
              <p className="text-green-500 text-xs font-medium mt-1">Complete!</p>
            )}
            {running && elapsed > 0 && !isPomodoroDone && (
              <p className="text-gray-400 text-xs mt-1">
                {Math.round(elapsed / 60)} min elapsed
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="What are you working on?"
        value={sessionNote}
        onChange={(e) => setSessionNote(e.target.value)}
        className="w-full px-3 py-2 mb-4 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-center gap-3">
        {!running && !isPomodoroDone && !saved && (
          <button
            onClick={start}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            {elapsed > 0 ? "Resume" : "Start"}
          </button>
        )}

        {running && (
          <button
            onClick={pause}
            className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        )}

        {elapsed > 0 && !saved && (
          <>
            <button
              onClick={stop}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Square className="w-4 h-4" /> Save Session
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </>
        )}

        {saved && (
          <div className="px-6 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm">
            ✓ Session logged ({Math.round(elapsed / 60)} min)
          </div>
        )}
      </div>
    </div>
  );
}
