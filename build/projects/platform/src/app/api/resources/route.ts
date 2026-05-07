import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalEnum,
  optionalString,
  parseJsonBody,
  RESOURCE_TYPES,
  requireString,
} from "@/lib/api";

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
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
      include: { course: { select: { title: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resources);
  } catch (err) {
    return apiError(err, "resources.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const title = requireString(body.title, "title", 300);
    const courseId = requireString(body.courseId, "courseId", 64);
    const type = optionalEnum(body.type, "type", RESOURCE_TYPES) ?? "ARTICLE";
    const url = optionalString(body.url, "url", 2048);

    const course = await prisma.course.findFirst({
      where: { id: courseId, track: { userId: user!.id } },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        url: url ?? null,
        courseId,
        isCompleted: false,
      },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    return apiError(err, "resources.create");
  }
}
