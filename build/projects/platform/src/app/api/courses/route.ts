import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalString,
  parseJsonBody,
  requireString,
} from "@/lib/api";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
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
  } catch (err) {
    return apiError(err, "courses.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title");
    const trackId = requireString(body.trackId, "trackId", 64);
    const code = optionalString(body.code, "code", 32);
    const description = optionalString(body.description, "description", 2000);

    const track = await prisma.track.findFirst({
      where: { id: trackId, userId: user!.id },
      select: { id: true },
    });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        code,
        description,
        trackId,
        status: "NOT_STARTED",
      },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    return apiError(err, "courses.create");
  }
}
