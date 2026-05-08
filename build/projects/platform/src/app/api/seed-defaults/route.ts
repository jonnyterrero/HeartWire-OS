import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

const DEFAULT_TRACKS = [
  { title: "Mathematics", color: "purple" },
  { title: "Physics & Chemistry", color: "teal" },
  { title: "Neuroscience / Neural Engineering", color: "blue" },
  { title: "Software Engineering", color: "cyan" },
  { title: "Mechanical Engineering", color: "orange" },
  { title: "Electrical Engineering", color: "yellow" },
] as const;

/**
 * Seeds the 6 default HeartWire tracks for the current user, but only ones
 * that don't already exist (matched by title). Idempotent.
 */
export async function POST() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.track.findMany({
      where: { userId: user!.id },
      select: { title: true },
    });
    const existingTitles = new Set(existing.map((t) => t.title));
    const toCreate = DEFAULT_TRACKS.filter(
      (t) => !existingTitles.has(t.title)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({ created: 0, skipped: DEFAULT_TRACKS.length });
    }

    await prisma.track.createMany({
      data: toCreate.map((t) => ({
        userId: user!.id,
        title: t.title,
        color: t.color,
      })),
    });

    return NextResponse.json({
      created: toCreate.length,
      skipped: DEFAULT_TRACKS.length - toCreate.length,
    });
  } catch (err) {
    return apiError(err, "seedDefaults");
  }
}
