"use server";

import { prisma } from "@/lib/prisma";
import { getLoggedInUser, requireAdmin, hashPassword, comparePassword, signJWT, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail, sendPasswordResetEmail, isMailConfigured } from "@/lib/mail";

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Refreshes the session cookie so it carries the user's current name/email/role. */
async function reissueSession(user: { id: string; name: string; email: string; role: string }) {
  const token = await signJWT({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function updateProfileAction(input: { name: string; email: string }) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";

  if (!name) return { success: false as const, error: "Name can't be empty." };
  if (!isValidEmail(email)) return { success: false as const, error: "That doesn't look like a valid email." };

  try {
    // Only a conflict with somebody *else* matters; keeping your own email is fine.
    const clash = await prisma.user.findFirst({
      where: { email, NOT: { id: user.id } },
      select: { id: true },
    });
    if (clash) return { success: false as const, error: "That email is already in use." };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    });

    await reissueSession(updated);
    revalidatePath("/profile");
    return { success: true as const };
  } catch (error: any) {
    console.error("updateProfile error:", error);
    return { success: false as const, error: "Could not save your profile." };
  }
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string }) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const currentPassword = typeof input?.currentPassword === "string" ? input.currentPassword : "";
  const newPassword = typeof input?.newPassword === "string" ? input.newPassword : "";

  if (!currentPassword || !newPassword) {
    return { success: false as const, error: "Both fields are required." };
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { success: false as const, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (newPassword === currentPassword) {
    return { success: false as const, error: "New password must be different from the current one." };
  }

  try {
    // Proving the current password stops someone with a borrowed session from
    // locking the real owner out.
    const matches = await comparePassword(currentPassword, user.password);
    if (!matches) return { success: false as const, error: "Your current password is incorrect." };

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });

    return { success: true as const };
  } catch (error: any) {
    console.error("changePassword error:", error);
    return { success: false as const, error: "Could not change your password." };
  }
}

/** Ambiguous characters (0/O, 1/l/I) are left out so temp passwords survive being read aloud. */
function generatePassword(length = 14) {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function createUserAction(input: {
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  password?: string;
  sendEmail?: boolean;
}) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const role = input?.role === "ADMIN" ? "ADMIN" : "STUDENT";
  const manual = typeof input?.password === "string" ? input.password : "";

  if (!name) return { success: false as const, error: "Name is required." };
  if (!isValidEmail(email)) return { success: false as const, error: "That doesn't look like a valid email." };
  if (manual && manual.length < MIN_PASSWORD_LENGTH) {
    return { success: false as const, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { success: false as const, error: "An account with that email already exists." };

    const password = manual || generatePassword();

    const user = await prisma.user.create({
      data: { name, email, role, password: await hashPassword(password) },
    });

    // Email the credentials if asked. A mail failure must not fail account
    // creation — the admin still gets the password back to hand over manually.
    let emailStatus: "sent" | "failed" | "skipped" | "off" = "off";
    if (input?.sendEmail) {
      if (!isMailConfigured()) {
        emailStatus = "off";
      } else {
        const res = await sendWelcomeEmail({
          to: email,
          name,
          password,
          loginUrl: `${process.env.APP_URL || ""}/login`,
        });
        emailStatus = res.sent ? "sent" : "failed";
      }
    }

    revalidatePath("/admin");
    // Returned once so the admin can pass it on; it is only ever stored hashed.
    return {
      success: true as const,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      password,
      generated: !manual,
      emailStatus,
    };
  } catch (error: any) {
    console.error("createUser error:", error);
    return { success: false as const, error: "Could not create that account." };
  }
}

export async function resetUserPasswordAction(userId: string, sendEmail = false) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!target) return { success: false as const, error: "User not found." };

    const password = generatePassword();
    await prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(password) } });

    let emailStatus: "sent" | "failed" | "skipped" | "off" = "off";
    if (sendEmail && isMailConfigured()) {
      const res = await sendPasswordResetEmail({
        to: target.email,
        name: target.name,
        password,
        loginUrl: `${process.env.APP_URL || ""}/login`,
      });
      emailStatus = res.sent ? "sent" : "failed";
    }

    revalidatePath("/admin");
    return {
      success: true as const,
      password,
      name: target.name,
      isSelf: target.id === actor.id,
      emailStatus,
    };
  } catch (error: any) {
    console.error("resetUserPassword error:", error);
    return { success: false as const, error: "Could not reset that password." };
  }
}

export async function listUsersAction() {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required.", users: [] };
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true, progress: true } },
    },
  });

  return {
    success: true as const,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      enrollments: u._count.enrollments,
      activitiesCompleted: u._count.progress,
    })),
  };
}

export async function setUserRoleAction(userId: string, role: "STUDENT" | "ADMIN") {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  if (role !== "STUDENT" && role !== "ADMIN") {
    return { success: false as const, error: "Invalid role." };
  }

  try {
    // Demoting the last admin would leave nobody able to administer anything,
    // including undoing the demotion.
    if (role === "STUDENT") {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!target) return { success: false as const, error: "User not found." };

      if (target.role === "ADMIN") {
        const admins = await prisma.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) {
          return { success: false as const, error: "This is the only administrator — promote someone else first." };
        }
      }
    }

    const updated = await prisma.user.update({ where: { id: userId }, data: { role } });

    // Your own session carries your role; refresh it so the change takes effect now.
    if (updated.id === actor.id) {
      await reissueSession(updated);
    }

    revalidatePath("/profile");
    return { success: true as const };
  } catch (error: any) {
    console.error("setUserRole error:", error);
    return { success: false as const, error: "Could not update that user's role." };
  }
}

export async function deleteUserAction(userId: string) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  if (userId === actor.id) {
    return { success: false as const, error: "You can't delete your own account from here." };
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!target) return { success: false as const, error: "User not found." };

    if (target.role === "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        return { success: false as const, error: "That's the only administrator — promote someone else first." };
      }
    }

    // Cascades their enrollments, progress, attempts, notes, posts and reviews.
    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/profile");
    return { success: true as const };
  } catch (error: any) {
    console.error("deleteUser error:", error);
    return { success: false as const, error: "Could not delete that user." };
  }
}
