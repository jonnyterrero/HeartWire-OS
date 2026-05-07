import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, optionalString, parseJsonBody, requireString } from "@/lib/api";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const tracks = await prisma.track.findMany({
      where: { userId: user!.id },
      include: { _count: { select: { courses: true } } },
      orderBy: { title: "asc" },
    });
    return NextResponse.json(tracks);
  } catch (err) {
    return apiError(err, "tracks.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title");
    const description = optionalString(body.description, "description", 2000);
    const color = optionalString(body.color, "color", 32) ?? "blue";

    const track = await prisma.track.create({
      data: {
        title,
        description,
        color,
        userId: user!.id,
      },
    });
    return NextResponse.json(track, { status: 201 });
  } catch (err) {
    return apiError(err, "tracks.create");
  }
}
