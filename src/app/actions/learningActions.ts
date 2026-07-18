"use server";

import { prisma } from "@/lib/prisma";
import { getLoggedInUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const PASS_MARK = 80;

export async function setActivityCompletionAction(activityId: string, completed: boolean) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (typeof activityId !== "string" || typeof completed !== "boolean") {
    return { success: false as const, error: "Invalid request." };
  }

  try {
    await prisma.activityProgress.upsert({
      where: { userId_activityId: { userId: user.id, activityId } },
      create: {
        userId: user.id,
        activityId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: { completed, completedAt: completed ? new Date() : null },
    });

    revalidatePath("/dashboard");
    return { success: true as const, completed };
  } catch (error: any) {
    console.error("setActivityCompletion error:", error);
    return { success: false as const, error: "Could not save your progress." };
  }
}

export async function getCompletedActivityIds(): Promise<string[]> {
  const user = await getLoggedInUser();
  if (!user) return [];

  const rows = await prisma.activityProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { activityId: true },
  });
  return rows.map((r) => r.activityId);
}

type SubmittedAnswers = Record<string, number | number[]>;

function isAnswerCorrect(correct: number | number[], submitted: number | number[] | undefined) {
  if (submitted === undefined) return false;

  if (Array.isArray(correct)) {
    if (!Array.isArray(submitted)) return false;
    const a = [...correct].sort();
    const b = [...submitted].sort();
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return submitted === correct;
}

/**
 * Grades against the answer key held in the database. The key is never sent to
 * the browser, so a student cannot read it out of the page source or mark
 * themselves complete by calling this with a fabricated score.
 */
export async function submitQuizAction(activityId: string, answers: SubmittedAnswers) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  try {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) return { success: false as const, error: "Activity not found." };

    let questions: Array<{ id: string; correct: number | number[]; explanation?: string }>;
    try {
      questions = JSON.parse(activity.content);
    } catch {
      return { success: false as const, error: "This quiz is not configured correctly." };
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return { success: false as const, error: "This quiz has no questions." };
    }

    const results: Record<string, { correct: boolean; correctAnswer: number | number[]; explanation?: string }> = {};
    let correctCount = 0;

    for (const q of questions) {
      const correct = isAnswerCorrect(q.correct, answers[q.id]);
      if (correct) correctCount++;
      results[q.id] = { correct, correctAnswer: q.correct, explanation: q.explanation };
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= PASS_MARK;
    const isPractice = activity.type === "PRACTICE_QUIZ";

    await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        activityId,
        score,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    // The activity's own rule decides whether this attempt completes it: a
    // practice quiz only asks for an attempt, a graded one requires the mark.
    const rule = activity.completionRule;
    const earnsCompletion =
      rule === "ATTEMPT" || rule === "VISIT" || isPractice ? true : rule === "SCORE_80" ? passed : passed;

    if (earnsCompletion) {
      await prisma.activityProgress.upsert({
        where: { userId_activityId: { userId: user.id, activityId } },
        create: { userId: user.id, activityId, completed: true, completedAt: new Date() },
        update: { completed: true, completedAt: new Date() },
      });
    }

    revalidatePath("/dashboard");
    return { success: true as const, score, passed, results, completed: earnsCompletion };
  } catch (error: any) {
    console.error("submitQuiz error:", error);
    return { success: false as const, error: "Could not submit your attempt." };
  }
}

export async function saveNoteAction(activityId: string, body: string) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (typeof activityId !== "string" || typeof body !== "string") {
    return { success: false as const, error: "Invalid request." };
  }

  try {
    await prisma.note.upsert({
      where: { userId_activityId: { userId: user.id, activityId } },
      create: { userId: user.id, activityId, body },
      update: { body },
    });
    return { success: true as const };
  } catch (error: any) {
    console.error("saveNote error:", error);
    return { success: false as const, error: "Could not save your note." };
  }
}

export async function getNoteAction(activityId: string) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in.", body: "" };

  if (typeof activityId !== "string") {
    return { success: false as const, error: "Invalid request.", body: "" };
  }

  const note = await prisma.note.findUnique({
    where: { userId_activityId: { userId: user.id, activityId } },
  });
  return { success: true as const, body: note?.body ?? "" };
}

export async function postDiscussionAction(activityId: string, body: string, parentId?: string) {
  const user = await getLoggedInUser();
  if (!user) return { success: false as const, error: "You must be signed in." };

  // A server action is a public endpoint: validate rather than assume the
  // caller is our own form.
  if (typeof activityId !== "string" || typeof body !== "string") {
    return { success: false as const, error: "Invalid request." };
  }

  const trimmed = body.trim();
  if (!trimmed) return { success: false as const, error: "Your reply can't be empty." };

  try {
    await prisma.discussionPost.create({
      data: { userId: user.id, activityId, body: trimmed, parentId: parentId ?? null },
    });
    return { success: true as const };
  } catch (error: any) {
    console.error("postDiscussion error:", error);
    return { success: false as const, error: "Could not post your reply." };
  }
}

export async function getDiscussionAction(activityId: string) {
  if (typeof activityId !== "string") return [];

  const posts = await prisma.discussionPost.findMany({
    where: { activityId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return posts.map((p) => ({
    id: p.id,
    body: p.body,
    parentId: p.parentId,
    createdAt: p.createdAt.toISOString(),
    authorId: p.user.id,
    authorName: p.user.name,
  }));
}
