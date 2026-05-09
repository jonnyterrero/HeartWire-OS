import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { DEFAULT_TRACKS } from "@/lib/default-tracks";

/**
 * Seeds the default HeartWire tracks AND their starter courses for the
 * current user. Idempotent: matches by title for both tracks and courses,
 * skipping anything that already exists.
 */
export async function POST() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existingTracks = await prisma.track.findMany({
      where: { userId: user!.id },
      select: { id: true, title: true },
    });
    const trackByTitle = new Map(existingTracks.map((t) => [t.title, t.id]));

    let tracksCreated = 0;
    for (const t of DEFAULT_TRACKS) {
      if (!trackByTitle.has(t.title)) {
        const created = await prisma.track.create({
          data: { title: t.title, color: t.color, userId: user!.id },
          select: { id: true, title: true },
        });
        trackByTitle.set(created.title, created.id);
        tracksCreated += 1;
      }
    }

    // Seed courses per track. Match by (trackId, title) so re-running is safe.
    let coursesCreated = 0;
    for (const t of DEFAULT_TRACKS) {
      const trackId = trackByTitle.get(t.title);
      if (!trackId || t.courses.length === 0) continue;
      const existing = await prisma.course.findMany({
        where: { trackId },
        select: { title: true },
      });
      const have = new Set(existing.map((c) => c.title));
      const toCreate = t.courses.filter((c) => !have.has(c));
      if (toCreate.length === 0) continue;
      await prisma.course.createMany({
        data: toCreate.map((title) => ({
          title,
          trackId,
          status: "NOT_STARTED",
        })),
      });
      coursesCreated += toCreate.length;
    }

    return NextResponse.json({
      tracksCreated,
      coursesCreated,
      totalTracks: DEFAULT_TRACKS.length,
    });
  } catch (err) {
    return apiError(err, "seedDefaults");
  }
}
