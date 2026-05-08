"use client";

import { useEffect, useState } from "react";
import { Plus, Target } from "lucide-react";

type ExamSession = {
  id: string;
  examType: string;
  discipline: string | null;
  topic: string | null;
  source: string | null;
  questionsAttempted: number | null;
  questionsCorrect: number | null;
  durationMinutes: number | null;
  notes: string | null;
  sessionDate: string | null;
};
type Stats = {
  totalSessions: number;
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
};

export default function FePePage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [examType, setExamType] = useState<"FE" | "PE">("FE");
  const [discipline, setDiscipline] = useState<"" | "ELECTRICAL" | "MECHANICAL">("");
  const [topic, setTopic] = useState("");
  const [questionsAttempted, setQuestionsAttempted] = useState<number | "">("");
  const [questionsCorrect, setQuestionsCorrect] = useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/exam-practice");
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
    const body: Record<string, unknown> = { examType };
    if (discipline) body.discipline = discipline;
    if (topic) body.topic = topic;
    if (questionsAttempted !== "") body.questionsAttempted = questionsAttempted;
    if (questionsCorrect !== "") body.questionsCorrect = questionsCorrect;
    if (durationMinutes !== "") body.durationMinutes = durationMinutes;
    const res = await fetch("/api/exam-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      setTopic("");
      setQuestionsAttempted("");
      setQuestionsCorrect("");
      setDurationMinutes("");
      load();
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            FE/PE Practice
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exam preparation log
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded hover:opacity-90 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log practice
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-3 bg-white dark:bg-darkSurface"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Exam">
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as "FE" | "PE")}
                className={inputCls}
              >
                <option value="FE">FE</option>
                <option value="PE">PE</option>
              </select>
            </Field>
            <Field label="Discipline">
              <select
                value={discipline}
                onChange={(e) =>
                  setDiscipline(e.target.value as typeof discipline)
                }
                className={inputCls}
              >
                <option value="">—</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="MECHANICAL">Mechanical</option>
              </select>
            </Field>
            <Field label="Topic">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(
                    e.target.value === "" ? "" : parseInt(e.target.value)
                  )
                }
                className={inputCls}
              />
            </Field>
            <Field label="Questions attempted">
              <input
                type="number"
                min={0}
                value={questionsAttempted}
                onChange={(e) =>
                  setQuestionsAttempted(
                    e.target.value === "" ? "" : parseInt(e.target.value)
                  )
                }
                className={inputCls}
              />
            </Field>
            <Field label="Questions correct">
              <input
                type="number"
                min={0}
                value={questionsCorrect}
                onChange={(e) =>
                  setQuestionsCorrect(
                    e.target.value === "" ? "" : parseInt(e.target.value)
                  )
                }
                className={inputCls}
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save session"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat
          label="Total sessions"
          value={stats ? String(stats.totalSessions) : "—"}
        />
        <Stat
          label="Questions attempted"
          value={stats ? String(stats.totalAttempted) : "—"}
        />
        <Stat
          label="Accuracy"
          value={stats ? `${stats.accuracy}%` : "—"}
          icon={<Target className="w-4 h-4" />}
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          History
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No sessions logged yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md">
            {sessions.map((s) => {
              const acc =
                s.questionsAttempted && s.questionsCorrect != null
                  ? `${Math.round(
                      (s.questionsCorrect / s.questionsAttempted) * 100
                    )}%`
                  : "—";
              return (
                <li
                  key={s.id}
                  className="px-3 py-2 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {s.examType}
                      {s.discipline ? ` · ${s.discipline.charAt(0)}` : ""}
                    </span>
                    <span className="truncate text-gray-700 dark:text-gray-200">
                      {s.topic || "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 tabular-nums">
                    <span>
                      {s.questionsCorrect ?? 0}/{s.questionsAttempted ?? 0}
                    </span>
                    <span>{acc}</span>
                    <span>
                      {s.sessionDate
                        ? new Date(s.sessionDate).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

const inputCls =
  "w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
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
