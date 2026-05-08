"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  PROJECT_LADDERS,
  PROJECT_GROUP_LABELS,
  type ProjectGroup,
} from "@/lib/curated";
import { useCuratedProgress } from "@/lib/curated-progress";
import { CheckCircle2, Circle, Layers } from "lucide-react";

const LEVEL_LABEL: Record<1 | 2 | 3, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};
const LEVEL_CLS: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50",
  2: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50",
  3: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-700/50",
};

const GROUP_ORDER: ProjectGroup[] = [
  "software-cs",
  "ee",
  "math",
  "physics-chem",
  "bme-mech",
];

export default function ProjectsPage() {
  const { isCompleted, toggle, completedCount, hydrated } = useCuratedProgress();
  const [groupFilter, setGroupFilter] = useState<ProjectGroup | "all">("all");
  const [hideDone, setHideDone] = useState(false);

  const allItemIds = useMemo(
    () =>
      PROJECT_LADDERS.flatMap((l) =>
        l.levels.map((lv) => `${l.id}-L${lv.level}`)
      ),
    []
  );
  const totalDone = completedCount(allItemIds);

  const visible = useMemo(() => {
    return PROJECT_LADDERS.filter(
      (l) => groupFilter === "all" || l.trackGroup === groupFilter
    );
  }, [groupFilter]);

  const grouped = useMemo(() => {
    const m = new Map<ProjectGroup, typeof PROJECT_LADDERS>();
    for (const l of visible) {
      const arr = m.get(l.trackGroup) ?? [];
      arr.push(l);
      m.set(l.trackGroup, arr);
    }
    return m;
  }, [visible]);

  return (
    <div className="max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Projects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Beginner / intermediate / advanced project ideas for every subject.
          Pick one at your level, ship it, mark it done.{" "}
          {hydrated && (
            <span className="tabular-nums">
              {totalDone}/{allItemIds.length} completed
            </span>
          )}
        </p>
      </header>

      <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setGroupFilter("all")}
          className={clsx(
            "px-2.5 py-1 rounded border",
            groupFilter === "all"
              ? "bg-primary text-white border-primary"
              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
          )}
        >
          All groups
        </button>
        {GROUP_ORDER.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={clsx(
              "px-2.5 py-1 rounded border",
              groupFilter === g
                ? "bg-primary text-white border-primary"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            )}
          >
            {PROJECT_GROUP_LABELS[g]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => setHideDone(e.target.checked)}
          />
          Hide completed
        </label>
      </div>

      <div className="space-y-8">
        {GROUP_ORDER.filter((g) => grouped.has(g)).map((g) => (
          <section key={g}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              {PROJECT_GROUP_LABELS[g]}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {grouped.get(g)!.map((ladder) => {
                const filteredLevels = hideDone
                  ? ladder.levels.filter(
                      (lv) => !isCompleted(`${ladder.id}-L${lv.level}`)
                    )
                  : ladder.levels;
                if (filteredLevels.length === 0) return null;
                return (
                  <div
                    key={ladder.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {ladder.category}
                    </h3>
                    <ul className="space-y-2">
                      {filteredLevels.map((lv) => {
                        const id = `${ladder.id}-L${lv.level}`;
                        const done = isCompleted(id);
                        return (
                          <li
                            key={lv.level}
                            className={clsx(
                              "flex items-start gap-2 text-sm",
                              done && "opacity-60"
                            )}
                          >
                            <button
                              onClick={() => toggle(id)}
                              className="mt-0.5 text-gray-400 hover:text-primary shrink-0"
                              aria-label={
                                done ? "Mark incomplete" : "Mark complete"
                              }
                            >
                              {done ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={clsx(
                                    "px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide",
                                    LEVEL_CLS[lv.level]
                                  )}
                                >
                                  {LEVEL_LABEL[lv.level]}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {lv.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {lv.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
