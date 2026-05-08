"use client";

import { useCallback, useEffect, useState } from "react";

// localStorage-backed progress for curated items (LC, Rosalind, textbooks).
// Storage shape: a single JSON object keyed by item id -> "completed" | unset.
// Per-user separation comes from the storage key including the user id; if the
// app later grows a real `UserProgress` table, swap useCuratedProgress to call
// an API and the page components don't change.

const STORAGE_KEY = "heartwire.curated-progress.v1";

type ProgressMap = Record<string, "completed" | undefined>;

function read(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function write(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota exceeded or storage disabled — silently no-op
  }
}

export function useCuratedProgress() {
  const [map, setMap] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMap(read());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMap(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isCompleted = useCallback(
    (id: string) => map[id] === "completed",
    [map]
  );

  const toggle = useCallback((id: string) => {
    setMap((prev) => {
      const next = { ...prev };
      if (next[id] === "completed") delete next[id];
      else next[id] = "completed";
      write(next);
      return next;
    });
  }, []);

  const completedCount = useCallback(
    (ids: string[]) => ids.filter((id) => map[id] === "completed").length,
    [map]
  );

  return { isCompleted, toggle, completedCount, hydrated };
}
