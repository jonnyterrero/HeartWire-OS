import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const sessions = await prisma.studySession.findMany({
    where: {
      userId: user!.id,
      date: { gte: since },
    },
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
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { duration, notes, date } = body;

  if (!duration || duration < 1) {
    return NextResponse.json(
      { error: "Duration (minutes) is required and must be >= 1" },
      { status: 400 }
    );
  }

  const session = await prisma.studySession.create({
    data: {
      duration,
      notes: notes || null,
      date: date ? new Date(date) : new Date(),
      userId: user!.id,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
