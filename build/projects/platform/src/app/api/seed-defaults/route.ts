import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { seedDefaultTracksForUser } from "@/lib/seed-defaults";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

export async function POST(request: Request) {
  const limited = rateLimit(`seed:${clientIp(request)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { ...NO_CACHE, "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return NextResponse.json(
        { error: "Unauthorized", scope: "auth" },
        { status: 401, headers: NO_CACHE }
      );
    }
    const result = await seedDefaultTracksForUser(user!.id);
    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error("[seedDefaults]", err);
    return NextResponse.json(
      { error: "Internal server error", scope: "seedDefaults" },
      { status: 500, headers: NO_CACHE }
    );
  }
}

/** Read-only: whether this account already has tracks. Does not mutate. */
export async function GET() {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError) {
    return NextResponse.json(
      { error: "Unauthorized", scope: "auth" },
      { status: 401, headers: NO_CACHE }
    );
  }
  const trackCount = await prisma.track.count({ where: { userId: user!.id } });
  return NextResponse.json({ trackCount, seeded: trackCount > 0 }, { headers: NO_CACHE });
}
