import prisma from "@/lib/prisma";
import { DEFAULT_TRACKS } from "@/lib/default-tracks";

export type SeedSummary = {
  tracksCreated: number;
  coursesCreated: number;
  totalTracks: number;
  failures: { stage: string; title: string; error: string }[];
};

export async function seedDefaultTracksForUser(userId: string): Promise<SeedSummary> {
  const failures: SeedSummary["failures"] = [];

  const existingTracks = await prisma.track.findMany({
    where: { userId },
    select: { id: true, title: true },
  });
  const trackByTitle = new Map(existingTracks.map((t) => [t.title, t.id]));

  let tracksCreated = 0;
  for (const t of DEFAULT_TRACKS) {
    if (trackByTitle.has(t.title)) continue;
    try {
      const created = await prisma.track.create({
        data: { title: t.title, color: t.color, userId },
        select: { id: true, title: true },
      });
      trackByTitle.set(created.title, created.id);
      tracksCreated += 1;
    } catch (err) {
      failures.push({
        stage: "track",
        title: t.title,
        error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      });
    }
  }

  let coursesCreated = 0;
  for (const t of DEFAULT_TRACKS) {
    const trackId = trackByTitle.get(t.title);
    if (!trackId || t.courses.length === 0) continue;
    const existing = await prisma.course.findMany({
      where: { trackId },
      select: { title: true },
    });
    const have = new Set(existing.map((c) => c.title));
    for (const courseTitle of t.courses) {
      if (have.has(courseTitle)) continue;
      try {
        await prisma.course.create({
          data: { title: courseTitle, trackId, status: "NOT_STARTED" },
        });
        coursesCreated += 1;
      } catch (err) {
        failures.push({
          stage: "course",
          title: `${t.title} → ${courseTitle}`,
          error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
        });
      }
    }
  }

  return {
    tracksCreated,
    coursesCreated,
    totalTracks: DEFAULT_TRACKS.length,
    failures,
  };
}
