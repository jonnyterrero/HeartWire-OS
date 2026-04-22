import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const courseId = searchParams.get("courseId");
  const priority = searchParams.get("priority");
  const includeTrack = searchParams.get("includeTrack") === "1";

  const tasks = await prisma.task.findMany({
    where: {
      userId: user!.id,
      ...(status && { status }),
      ...(courseId && { courseId }),
      ...(priority && { priority }),
    },
    include: {
      course: includeTrack
        ? { select: { title: true, code: true, track: { select: { title: true, color: true } } } }
        : { select: { title: true, code: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { title, status, priority, dueDate, courseId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const maxSort = await prisma.task.aggregate({
    where: { userId: user!.id, status: status || "TODO" },
    _max: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      courseId: courseId || null,
      userId: user!.id,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
    include: {
      course: { select: { title: true, code: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
