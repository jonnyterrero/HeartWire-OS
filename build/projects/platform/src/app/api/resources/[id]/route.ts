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

const RESOURCE_ENUM = [
  "GITHUB_REPO",
  "PDF",
  "WEBSITE",
  "YOUTUBE_VIDEO",
  "YOUTUBE_PLAYLIST",
  "BOOK",
  "DOCUMENTATION",
  "ARTICLE",
  "COURSE",
  "OTHER",
] as const;

type Params = { params: { id: string } };

async function findOwned(userId: string, resourceId: string) {
  return prisma.resource.findFirst({
    where: {
      id: resourceId,
      deletedAt: null,
      OR: [{ userId }, { course: { track: { userId } } }],
    },
    select: { id: true },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const existing = await findOwned(user!.id, params.id);
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const body = await parseJsonBody(request);
    const title = optionalString(body.title, "title", 300);
    const type = optionalEnum(body.type, "type", RESOURCE_TYPES);
    const resourceType = optionalEnum(
      body.resourceType,
      "resourceType",
      RESOURCE_ENUM
    );
    const url = optionalString(body.url, "url", 2048);
    const description = optionalString(body.description, "description", 5000);
    const filePath = optionalString(body.filePath, "filePath", 1024);
    const sourcePlatform = optionalString(
      body.sourcePlatform,
      "sourcePlatform",
      100
    );
    const courseId = optionalString(body.courseId, "courseId", 64);
    const trackId = optionalString(body.trackId, "trackId", 64);

    let isCompleted: boolean | undefined;
    if (body.isCompleted !== undefined) {
      if (typeof body.isCompleted !== "boolean") {
        throw new BadRequestError("isCompleted must be a boolean");
      }
      isCompleted = body.isCompleted;
    }
    let isFavorite: boolean | undefined;
    if (body.isFavorite !== undefined) {
      if (typeof body.isFavorite !== "boolean") {
        throw new BadRequestError("isFavorite must be a boolean");
      }
      isFavorite = body.isFavorite;
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
    if (trackId) {
      const owns = await prisma.track.findFirst({
        where: { id: trackId, userId: user!.id },
        select: { id: true },
      });
      if (!owns) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }
    }

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && title !== null && { title }),
        ...(type && { type }),
        ...(resourceType && { resourceType }),
        ...(url !== undefined && { url }),
        ...(description !== undefined && { description }),
        ...(filePath !== undefined && { filePath }),
        ...(sourcePlatform !== undefined && { sourcePlatform }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(courseId !== undefined && { courseId }),
        ...(trackId !== undefined && { trackId }),
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
    const existing = await findOwned(user!.id, params.id);
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    await prisma.resource.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "resources.delete");
  }
}
