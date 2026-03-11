import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user!.id },
    include: {
      course: { select: { title: true, code: true } },
    },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.note.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await request.json();
  const note = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.courseId !== undefined && { courseId: body.courseId }),
    },
  });

  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.note.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
