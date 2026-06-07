import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  optionalInt,
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

    const prevSince = new Date(since);
    prevSince.setDate(prevSince.getDate() - days);

    const [sessions, prevSessions] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId: user!.id, deletedAt: null, date: { gte: since } },
        orderBy: { date: "desc" },
      }),
      prisma.studySession.findMany({
        where: {
          userId: user!.id,
          deletedAt: null,
          date: { gte: prevSince, lt: since },
        },
        select: { duration: true, durationMinutes: true },
      }),
    ]);

    const sumMinutes = (rows: { duration: number; durationMinutes: number | null }[]) =>
      rows.reduce(
        (sum, s) => sum + (s.durationMinutes ?? s.duration ?? 0),
        0
      );
    const totalMinutes = sumMinutes(sessions);
    const prevTotalMinutes = sumMinutes(prevSessions);
    const trendDelta = totalMinutes - prevTotalMinutes;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalMinutes,
        totalHours: +(totalMinutes / 60).toFixed(1),
        prevTotalMinutes,
        prevTotalHours: +(prevTotalMinutes / 60).toFixed(1),
        trendDelta,
        trendDeltaHours: +(trendDelta / 60).toFixed(1),
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
    const trackId = optionalString(body.trackId, "trackId", 64);
    const courseId = optionalString(body.courseId, "courseId", 64);
    const sessionType = optionalString(body.sessionType, "sessionType", 50);
    const focusScore = optionalInt(body.focusScore, "focusScore");
    const energyScore = optionalInt(body.energyScore, "energyScore");

    let date = new Date();
    if (body.date !== undefined && body.date !== null && body.date !== "") {
      const d = new Date(String(body.date));
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestError("Invalid date");
      }
      date = d;
    }

    let startedAt: Date | null = null;
    let endedAt: Date | null = null;
    if (body.startedAt) {
      startedAt = new Date(String(body.startedAt));
    }
    if (body.endedAt) {
      endedAt = new Date(String(body.endedAt));
    }

    if (trackId) {
      const owns = await prisma.track.findFirst({
        where: { id: trackId, userId: user!.id },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }
    }

    if (courseId) {
      const owns = await prisma.course.findFirst({
        where: { id: courseId, track: { userId: user!.id } },
        select: { id: true, trackId: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }

    const session = await prisma.studySession.create({
      data: {
        duration: body.duration,
        durationMinutes: body.duration,
        notes: notes ?? null,
        date,
        startedAt,
        endedAt,
        userId: user!.id,
        trackId: trackId ?? null,
        courseId: courseId ?? null,
        sessionType: sessionType ?? null,
        focusScore: focusScore ?? null,
        energyScore: energyScore ?? null,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return apiError(err, "sessions.create");
  }
}
