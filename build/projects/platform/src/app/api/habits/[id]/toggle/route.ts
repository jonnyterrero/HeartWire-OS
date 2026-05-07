import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, BadRequestError, parseJsonBody } from "@/lib/api";

type Params = { params: { id: string } };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/habits/:id/toggle
 * Body: { date: "YYYY-MM-DD" }
 * Toggles completion for that date — creates if missing, deletes if exists.
 */
export async function POST(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await parseJsonBody<{ date?: unknown }>(request);
    if (typeof body.date !== "string" || !ISO_DATE.test(body.date)) {
      throw new BadRequestError("date is required and must be YYYY-MM-DD");
    }
    const dateStr = body.date;
    const completedDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (Number.isNaN(completedDate.getTime())) {
      throw new BadRequestError("Invalid date");
    }

    const existing = await prisma.habitCompletion.findFirst({
      where: { habitId: params.id, completedDate },
    });

    if (existing) {
      await prisma.habitCompletion.delete({ where: { id: existing.id } });
      return NextResponse.json({ completed: false, date: dateStr });
    }

    await prisma.habitCompletion.create({
      data: { habitId: params.id, completedDate },
    });
    return NextResponse.json({ completed: true, date: dateStr });
  } catch (err) {
    return apiError(err, "habits.toggle");
  }
}
