import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const status = searchParams.get("status");

  const courses = await prisma.course.findMany({
    where: {
      track: { userId: user!.id },
      ...(trackId && { trackId }),
      ...(status && { status }),
    },
    include: {
      track: { select: { title: true, color: true } },
      _count: { select: { resources: true, tasks: true, notes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { title, code, description, trackId } = body;

  if (!title?.trim() || !trackId) {
    return NextResponse.json(
      { error: "Title and trackId are required" },
      { status: 400 }
    );
  }

  const track = await prisma.track.findFirst({
    where: { id: trackId, userId: user!.id },
  });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const course = await prisma.course.create({
    data: {
      title: title.trim(),
      code: code || null,
      description: description || null,
      trackId,
      status: "NOT_STARTED",
    },
  });

  return NextResponse.json(course, { status: 201 });
}
