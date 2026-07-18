import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

// A missing secret must fail loudly: falling back to a literal would let anyone
// who has read the repo mint a valid session token.
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to .env before starting the app.");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const SESSION_COOKIE = "jwt_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * One source of truth for the session cookie. `secure` follows the environment:
 * off in local dev (plain HTTP), on in production (HTTPS) so the cookie is never
 * sent in the clear. Every place that sets the cookie must use this.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getLoggedInUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getLoggedInUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: administrator access is required for this operation.");
  }
  return user;
}
