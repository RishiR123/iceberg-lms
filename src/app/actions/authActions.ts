"use server";

import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { rateLimit, rateLimitReset } from "@/lib/rateLimit";

// 10 failed-or-otherwise attempts per email+IP per 15 minutes.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

async function clientIp() {
  const h = await headers();
  // x-forwarded-for is a comma list; the first entry is the origin client.
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function loginAction(
  formData: FormData | Record<string, string>,
  portal: "STUDENT" | "ADMIN" = "STUDENT"
) {
  try {
    let email = "";
    let password = "";

    if (formData instanceof FormData) {
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    } else {
      email = formData.email;
      password = formData.password;
    }

    if (!email || !password) {
      return { success: false, error: "Email and password are required parameters." };
    }

    // Throttle per email+IP: caps guessing on one account without letting an
    // attacker lock a victim out by hammering their email from elsewhere.
    const normalizedEmail = email.trim().toLowerCase();
    const key = `login:${normalizedEmail}:${await clientIp()}`;
    const gate = rateLimit(key, LOGIN_LIMIT, LOGIN_WINDOW_MS);
    if (!gate.allowed) {
      const mins = Math.ceil(gate.retryAfterMs / 60000);
      return {
        success: false,
        error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      };
    }

    // Lookup user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return { success: false, error: "Invalid email or password credentials." };
    }

    // Verify password hash
    const match = await comparePassword(password, user.password);
    if (!match) {
      return { success: false, error: "Invalid email or password credentials." };
    }

    // Each portal only signs in its own kind of user. Checked after the password
    // so a wrong password can't be told apart from a wrong portal.
    if (portal === "ADMIN" && user.role !== "ADMIN") {
      return {
        success: false,
        error: "This is the admin portal. Students sign in at the student portal.",
        wrongPortal: true,
      };
    }
    if (portal === "STUDENT" && user.role === "ADMIN") {
      // Deliberately indistinguishable from a bad password: the student portal is
      // public, so a specific message here would reveal both which addresses are
      // administrators and that a separate admin portal exists.
      return { success: false, error: "Invalid email or password credentials." };
    }

    // Generate JWT
    const token = await signJWT({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    // A good login clears the counter so an honest user is never left throttled.
    rateLimitReset(key);

    return { success: true, name: user.name, role: user.role };
  } catch (error: any) {
    console.error("Login server action error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    return { success: true };
  } catch (error: any) {
    console.error("Logout server action error:", error);
    return { success: false, error: "Failed to logout session." };
  }
}
