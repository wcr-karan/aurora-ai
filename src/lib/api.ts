import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { getSession, type Role, type SessionUser } from "./auth";

/** Standard JSON success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

/** Standard JSON error envelope. */
export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details: extra },
    { status }
  );
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Wrap a route handler with uniform error handling. Throw ApiError (or any
 * Error) inside and it is converted to a clean JSON response.
 */
export function handler<T extends unknown[]>(
  fn: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.message, err.status);
      if (err instanceof ZodError) {
        return fail("Validation failed", 422, err.flatten());
      }
      console.error("[api] unhandled error:", err);
      return fail("Internal server error", 500);
    }
  };
}

/** Require an authenticated session; throws 401 otherwise. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new ApiError("Not authenticated", 401);
  return session;
}

/** Require a session with one of the allowed roles (RBAC); throws 403 otherwise. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (roles.length && !roles.includes(session.role)) {
    throw new ApiError("Insufficient permissions", 403);
  }
  return session;
}

/** Parse + validate a JSON request body against a Zod schema. */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
  return schema.parse(raw);
}
