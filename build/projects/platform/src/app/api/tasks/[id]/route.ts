import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalEnum,
  optionalInt,
  optionalString,
  parseJsonBody,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title");
    const status = optionalEnum(body.status, "status", TASK_STATUSES);
    const priority = optionalEnum(body.priority, "priority", TASK_PRIORITIES);
    const courseId = optionalString(body.courseId, "courseId", 64);
    const sortOrder = optionalInt(body.sortOrder, "sortOrder");

    let dueDate: Date | null | undefined = undefined;
    if (body.dueDate === null) dueDate = null;
    else if (body.dueDate !== undefined && body.dueDate !== "") {
      const d = new Date(String(body.dueDate));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
      dueDate = d;
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

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate }),
        ...(courseId !== undefined && { courseId }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: { course: { select: { title: true, code: true } } },
    });
    return NextResponse.json(task);
  } catch (err) {
    return apiError(err, "tasks.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "tasks.delete");
  }
}
