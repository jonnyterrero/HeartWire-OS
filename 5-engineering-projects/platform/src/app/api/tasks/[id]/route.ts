import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.status && { status: body.status }),
      ...(body.priority && { priority: body.priority }),
      ...(body.dueDate !== undefined && {
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      }),
      ...(body.courseId !== undefined && { courseId: body.courseId }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
    include: {
      course: { select: { title: true, code: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
