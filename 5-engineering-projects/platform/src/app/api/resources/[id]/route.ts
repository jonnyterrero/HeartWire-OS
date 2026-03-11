import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.resource.findFirst({
    where: { id: params.id, course: { track: { userId: user!.id } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const body = await request.json();
  const resource = await prisma.resource.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.type && { type: body.type }),
      ...(body.url !== undefined && { url: body.url }),
      ...(body.isCompleted !== undefined && { isCompleted: body.isCompleted }),
      ...(body.courseId && { courseId: body.courseId }),
    },
  });

  return NextResponse.json(resource);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.resource.findFirst({
    where: { id: params.id, course: { track: { userId: user!.id } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  await prisma.resource.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
