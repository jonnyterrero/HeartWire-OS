"use client";

import clsx from "clsx";
import { CURATED_RESOURCES, TRACK_LABELS } from "@/lib/curated";
import { useCuratedProgress } from "@/lib/curated-progress";
import { CheckCircle2, Circle, ExternalLink, BookMarked } from "lucide-react";

export default function CuratedTextbooksPage() {
  const { isCompleted, toggle } = useCuratedProgress();
  const books = CURATED_RESOURCES.filter(
    (r) => r.type === "textbook" || r.type === "handbook"
  );

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-primary" />
          Core textbooks &amp; handbooks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
          The authoritative references for FE, PE, and BME. Marking a book
          complete means you&apos;ve read the chapter and worked a few problems —
          not just opened the PDF.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {books.map((b) => {
          const done = isCompleted(b.id);
          return (
            <div
              key={b.id}
              className={clsx(
                "border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface",
                done && "opacity-70"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] uppercase tracking-wide border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-gray-600 dark:text-gray-400">
                      {b.type}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide rounded px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {b.cost}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">
                    {b.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-0.5">{b.source}</div>
                </div>
                <button
                  onClick={() => toggle(b.id)}
                  className="text-gray-400 hover:text-primary shrink-0"
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                {b.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {b.tracks.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wide border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-gray-500"
                  >
                    {TRACK_LABELS[t]}
                  </span>
                ))}
              </div>
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open source <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
