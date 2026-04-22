import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const type = searchParams.get("type");
  const completed = searchParams.get("completed");

  const resources = await prisma.resource.findMany({
    where: {
      course: { track: { userId: user!.id } },
      ...(courseId && { courseId }),
      ...(type && type !== "ALL" && { type }),
      ...(completed !== null && { isCompleted: completed === "true" }),
    },
    include: {
      course: { select: { title: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resources);
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { title, type, url, courseId } = body;

  if (!title?.trim() || !courseId) {
    return NextResponse.json(
      { error: "Title and courseId are required" },
      { status: 400 }
    );
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, track: { userId: user!.id } },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const resource = await prisma.resource.create({
    data: {
      title: title.trim(),
      type: type || "ARTICLE",
      url: url || null,
      courseId,
      isCompleted: false,
    },
  });

  return NextResponse.json(resource, { status: 201 });
}
