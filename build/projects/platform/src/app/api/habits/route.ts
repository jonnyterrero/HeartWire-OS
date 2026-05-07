import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  optionalString,
  parseJsonBody,
  requireString,
} from "@/lib/api";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
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
  } catch (err) {
    return apiError(err, "habits.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const name = requireString(body.name, "name", 200);
    const color = optionalString(body.color, "color", 32) ?? "blue";

    let targetDays: number[] = [0, 1, 2, 3, 4, 5, 6];
    if (body.targetDays !== undefined) {
      if (
        !Array.isArray(body.targetDays) ||
        !body.targetDays.every(
          (d) =>
            typeof d === "number" &&
            Number.isInteger(d) &&
            d >= 0 &&
            d <= 6
        )
      ) {
        throw new BadRequestError(
          "targetDays must be an array of integers 0-6"
        );
      }
      targetDays = body.targetDays as number[];
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user!.id,
        name,
        color,
        targetDays,
      },
      include: { completions: true },
    });
    return NextResponse.json(habit, { status: 201 });
  } catch (err) {
    return apiError(err, "habits.create");
  }
}
