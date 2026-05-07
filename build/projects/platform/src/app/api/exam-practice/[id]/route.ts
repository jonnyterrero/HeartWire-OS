import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalInt,
  optionalString,
  parseJsonBody,
} from "@/lib/api";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const session = await prisma.examPracticeSession.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
    });
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (err) {
    return apiError(err, "examPractice.get");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.examPracticeSession.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const data: Record<string, unknown> = {};
    const topic = optionalString(body.topic, "topic", 200);
    if (topic !== undefined) data.topic = topic;
    const source = optionalString(body.source, "source", 200);
    if (source !== undefined) data.source = source;
    const notes = optionalString(body.notes, "notes", 5000);
    if (notes !== undefined) data.notes = notes;
    const qa = optionalInt(body.questionsAttempted, "questionsAttempted");
    if (qa !== undefined) data.questionsAttempted = qa;
    const qc = optionalInt(body.questionsCorrect, "questionsCorrect");
    if (qc !== undefined) data.questionsCorrect = qc;
    const dur = optionalInt(body.durationMinutes, "durationMinutes");
    if (dur !== undefined) data.durationMinutes = dur;
    if (body.sessionDate !== undefined) {
      data.sessionDate = body.sessionDate ? new Date(String(body.sessionDate)) : null;
    }

    const updated = await prisma.examPracticeSession.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err, "examPractice.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.examPracticeSession.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.examPracticeSession.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "examPractice.delete");
  }
}
