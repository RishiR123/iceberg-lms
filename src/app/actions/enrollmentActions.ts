"use server";

import { prisma } from "@/lib/prisma";
import { getLoggedInUser, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Courses are assigned by administrators — students never enroll themselves, so
 * every write here goes through requireAdmin. The only student-facing action is
 * leaving a review of a course they've been assigned.
 */

export async function assignCourseAction(userId: string, courseId: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  if (typeof userId !== "string" || typeof courseId !== "string") {
    return { success: false as const, error: "Invalid request." };
  }

  try {
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    ]);
    if (!user) return { success: false as const, error: "User not found." };
    if (!course) return { success: false as const, error: "Course not found." };

    // Idempotent: assigning twice is a no-op rather than an error.
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch (error: any) {
    console.error("assignCourse error:", error);
    return { success: false as const, error: "Could not assign that course." };
  }
}

export async function unassignCourseAction(userId: string, courseId: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  try {
    // Removes the assignment only. ActivityProgress and quiz attempts survive, so
    // reassigning the course later restores the learner's history rather than
    // silently wiping it.
    await prisma.enrollment.deleteMany({ where: { userId, courseId } });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch (error: any) {
    console.error("unassignCourse error:", error);
    return { success: false as const, error: "Could not remove that assignment." };
  }
}

/** Assigns one course to many students in a single call, idempotently. */
export async function assignCourseBulkAction(userIds: string[], courseId: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required." };
  }

  if (!Array.isArray(userIds) || typeof courseId !== "string" || userIds.length === 0) {
    return { success: false as const, error: "Pick at least one student." };
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return { success: false as const, error: "Course not found." };

    // Only assign to ids that are real student/admin accounts; ignore anything stale.
    const valid = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    if (valid.length === 0) return { success: false as const, error: "No matching users." };

    await prisma.enrollment.createMany({
      data: valid.map((u) => ({ userId: u.id, courseId })),
      skipDuplicates: true, // re-assigning is a no-op, never an error
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true as const, assigned: valid.length };
  } catch (error: any) {
    console.error("assignCourseBulk error:", error);
    return { success: false as const, error: "Could not assign the course." };
  }
}

/** Every course, plus who is currently assigned — powers the admin assignment UI. */
export async function listCoursesWithAssignmentsAction() {
  try {
    await requireAdmin();
  } catch {
    return { success: false as const, error: "Administrator access required.", courses: [] };
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      difficulty: true,
      duration: true,
      enrollments: { select: { userId: true } },
      modules: { select: { _count: { select: { activities: true } } } },
    },
  });

  return {
    success: true as const,
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      duration: c.duration,
      activityCount: c.modules.reduce((sum, m) => sum + m._count.activities, 0),
      assignedUserIds: c.enrollments.map((e) => e.userId),
    })),
  };
}

export async function submitReviewAction(courseId: string, rating: number, body?: string) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false as const, error: "Rating must be a whole number from 1 to 5." };
  }

  // Reviewing a course you were never assigned is exactly the fake social proof
  // this replaces, so assignment is required.
  const assigned = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (!assigned) {
    return { success: false as const, error: "You can only review a course you're assigned to." };
  }

  try {
    await prisma.courseReview.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      create: { userId: user.id, courseId, rating, body: body?.trim() || null },
      update: { rating, body: body?.trim() || null },
    });

    revalidatePath(`/course/${courseId}`);
    return { success: true as const };
  } catch (error: any) {
    console.error("submitReview error:", error);
    return { success: false as const, error: "Could not save your review." };
  }
}
