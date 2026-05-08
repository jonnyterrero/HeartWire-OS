import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  apiError,
  optionalString,
  parseJsonBody,
  requireString,
} from "@/lib/api";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: user!.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (err) {
    return apiError(err, "tags.list");
  }
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const name = requireString(body.name, "name", 50);
    const color = optionalString(body.color, "color", 32);
    const tag = await prisma.tag.create({
      data: { userId: user!.id, name, color: color ?? null },
    });
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    return apiError(err, "tags.create");
  }
}
