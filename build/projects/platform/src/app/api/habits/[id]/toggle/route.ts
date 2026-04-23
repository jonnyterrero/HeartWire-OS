import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/habits/:id/toggle
 * Body: { date: "2026-03-11" }
 * Toggles completion for that date — creates if missing, deletes if exists.
 */
export async function POST(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { id } = await params;
  const habit = await prisma.habit.findFirst({
    where: { id, userId: user!.id },
  });
  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const body = await request.json();
  const dateStr = body.date;
  if (!dateStr) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const completedDate = new Date(dateStr + "T00:00:00.000Z");

  const existing = await prisma.habitCompletion.findFirst({
    where: {
      habitId: id,
      completedDate,
    },
  });

  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
    return NextResponse.json({ completed: false, date: dateStr });
  } else {
    await prisma.habitCompletion.create({
      data: {
        habitId: id,
        completedDate,
      },
    });
    return NextResponse.json({ completed: true, date: dateStr });
  }
}
