import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalInt,
  optionalString,
  parseJsonBody,
  requireEnum,
} from "@/lib/api";

const EXAM_TYPES = ["FE", "PE"] as const;
const DISCIPLINES = ["ELECTRICAL", "MECHANICAL"] as const;

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");
    const discipline = searchParams.get("discipline");
    const trackId = searchParams.get("trackId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const sessions = await prisma.examPracticeSession.findMany({
      where: {
        userId: user!.id,
        deletedAt: null,
        ...(examType && { examType }),
        ...(discipline && { discipline }),
        ...(trackId && { trackId }),
        ...((from || to) && {
          sessionDate: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }),
      },
      orderBy: { sessionDate: "desc" },
    });

    const totalAttempted = sessions.reduce(
      (sum, s) => sum + (s.questionsAttempted ?? 0),
      0
    );
    const totalCorrect = sessions.reduce(
      (sum, s) => sum + (s.questionsCorrect ?? 0),
      0
    );
    const accuracy =
      totalAttempted > 0
        ? +((totalCorrect / totalAttempted) * 100).toFixed(1)
        : 0;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalAttempted,
        totalCorrect,
        accuracy,
      },
    });
  } catch (err) {
    return apiError(err, "examPractice.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const examType = requireEnum(body.examType, "examType", EXAM_TYPES);
    const discipline = body.discipline
      ? requireEnum(body.discipline, "discipline", DISCIPLINES)
      : null;
    const topic = optionalString(body.topic, "topic", 200);
    const source = optionalString(body.source, "source", 200);
    const notes = optionalString(body.notes, "notes", 5000);
    const trackId = optionalString(body.trackId, "trackId", 64);
    const questionsAttempted = optionalInt(
      body.questionsAttempted,
      "questionsAttempted"
    );
    const questionsCorrect = optionalInt(
      body.questionsCorrect,
      "questionsCorrect"
    );
    const durationMinutes = optionalInt(body.durationMinutes, "durationMinutes");

    let sessionDate: Date | null = null;
    if (body.sessionDate) {
      const d = new Date(String(body.sessionDate));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Invalid sessionDate" },
          { status: 400 }
        );
      }
      sessionDate = d;
    } else {
      sessionDate = new Date();
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

    const session = await prisma.examPracticeSession.create({
      data: {
        userId: user!.id,
        examType,
        discipline,
        topic: topic ?? null,
        source: source ?? null,
        notes: notes ?? null,
        trackId: trackId ?? null,
        questionsAttempted: questionsAttempted ?? null,
        questionsCorrect: questionsCorrect ?? null,
        durationMinutes: durationMinutes ?? null,
        sessionDate,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return apiError(err, "examPractice.create");
  }
}
