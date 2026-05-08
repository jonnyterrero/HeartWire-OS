"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { LEETCODE_PROBLEMS } from "@/lib/curated";
import { useCuratedProgress } from "@/lib/curated-progress";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";

const DIFFS = ["easy", "medium", "hard"] as const;

const DIFF_CLS: Record<(typeof DIFFS)[number], string> = {
  easy: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50",
  medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50",
  hard: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-700/50",
};

export default function LeetCodePage() {
  const { isCompleted, toggle, completedCount, hydrated } = useCuratedProgress();
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<Set<string>>(new Set());
  const [bioOnly, setBioOnly] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const filtered = useMemo(() => {
    return LEETCODE_PROBLEMS.filter((p) => {
      if (search) {
        const haystack = `${p.title} ${p.number} ${p.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (diffFilter.size > 0 && !diffFilter.has(p.difficulty)) return false;
      if (
        bioOnly &&
        !p.track.includes("bioinformatics") &&
        !p.track.includes("biomedical-interview")
      )
        return false;
      if (hideDone && isCompleted(p.id)) return false;
      return true;
    });
  }, [search, diffFilter, bioOnly, hideDone, isCompleted]);

  const totalDone = completedCount(LEETCODE_PROBLEMS.map((p) => p.id));

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          LeetCode practice
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Curated DNA / sliding-window / DSA problems for biomedical and coding
          interviews. {hydrated ? `${totalDone} of ${LEETCODE_PROBLEMS.length} done` : ""}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {DIFFS.map((d) => {
          const total = LEETCODE_PROBLEMS.filter((p) => p.difficulty === d).length;
          const done = LEETCODE_PROBLEMS.filter(
            (p) => p.difficulty === d && isCompleted(p.id)
          ).length;
          return (
            <div
              key={d}
              className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface"
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded border text-xs capitalize",
                    DIFF_CLS[d]
                  )}
                >
                  {d}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(done / Math.max(1, total)) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <section className="border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, number, or tag…"
          className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {DIFFS.map((d) => {
            const active = diffFilter.has(d);
            return (
              <button
                key={d}
                onClick={() =>
                  setDiffFilter((s) => {
                    const next = new Set(s);
                    if (next.has(d)) next.delete(d);
                    else next.add(d);
                    return next;
                  })
                }
                className={clsx(
                  "px-2 py-1 rounded border capitalize",
                  active ? DIFF_CLS[d] : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {d}
              </button>
            );
          })}
          <label className="flex items-center gap-1.5 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={bioOnly}
              onChange={(e) => setBioOnly(e.target.checked)}
            />
            Bio-relevant only
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
            />
            Hide completed
          </label>
          <span className="ml-auto text-gray-500 tabular-nums">
            {filtered.length} problems
          </span>
        </div>
      </section>

      <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-darkSurface">
        {filtered.map((p) => {
          const done = isCompleted(p.id);
          return (
            <li
              key={p.id}
              className={clsx(
                "px-3 py-2.5 flex items-start gap-3 text-sm",
                done && "opacity-60"
              )}
            >
              <button
                onClick={() => toggle(p.id)}
                className="mt-0.5 text-gray-400 hover:text-primary"
                aria-label={done ? "Mark incomplete" : "Mark complete"}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <span className="w-12 shrink-0 text-gray-500 tabular-nums">
                #{p.number}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-gray-900 dark:text-white hover:text-primary hover:underline"
                  >
                    {p.title}
                  </a>
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 rounded border text-[10px] capitalize",
                      DIFF_CLS[p.difficulty]
                    )}
                  >
                    {p.difficulty}
                  </span>
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-gray-500 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{p.why}</p>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-primary shrink-0 mt-0.5"
                aria-label="Open"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
