import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const habits = await prisma.habit.findMany({
    where: { userId: user!.id, archived: false },
    include: {
      completions: {
        where: { completedDate: { gte: sevenDaysAgo } },
        orderBy: { completedDate: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(habits);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { name, color, targetDays } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const habit = await prisma.habit.create({
    data: {
      userId: user!.id,
      name: name.trim(),
      color: color || "blue",
      targetDays: targetDays || [0, 1, 2, 3, 4, 5, 6],
    },
    include: { completions: true },
  });

  return NextResponse.json(habit, { status: 201 });
}
