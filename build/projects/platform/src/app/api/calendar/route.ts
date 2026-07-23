import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, BadRequestError } from "@/lib/api";

/**
 * Calendar aggregator.
 * GET /api/calendar?from=ISO&to=ISO
 * Returns: { tasks, events, studySessions, examSessions }
 * All filtered to the date range, soft-deleted rows excluded.
 */
export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");
    if (!fromRaw || !toRaw) {
      throw new BadRequestError("from and to query params are required");
    }
    const from = new Date(fromRaw);
    const to = new Date(toRaw);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestError("Invalid from/to date");
    }

    const [tasks, events, studySessions, examSessions] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: user!.id,
          dueDate: { gte: from, lte: to },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          courseId: true,
        },
      }),
      prisma.calendarEvent.findMany({
        where: {
          userId: user!.id,
          deletedAt: null,
          OR: [
            // One-off events (and recurring anchors) inside the window.
            { startTime: { gte: from, lte: to } },
            // Recurring events anchored before the window — their later
            // occurrences may still land in range. The client expands the
            // RRULE and drops any that fall outside [from, to].
            { recurrenceRule: { not: null }, startTime: { lte: to } },
          ],
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.studySession.findMany({
        where: {
          userId: user!.id,
          deletedAt: null,
          OR: [
            { startedAt: { gte: from, lte: to } },
            { date: { gte: from, lte: to } },
          ],
        },
        select: {
          id: true,
          duration: true,
          durationMinutes: true,
          startedAt: true,
          endedAt: true,
          date: true,
          notes: true,
          trackId: true,
          courseId: true,
        },
      }),
      prisma.examPracticeSession.findMany({
        where: {
          userId: user!.id,
          deletedAt: null,
          sessionDate: { gte: from, lte: to },
        },
      }),
    ]);

    return NextResponse.json({ tasks, events, studySessions, examSessions });
  } catch (err) {
    return apiError(err, "calendar.aggregate");
  }
}
