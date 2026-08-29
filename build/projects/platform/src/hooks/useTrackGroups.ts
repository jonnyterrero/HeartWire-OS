"use client";

import { useEffect, useState } from "react";
import { TRACK_GROUPS, type TrackGroup } from "@/lib/track-groups";

type DbTrack = {
  id: string;
  title: string;
  color: string;
  _count: { courses: number };
};

export type ResolvedGroup = TrackGroup & {
  dbTracks: DbTrack[];
  totalCourses: number;
};

export function useTrackGroups() {
  const [groups, setGroups] = useState<ResolvedGroup[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      try {
        let dbTracks: DbTrack[] = await fetch("/api/tracks").then((r) =>
          r.ok ? r.json() : []
        );
        if (Array.isArray(dbTracks) && dbTracks.length === 0) {
          const seed = await fetch("/api/seed-defaults", { method: "POST" });
          if (seed.ok) {
            dbTracks = await fetch("/api/tracks").then((r) =>
              r.ok ? r.json() : []
            );
          }
        }
        if (cancelled) return;
        setGroups(
          TRACK_GROUPS.map((group) => {
            const matching = (dbTracks ?? []).filter((t) =>
              group.dbTrackTitles.includes(t.title)
            );
            return {
              ...group,
              dbTracks: matching,
              totalCourses: matching.reduce(
                (sum, t) => sum + (t._count?.courses || 0),
                0
              ),
            };
          })
        );
        setLoaded(true);
      } catch {
        if (!cancelled) {
          setGroups(
            TRACK_GROUPS.map((g) => ({ ...g, dbTracks: [], totalCourses: 0 }))
          );
          setLoaded(true);
        }
      }
    }

    loadTracks();
    const refetch = () => {
      cancelled = false;
      loadTracks();
    };
    window.addEventListener("heartwire:tracks-changed", refetch);
    return () => {
      cancelled = true;
      window.removeEventListener("heartwire:tracks-changed", refetch);
    };
  }, []);

  return { groups, loaded };
}
