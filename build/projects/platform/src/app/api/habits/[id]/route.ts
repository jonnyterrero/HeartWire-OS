import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.habit.findFirst({
    where: { id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const body = await request.json();
  const habit = await prisma.habit.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.targetDays !== undefined && { targetDays: body.targetDays }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
  });

  return NextResponse.json(habit);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.habit.findFirst({
    where: { id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  await prisma.habit.update({
    where: { id },
    data: { archived: true },
  });

  return NextResponse.json({ deleted: true });
}
