import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, parseJsonBody, requireString } from "@/lib/api";

type Params = { params: { id: string } };

async function ownsResource(userId: string, resourceId: string) {
  const r = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      OR: [{ userId }, { course: { track: { userId } } }],
    },
    select: { id: true },
  });
  return !!r;
}

export async function POST(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    if (!(await ownsResource(user!.id, params.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await parseJsonBody(request);
    const tagId = requireString(body.tagId, "tagId", 64);
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId: user!.id },
      select: { id: true },
    });
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    await prisma.resourceTag.upsert({
      where: { resourceId_tagId: { resourceId: params.id, tagId } },
      update: {},
      create: { resourceId: params.id, tagId },
    });
    return NextResponse.json({ attached: true }, { status: 201 });
  } catch (err) {
    return apiError(err, "resources.tags.attach");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    if (!(await ownsResource(user!.id, params.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await parseJsonBody(request);
    const tagId = requireString(body.tagId, "tagId", 64);
    await prisma.resourceTag.deleteMany({
      where: { resourceId: params.id, tagId },
    });
    return NextResponse.json({ detached: true });
  } catch (err) {
    return apiError(err, "resources.tags.detach");
  }
}
