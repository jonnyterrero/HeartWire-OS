import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

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
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.course.findFirst({
    where: { id: params.id, track: { userId: user!.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();
  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.code !== undefined && { code: body.code }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status }),
      ...(body.trackId && { trackId: body.trackId }),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.course.findFirst({
    where: { id: params.id, track: { userId: user!.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
