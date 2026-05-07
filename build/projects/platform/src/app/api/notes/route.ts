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
      include: { course: { select: { title: true, code: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (err) {
    return apiError(err, "notes.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title", 200);
    const content = optionalString(body.content, "content", 200_000) ?? "";
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

    const note = await prisma.note.create({
      data: {
        title,
        content,
        courseId: courseId ?? null,
        userId: user!.id,
      },
    });
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return apiError(err, "notes.create");
  }
}
