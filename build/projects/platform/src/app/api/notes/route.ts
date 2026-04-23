import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const search = searchParams.get("q");

  const notes = await prisma.note.findMany({
    where: {
      userId: user!.id,
      ...(courseId && { courseId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      course: { select: { title: true, code: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { title, content, courseId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      title: title.trim(),
      content: content || "",
      courseId: courseId || null,
      userId: user!.id,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
