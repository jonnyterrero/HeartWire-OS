import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  COURSE_STATUSES,
  optionalEnum,
  optionalString,
  parseJsonBody,
} from "@/lib/api";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const course = await prisma.course.findFirst({
      where: { id: params.id, track: { userId: user!.id } },
      include: {
        track: { select: { title: true, color: true } },
        resources: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { sortOrder: "asc" } },
        notes: { orderBy: { updatedAt: "desc" } },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (err) {
    return apiError(err, "courses.get");
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.course.findFirst({
      where: { id: params.id, track: { userId: user!.id } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title");
    const code = optionalString(body.code, "code", 32);
    const description = optionalString(body.description, "description", 2000);
    const status = optionalEnum(body.status, "status", COURSE_STATUSES);
    const trackId = optionalString(body.trackId, "trackId", 64);

    if (trackId) {
      const owns = await prisma.track.findFirst({
        where: { id: trackId, userId: user!.id },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(trackId && { trackId }),
      },
    });
    return NextResponse.json(course);
  } catch (err) {
    return apiError(err, "courses.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.course.findFirst({
      where: { id: params.id, track: { userId: user!.id } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "courses.delete");
  }
}
