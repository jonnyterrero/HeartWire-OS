import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalEnum,
  optionalInt,
  optionalString,
  parseJsonBody,
  requireEnum,
  requireString,
} from "@/lib/api";

const EVENT_TYPES = [
  "TASK",
  "STUDY_SESSION",
  "HABIT",
  "FE_PE_PRACTICE",
  "DEADLINE",
  "JOURNAL",
  "CUSTOM",
] as const;
const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"] as const;

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const eventType = searchParams.get("eventType");

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: user!.id,
        deletedAt: null,
        ...(eventType && { eventType }),
        ...((from || to) && {
          startTime: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }),
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(events);
  } catch (err) {
    return apiError(err, "calendarEvents.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title", 300);
    const eventType = requireEnum(body.eventType, "eventType", EVENT_TYPES);
    const description = optionalString(body.description, "description", 5000);
    const location = optionalString(body.location, "location", 300);
    const recurrenceRule = optionalString(
      body.recurrenceRule,
      "recurrenceRule",
      500
    );
    const reminderMinutesBefore = optionalInt(
      body.reminderMinutesBefore,
      "reminderMinutesBefore"
    );
    const color = optionalString(body.color, "color", 32);
    const status =
      optionalEnum(body.status, "status", STATUSES) ?? "SCHEDULED";

    const startTime = body.startTime ? new Date(String(body.startTime)) : null;
    const endTime = body.endTime ? new Date(String(body.endTime)) : null;

    const event = await prisma.calendarEvent.create({
      data: {
        userId: user!.id,
        title,
        eventType,
        description: description ?? null,
        location: location ?? null,
        recurrenceRule: recurrenceRule ?? null,
        reminderMinutesBefore: reminderMinutesBefore ?? null,
        color: color ?? null,
        status,
        allDay: body.allDay === true,
        startTime,
        endTime,
        trackId: optionalString(body.trackId, "trackId", 64) ?? null,
        courseId: optionalString(body.courseId, "courseId", 64) ?? null,
        taskId: optionalString(body.taskId, "taskId", 64) ?? null,
        habitId: optionalString(body.habitId, "habitId", 64) ?? null,
        studySessionId:
          optionalString(body.studySessionId, "studySessionId", 64) ?? null,
        examPracticeSessionId:
          optionalString(
            body.examPracticeSessionId,
            "examPracticeSessionId",
            64
          ) ?? null,
        linkedEntityType:
          optionalString(body.linkedEntityType, "linkedEntityType", 64) ?? null,
        linkedEntityId:
          optionalString(body.linkedEntityId, "linkedEntityId", 64) ?? null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    return apiError(err, "calendarEvents.create");
  }
}
