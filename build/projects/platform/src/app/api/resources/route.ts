import { NextResponse } from "next/server";
import { Prisma, type ResourceType } from "@prisma/client";
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
import {
  bucketToResourceTypeEnum,
  classifyResourceType,
} from "@/lib/classify-resource";

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

export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const type = searchParams.get("type");
    const resourceTypeRaw = searchParams.get("resourceType");
    const resourceTypes = resourceTypeRaw
      ? resourceTypeRaw.split(",").filter(Boolean)
      : null;
    const completed = searchParams.get("completed");
    const trackId = searchParams.get("trackId");
    const favorite = searchParams.get("favorite");

    const where: Prisma.ResourceWhereInput = {
      deletedAt: null,
      OR: [
        { userId: user!.id },
        { course: { track: { userId: user!.id } } },
      ],
      ...(courseId && { courseId }),
      ...(type && type !== "ALL" && { type }),
      ...(resourceTypes &&
        resourceTypes.length > 0 && {
          resourceType: {
            in: resourceTypes.filter((t): t is ResourceType =>
              (RESOURCE_ENUM as readonly string[]).includes(t)
            ),
          },
        }),
      ...(completed !== null && { isCompleted: completed === "true" }),
      ...(trackId && { trackId }),
      ...(favorite === "true" && { isFavorite: true }),
    };

    const resources = await prisma.resource.findMany({
      where,
      include: {
        course: { select: { title: true, code: true } },
        track: { select: { title: true, color: true } },
        tags: { include: { tag: true } },
      },
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
    const courseId = optionalString(body.courseId, "courseId", 64);
    const trackId = optionalString(body.trackId, "trackId", 64);
    const type = optionalEnum(body.type, "type", RESOURCE_TYPES) ?? "ARTICLE";
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
    const isFavorite = body.isFavorite === true;

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

    // Auto-classify when caller didn't supply one. Keeps Library sub-pages
    // populated even for free-form user adds.
    const finalResourceType =
      resourceType ??
      bucketToResourceTypeEnum(classifyResourceType(url, title));

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        resourceType: finalResourceType,
        url: url ?? null,
        description: description ?? null,
        filePath: filePath ?? null,
        sourcePlatform: sourcePlatform ?? null,
        isFavorite,
        courseId: courseId ?? null,
        trackId: trackId ?? null,
        userId: user!.id,
        isCompleted: false,
      },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    return apiError(err, "resources.create");
  }
}
