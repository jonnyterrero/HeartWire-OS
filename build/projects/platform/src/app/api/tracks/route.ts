import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const tracks = await prisma.track.findMany({
    where: { userId: user!.id },
    include: {
      _count: { select: { courses: true } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(tracks);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { title, description, color } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const track = await prisma.track.create({
    data: {
      title: title.trim(),
      description: description || null,
      color: color || "blue",
      userId: user!.id,
    },
  });

  return NextResponse.json(track, { status: 201 });
}
