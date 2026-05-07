import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, optionalString, parseJsonBody } from "@/lib/api";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const track = await prisma.track.findFirst({
      where: { id: params.id, userId: user!.id },
      include: {
        courses: {
          include: { _count: { select: { resources: true, tasks: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
    return NextResponse.json(track);
  } catch (err) {
    return apiError(err, "tracks.get");
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.track.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title");
    const description = optionalString(body.description, "description", 2000);
    const color = optionalString(body.color, "color", 32);

    const track = await prisma.track.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && color !== null && { color }),
      },
    });
    return NextResponse.json(track);
  } catch (err) {
    return apiError(err, "tracks.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.track.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
    await prisma.track.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "tracks.delete");
  }
}
