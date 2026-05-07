import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Centralised error → JSON response mapping.
 * Use inside a try/catch in every route handler:
 *
 *   try { ... } catch (err) { return apiError(err, "tasks.create"); }
 */
export function apiError(err: unknown, scope = "api"): NextResponse {
  if (err instanceof BadRequestError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint violation" },
        { status: 409 }
      );
    }
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign key constraint failed" },
        { status: 400 }
      );
    }
  }

  console.error(`[${scope}] unhandled error`, err);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : String(err);
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Throwable 400 — call inside a route handler, let `apiError` map it.
 */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

/**
 * Parse a JSON body. Returns `{}` on empty body, throws BadRequestError on
 * malformed JSON. Always returns a plain object (rejects arrays/primitives).
 */
export async function parseJsonBody<T extends Record<string, unknown> = Record<string, unknown>>(
  request: Request
): Promise<T> {
  const text = await request.text();
  if (!text) return {} as T;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BadRequestError("Invalid JSON body");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new BadRequestError("Body must be a JSON object");
  }
  return parsed as T;
}

/**
 * Safe non-empty trimmed string. Returns the trimmed value or throws 400.
 * Use for required string fields:
 *   const title = requireString(body.title, "title");
 */
export function requireString(value: unknown, field: string, max = 500): string {
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new BadRequestError(`${field} is required`);
  }
  if (trimmed.length > max) {
    throw new BadRequestError(`${field} must be ${max} characters or fewer`);
  }
  return trimmed;
}

/**
 * Optional trimmed string. Returns trimmed value, null (if explicitly null),
 * or undefined (if missing/empty). Use in PATCH-style updates.
 */
export function optionalString(
  value: unknown,
  field: string,
  max = 500
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new BadRequestError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new BadRequestError(`${field} must be ${max} characters or fewer`);
  }
  return trimmed || null;
}

/**
 * Whitelisted enum-style validator.
 *   const status = requireEnum(body.status, "status", ["TODO","IN_PROGRESS","DONE"]);
 */
export function requireEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new BadRequestError(
      `${field} must be one of: ${allowed.join(", ")}`
    );
  }
  return value as T;
}

export function optionalEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T | undefined {
  if (value === undefined || value === null) return undefined;
  return requireEnum(value, field, allowed);
}

/**
 * Optional positive integer (e.g. duration, sortOrder).
 */
export function optionalInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new BadRequestError(`${field} must be an integer`);
  }
  return value;
}

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const COURSE_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export const RESOURCE_TYPES = ["BOOK", "VIDEO", "ARTICLE", "COURSE"] as const;
