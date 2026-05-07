import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  parseJsonBody,
  TASK_STATUSES,
} from "@/lib/api";

/**
 * Batch reorder tasks after a drag-and-drop.
 * Body: { tasks: [{ id, status, sortOrder }] }
 */
export async function PUT(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody<{
      tasks?: { id?: unknown; status?: unknown; sortOrder?: unknown }[];
    }>(request);
    const raw = body.tasks;
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new BadRequestError("tasks array is required");
    }
    if (raw.length > 500) {
      throw new BadRequestError("cannot reorder more than 500 tasks at once");
    }

    const items = raw.map((t, i) => {
      if (typeof t.id !== "string" || !t.id) {
        throw new BadRequestError(`tasks[${i}].id must be a string`);
      }
      if (
        typeof t.status !== "string" ||
        !(TASK_STATUSES as readonly string[]).includes(t.status)
      ) {
        throw new BadRequestError(
          `tasks[${i}].status must be one of: ${TASK_STATUSES.join(", ")}`
        );
      }
      if (typeof t.sortOrder !== "number" || !Number.isInteger(t.sortOrder)) {
        throw new BadRequestError(`tasks[${i}].sortOrder must be an integer`);
      }
      return { id: t.id, status: t.status, sortOrder: t.sortOrder };
    });

    const ids = items.map((t) => t.id);
    const owned = await prisma.task.count({
      where: { id: { in: ids }, userId: user!.id },
    });
    if (owned !== ids.length) {
      return NextResponse.json(
        { error: "Unauthorized task access" },
        { status: 403 }
      );
    }

    await prisma.$transaction(
      items.map((t) =>
        prisma.task.update({
          where: { id: t.id },
          data: { status: t.status, sortOrder: t.sortOrder },
        })
      )
    );
    return NextResponse.json({ reordered: items.length });
  } catch (err) {
    return apiError(err, "tasks.reorder");
  }
}
