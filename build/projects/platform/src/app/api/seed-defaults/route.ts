import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { DEFAULT_TRACKS } from "@/lib/default-tracks";

// Force dynamic + Node runtime so the PWA SW / edge cache never serves a
// stale response.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

type SeedSummary = {
  tracksCreated: number;
  coursesCreated: number;
  totalTracks: number;
  failures: { stage: string; title: string; error: string }[];
};

async function runSeed(): Promise<SeedSummary | { error: string; scope: string }> {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError) {
    // Bubble up auth failure as a normal 401 — never as a 500.
    return { error: "Unauthorized", scope: "auth" };
  }
  const userId = user!.id;

  const failures: SeedSummary["failures"] = [];

  // Load existing tracks once.
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

  // Seed courses per track. Per-row create so a single bad row doesn't take
  // down the whole batch and we can attribute the failure precisely.
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

export async function POST() {
  try {
    const result = await runSeed();
    if ("error" in result) {
      return NextResponse.json(result, { status: 401, headers: NO_CACHE });
    }
    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error("[seedDefaults]", err);
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return NextResponse.json(
      { error: message, scope: "seedDefaults" },
      { status: 500, headers: NO_CACHE }
    );
  }
}

// GET handler: same behavior as POST. Lets the user paste
// /api/seed-defaults into the URL bar and see the JSON directly without
// the PWA service worker caching the response.
export async function GET() {
  return POST();
}
