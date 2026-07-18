import { prisma } from "./prisma";

export type CourseProgressSummary = {
  courseId: string;
  title: string;
  thumbnail: string | null;
  totalActivities: number;
  completedActivities: number;
  percent: number;
  enrolledAt: Date;
  completedAt: Date | null;
  // First unfinished activity, for "continue where you left off".
  nextActivityId: string | null;
};

/**
 * Progress for every course the user is enrolled in, computed from
 * ActivityProgress rather than stored, so it can't drift out of sync when an
 * admin adds or removes activities.
 */
export async function getEnrolledCourseProgress(userId: string): Promise<CourseProgressSummary[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { activities: { orderBy: { order: "asc" }, select: { id: true } } },
          },
        },
      },
    },
  });

  if (enrollments.length === 0) return [];

  const completedIds = new Set(
    (
      await prisma.activityProgress.findMany({
        where: { userId, completed: true },
        select: { activityId: true },
      })
    ).map((r) => r.activityId)
  );

  return enrollments.map((e) => {
    const activityIds = e.course.modules.flatMap((m) => m.activities.map((a) => a.id));
    const completed = activityIds.filter((id) => completedIds.has(id));
    const next = activityIds.find((id) => !completedIds.has(id)) ?? null;

    return {
      courseId: e.course.id,
      title: e.course.title,
      thumbnail: e.course.thumbnail,
      totalActivities: activityIds.length,
      completedActivities: completed.length,
      percent: activityIds.length === 0 ? 0 : Math.round((completed.length / activityIds.length) * 100),
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      nextActivityId: next,
    };
  });
}

export type LearnerStats = {
  coursesCompleted: number;
  coursesInProgress: number;
  activitiesCompleted: number;
  quizzesPassed: number;
};

export async function getLearnerStats(userId: string): Promise<LearnerStats> {
  const [courses, activitiesCompleted, quizzesPassed] = await Promise.all([
    getEnrolledCourseProgress(userId),
    prisma.activityProgress.count({ where: { userId, completed: true } }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
  ]);

  return {
    coursesCompleted: courses.filter((c) => c.totalActivities > 0 && c.percent === 100).length,
    coursesInProgress: courses.filter((c) => c.percent > 0 && c.percent < 100).length,
    activitiesCompleted,
    quizzesPassed,
  };
}

export type DayActivity = { label: string; count: number };

/**
 * Completions per day for the last 7 days. This is the only time-shaped data the
 * app actually records — there is no session timer, so nothing here is "hours".
 */
export async function getWeeklyActivity(userId: string): Promise<DayActivity[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const rows = await prisma.activityProgress.findMany({
    where: { userId, completed: true, completedAt: { gte: start } },
    select: { completedAt: true },
  });

  const days: DayActivity[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);

    days.push({
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      count: rows.filter((r) => r.completedAt && r.completedAt >= day && r.completedAt < next).length,
    });
  }
  return days;
}

export type HeatmapDay = { date: string; count: number };

/**
 * Completions per day across `weeks` weeks, ending today. Returns a dense grid
 * (7 rows x weeks columns) walking back from the most recent Saturday, so the
 * caller can render it directly without filling gaps.
 */
export async function getActivityHeatmap(userId: string, weeks = 32): Promise<HeatmapDay[][]> {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  // Walk forward to the end of the current week so today sits in the last column.
  end.setDate(end.getDate() + (6 - end.getDay()));

  const start = new Date(end);
  start.setDate(end.getDate() - (weeks * 7 - 1));

  const rows = await prisma.activityProgress.findMany({
    where: { userId, completed: true, completedAt: { gte: start } },
    select: { completedAt: true },
  });

  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.completedAt) continue;
    const key = r.completedAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const grid: HeatmapDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      const key = day.toISOString().slice(0, 10);
      column.push({ date: key, count: counts.get(key) ?? 0 });
    }
    grid.push(column);
  }
  return grid;
}

export type CourseSocialProof = {
  averageRating: number | null;
  reviewCount: number;
  learnerCount: number;
};

/** Derived from real reviews and enrollments — no course claims proof it hasn't earned. */
export async function getCourseSocialProof(courseId: string): Promise<CourseSocialProof> {
  const [agg, learnerCount] = await Promise.all([
    prisma.courseReview.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.enrollment.count({ where: { courseId } }),
  ]);

  return {
    averageRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    reviewCount: agg._count.rating,
    learnerCount,
  };
}

export async function getSocialProofForCourses(courseIds: string[]): Promise<Map<string, CourseSocialProof>> {
  const [reviews, enrollments] = await Promise.all([
    prisma.courseReview.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _count: { courseId: true },
    }),
  ]);

  const map = new Map<string, CourseSocialProof>();
  for (const id of courseIds) {
    const r = reviews.find((x) => x.courseId === id);
    const e = enrollments.find((x) => x.courseId === id);
    map.set(id, {
      averageRating: r?._avg.rating ? Math.round(r._avg.rating * 10) / 10 : null,
      reviewCount: r?._count.rating ?? 0,
      learnerCount: e?._count.courseId ?? 0,
    });
  }
  return map;
}
