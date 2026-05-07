import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const tag = await prisma.tag.findFirst({
      where: { id: params.id, userId: user!.id },
      select: { id: true },
    });
    if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.tag.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return apiError(err, "tags.delete");
  }
}
