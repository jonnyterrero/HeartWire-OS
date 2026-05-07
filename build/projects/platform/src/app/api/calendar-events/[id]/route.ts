import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalEnum,
  optionalString,
  parseJsonBody,
} from "@/lib/api";

const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"] as const;

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const ev = await prisma.calendarEvent.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
    });
    if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ev);
  } catch (err) {
    return apiError(err, "calendarEvents.get");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await parseJsonBody(request);
    const data: Record<string, unknown> = {};
    const title = optionalString(body.title, "title", 300);
    if (title !== undefined && title !== null) data.title = title;
    const description = optionalString(body.description, "description", 5000);
    if (description !== undefined) data.description = description;
    const status = optionalEnum(body.status, "status", STATUSES);
    if (status !== undefined) data.status = status;
    if (body.startTime !== undefined) {
      data.startTime = body.startTime ? new Date(String(body.startTime)) : null;
    }
    if (body.endTime !== undefined) {
      data.endTime = body.endTime ? new Date(String(body.endTime)) : null;
    }
    if (typeof body.allDay === "boolean") data.allDay = body.allDay;

    const updated = await prisma.calendarEvent.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err, "calendarEvents.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id: params.id, userId: user!.id, deletedAt: null },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.calendarEvent.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "calendarEvents.delete");
  }
}
