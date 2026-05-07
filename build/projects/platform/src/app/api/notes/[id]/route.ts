import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, optionalString, parseJsonBody } from "@/lib/api";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const note = await prisma.note.findFirst({
      where: { id: params.id, userId: user!.id },
      include: { course: { select: { title: true, code: true } } },
    });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (err) {
    return apiError(err, "notes.get");
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title", 200);
    const content = optionalString(body.content, "content", 200_000);
    const courseId = optionalString(body.courseId, "courseId", 64);

    if (courseId) {
      const owns = await prisma.course.findFirst({
        where: { id: courseId, track: { userId: user!.id } },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(content !== undefined && { content: content ?? "" }),
        ...(courseId !== undefined && { courseId }),
      },
    });
    return NextResponse.json(note);
  } catch (err) {
    return apiError(err, "notes.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    await prisma.note.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "notes.delete");
  }
}
