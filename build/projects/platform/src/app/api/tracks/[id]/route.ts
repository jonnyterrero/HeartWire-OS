import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

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
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.track.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const body = await request.json();
  const track = await prisma.track.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.color && { color: body.color }),
    },
  });

  return NextResponse.json(track);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const existing = await prisma.track.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  await prisma.track.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
