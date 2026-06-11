import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { env } from "./env";

const SESSION_COOKIE = "helpdesk_session";
const secret = new TextEncoder().encode(env.authSecret);
const ALG = "HS256";

export type Role = "OWNER" | "AGENT";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  businessId: string;
}

export interface JWTPayload extends SessionUser {
  [key: string]: unknown;
}

// ── password hashing ─────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── token sign / verify ──────────────────────────────────────────────────────
export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] });
    const p = payload as JWTPayload;
    if (!p.id || !p.businessId) return null;
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
      businessId: p.businessId,
    };
  } catch {
    return null;
  }
}

// ── cookie helpers ───────────────────────────────────────────────────────────
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Read + verify the current session from the request cookies. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Load the full user record for the current session (or null). */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { business: true },
  });
  return user;
}
