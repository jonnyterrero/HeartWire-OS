import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalEnum,
  optionalString,
  parseJsonBody,
  requireString,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/api";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
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
          ? {
              select: {
                title: true,
                code: true,
                track: { select: { title: true, color: true } },
              },
            }
          : { select: { title: true, code: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(tasks);
  } catch (err) {
    return apiError(err, "tasks.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title");
    const status = optionalEnum(body.status, "status", TASK_STATUSES) ?? "TODO";
    const priority =
      optionalEnum(body.priority, "priority", TASK_PRIORITIES) ?? "MEDIUM";
    const courseId = optionalString(body.courseId, "courseId", 64);
    const dueDate =
      body.dueDate === null || body.dueDate === undefined || body.dueDate === ""
        ? null
        : new Date(String(body.dueDate));
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    if (courseId) {
      const owns = await prisma.course.findFirst({
        where: { id: courseId, track: { userId: user!.id } },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }

    const maxSort = await prisma.task.aggregate({
      where: { userId: user!.id, status },
      _max: { sortOrder: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        status,
        priority,
        dueDate,
        courseId: courseId ?? null,
        userId: user!.id,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
      include: { course: { select: { title: true, code: true } } },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return apiError(err, "tasks.create");
  }
}
