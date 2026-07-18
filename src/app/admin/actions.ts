"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

// Course actions
export async function createCourseAction(data: {
  title: string;
  description: string;
  thumbnail?: string;
  difficulty?: string;
  duration?: string;
  instructor?: string;
  organization?: string;
  skills?: string;
  outcomes?: string;
  faqs?: string;
}) {
  try {
    await requireAdmin();
    const course = await prisma.course.create({
      data: {
        title: data.title || "Untitled Course",
        description: data.description || "No description provided.",
        thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
        difficulty: data.difficulty || "Beginner",
        duration: data.duration || "10 hours",
        instructor: data.instructor || "Lead Engineer",
        organization: data.organization || "Internal Corp",
        skills: data.skills || "",
        outcomes: data.outcomes || "",
        faqs: data.faqs || "",
      },
    });

    // Create a default Module 1
    const m = await prisma.module.create({
      data: {
        title: "Module 1 — Fundamentals Overview",
        description: "Welcome core materials and concepts.",
        order: 1,
        courseId: course.id,
      }
    });

    // Create a default Welcome Activity
    await prisma.activity.create({
      data: {
        title: "Welcome Overview to " + course.title,
        type: ActivityType.VIDEO,
        content: "<h2>Unit 1 Overview</h2><p>Welcome to this curriculum. Use the admin dashboard to write and publish content for this course.</p>",
        duration: "10 mins",
        order: 1,
        moduleId: m.id,
      },
    });

    revalidatePath("/");
    return { success: true, courseId: course.id };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message };
  }
}

export async function saveCourseAction(
  courseId: string,
  data: {
    title: string;
    description: string;
    thumbnail: string;
    difficulty: string;
    duration: string;
    instructor: string;
    organization: string;
    skills: string;
    outcomes: string;
    faqs: string;
  }
) {
  try {
    await requireAdmin();
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        difficulty: data.difficulty,
        duration: data.duration,
        instructor: data.instructor,
        organization: data.organization,
        skills: data.skills,
        outcomes: data.outcomes,
        faqs: data.faqs,
      },
    });

    revalidatePath("/");
    revalidatePath(`/course/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving course:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    await requireAdmin();
    await prisma.course.delete({
      where: { id: courseId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message };
  }
}

// Module Actions
export async function createModuleAction(
  courseId: string,
  data: {
    title: string;
    description?: string;
    order: number;
  }
) {
  try {
    await requireAdmin();
    const module = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description || "",
        order: data.order,
        courseId: courseId,
      },
    });

    revalidatePath("/");
    revalidatePath(`/course/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    return { success: true, moduleId: module.id };
  } catch (error: any) {
    console.error("Error creating module:", error);
    return { success: false, error: error.message };
  }
}

export async function saveModuleAction(
  moduleId: string,
  data: {
    title: string;
    description?: string;
    order: number;
  }
) {
  try {
    await requireAdmin();
    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
      },
    });

    revalidatePath("/");
    revalidatePath(`/course/${module.courseId}`);
    revalidatePath(`/learn/${module.courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving module:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteModuleAction(moduleId: string) {
  try {
    await requireAdmin();
    const module = await prisma.module.delete({
      where: { id: moduleId },
    });
    revalidatePath("/");
    revalidatePath(`/course/${module.courseId}`);
    revalidatePath(`/learn/${module.courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting module:", error);
    return { success: false, error: error.message };
  }
}

// Activity Actions
export async function createActivityAction(
  moduleId: string,
  data: {
    title: string;
    type: ActivityType;
    content: string;
    duration?: string;
    order: number;
  }
) {
  try {
    await requireAdmin();
    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        type: data.type,
        content: data.content,
        duration: data.duration || "10 mins",
        order: data.order,
        moduleId: moduleId,
      },
    });

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    });

    if (module) {
      revalidatePath("/");
      revalidatePath(`/course/${module.courseId}`);
      revalidatePath(`/learn/${module.courseId}/${activity.id}`);
    }

    return { success: true, activityId: activity.id };
  } catch (error: any) {
    console.error("Error creating activity:", error);
    return { success: false, error: error.message };
  }
}

export async function saveActivityAction(
  activityId: string,
  data: {
    title: string;
    type: ActivityType;
    content: string;
    duration?: string;
    resources?: string;
    completionRule?: string;
    videoUrl?: string;
    order: number;
  }
) {
  try {
    await requireAdmin();
    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title: data.title,
        type: data.type,
        content: data.content,
        duration: data.duration,
        resources: data.resources,
        completionRule: data.completionRule,
        videoUrl: data.videoUrl?.trim() || null,
        order: data.order,
      },
      include: {
        module: true,
      },
    });

    revalidatePath("/");
    revalidatePath(`/course/${activity.module.courseId}`);
    revalidatePath(`/learn/${activity.module.courseId}/${activityId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving activity:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteActivityAction(activityId: string) {
  try {
    await requireAdmin();
    const activity = await prisma.activity.delete({
      where: { id: activityId },
      include: {
        module: true,
      },
    });

    revalidatePath("/");
    revalidatePath(`/course/${activity.module.courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting activity:", error);
    return { success: false, error: error.message };
  }
}
