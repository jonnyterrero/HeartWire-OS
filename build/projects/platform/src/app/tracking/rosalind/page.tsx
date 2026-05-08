"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ROSALIND_PROBLEMS } from "@/lib/curated";
import { useCuratedProgress } from "@/lib/curated-progress";
import { CheckCircle2, Circle, ExternalLink, Dna } from "lucide-react";

const DIFFS = ["easy", "medium", "hard"] as const;

const DIFF_CLS: Record<(typeof DIFFS)[number], string> = {
  easy: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50",
  medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50",
  hard: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-700/50",
};

export default function RosalindPage() {
  const { isCompleted, toggle, completedCount, hydrated } = useCuratedProgress();
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<Set<string>>(new Set());
  const [hideDone, setHideDone] = useState(false);

  const filtered = useMemo(() => {
    return ROSALIND_PROBLEMS.filter((p) => {
      if (search) {
        const haystack = `${p.title} ${p.code}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (diffFilter.size > 0 && !diffFilter.has(p.difficulty)) return false;
      if (hideDone && isCompleted(p.id)) return false;
      return true;
    });
  }, [search, diffFilter, hideDone, isCompleted]);

  const total = ROSALIND_PROBLEMS.length;
  const done = completedCount(ROSALIND_PROBLEMS.map((p) => p.id));

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-primary" />
            Rosalind
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bioinformatics problems from DNA counting to genome assembly. Each
            builds on the last — work them in order.
          </p>
        </div>
        {hydrated && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {done}/{total}
            </div>
            <div className="mt-1 h-1 w-32 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <section className="border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or title…"
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

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((p) => {
          const completed = isCompleted(p.id);
          return (
            <div
              key={p.id}
              className={clsx(
                "border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface flex items-start gap-3",
                completed && "opacity-60"
              )}
            >
              <button
                onClick={() => toggle(p.id)}
                className="mt-0.5 text-gray-400 hover:text-primary"
              >
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {p.code}
                  </code>
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
                </div>
                <p className="text-xs text-gray-500 mt-1">{p.why}</p>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
