import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  optionalString,
  parseJsonBody,
} from "@/lib/api";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const daysRaw = searchParams.get("days");
    let days = 7;
    if (daysRaw) {
      const parsed = parseInt(daysRaw, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 365) {
        throw new BadRequestError("days must be an integer between 1 and 365");
      }
      days = parsed;
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await prisma.studySession.findMany({
      where: { userId: user!.id, date: { gte: since } },
      orderBy: { date: "desc" },
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalMinutes,
        totalHours: +(totalMinutes / 60).toFixed(1),
        avgMinutesPerSession:
          sessions.length > 0 ? +(totalMinutes / sessions.length).toFixed(0) : 0,
      },
    });
  } catch (err) {
    return apiError(err, "sessions.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    if (
      typeof body.duration !== "number" ||
      !Number.isInteger(body.duration) ||
      body.duration < 1 ||
      body.duration > 24 * 60
    ) {
      throw new BadRequestError("duration must be an integer between 1 and 1440 minutes");
    }
    const notes = optionalString(body.notes, "notes", 5000);

    let date = new Date();
    if (body.date !== undefined && body.date !== null && body.date !== "") {
      const d = new Date(String(body.date));
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestError("Invalid date");
      }
      date = d;
    }

    const session = await prisma.studySession.create({
      data: {
        duration: body.duration,
        notes: notes ?? null,
        date,
        userId: user!.id,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return apiError(err, "sessions.create");
  }
}
