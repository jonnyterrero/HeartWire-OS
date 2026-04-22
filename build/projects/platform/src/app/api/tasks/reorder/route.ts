import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Batch reorder tasks after a drag-and-drop.
 * Body: { tasks: [{ id, status, sortOrder }] }
 */
export async function PUT(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { tasks } = body as {
    tasks: { id: string; status: string; sortOrder: number }[];
  };

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json(
      { error: "tasks array is required" },
      { status: 400 }
    );
  }

  const taskIds = tasks.map((t) => t.id);
  const owned = await prisma.task.count({
    where: { id: { in: taskIds }, userId: user!.id },
  });
  if (owned !== taskIds.length) {
    return NextResponse.json({ error: "Unauthorized task access" }, { status: 403 });
  }

  await prisma.$transaction(
    tasks.map((t) =>
      prisma.task.update({
        where: { id: t.id },
        data: { status: t.status, sortOrder: t.sortOrder },
      })
    )
  );

  return NextResponse.json({ reordered: tasks.length });
}
