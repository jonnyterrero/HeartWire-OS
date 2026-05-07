import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public liveness + DB readiness probe.
 * Used by uptime monitors and Vercel's deployment health checks.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "ok",
      latencyMs: Date.now() - startedAt,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[health] db check failed", err);
    return NextResponse.json(
      {
        status: "degraded",
        db: "down",
        error: err instanceof Error ? err.message : "unknown",
        ts: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
