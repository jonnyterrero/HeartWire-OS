import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  BadRequestError,
  optionalEnum,
  optionalString,
  parseJsonBody,
  RESOURCE_TYPES,
} from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.resource.findFirst({
      where: { id: params.id, course: { track: { userId: user!.id } } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title", 300);
    const type = optionalEnum(body.type, "type", RESOURCE_TYPES);
    const url = optionalString(body.url, "url", 2048);
    const courseId = optionalString(body.courseId, "courseId", 64);

    let isCompleted: boolean | undefined = undefined;
    if (body.isCompleted !== undefined) {
      if (typeof body.isCompleted !== "boolean") {
        throw new BadRequestError("isCompleted must be a boolean");
      }
      isCompleted = body.isCompleted;
    }

    if (courseId) {
      const owns = await prisma.course.findFirst({
        where: { id: courseId, track: { userId: user!.id } },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(type && { type }),
        ...(url !== undefined && { url }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(courseId && { courseId }),
      },
    });
    return NextResponse.json(resource);
  } catch (err) {
    return apiError(err, "resources.update");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await prisma.resource.findFirst({
      where: { id: params.id, course: { track: { userId: user!.id } } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    await prisma.resource.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "resources.delete");
  }
}
