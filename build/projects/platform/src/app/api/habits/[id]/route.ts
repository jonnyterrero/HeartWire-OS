import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  optionalString,
  parseJsonBody,
} from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.habit.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const name = optionalString(body.name, "name", 200);
    const color = optionalString(body.color, "color", 32);

    let targetDays: number[] | undefined = undefined;
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
        throw new BadRequestError("targetDays must be an array of integers 0-6");
      }
      targetDays = body.targetDays as number[];
    }

    let archived: boolean | undefined = undefined;
    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") {
        throw new BadRequestError("archived must be a boolean");
      }
      archived = body.archived;
    }

    const habit = await prisma.habit.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && name !== null && { name }),
        ...(color !== undefined && color !== null && { color }),
        ...(targetDays !== undefined && { targetDays }),
        ...(archived !== undefined && { archived }),
      },
    });
    return NextResponse.json(habit);
  } catch (err) {
    return apiError(err, "habits.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.habit.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    await prisma.habit.update({
      where: { id: params.id },
      data: { archived: true },
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "habits.delete");
  }
}
