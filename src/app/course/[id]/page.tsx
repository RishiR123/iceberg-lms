import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle,
  BookOpen,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Circle,
  Star,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLoggedInUser } from "@/lib/auth";
import { getCourseMetadata } from "@/lib/courseMetadata";
import { getCourseSocialProof } from "@/lib/stats";
import { ReviewForm } from "@/components/ReviewForm";
import type { ActivityType } from "@prisma/client";

const TYPE_META: Record<ActivityType, { label: string; icon: typeof PlayCircle }> = {
  VIDEO: { label: "Video", icon: PlayCircle },
  READING: { label: "Reading", icon: BookOpen },
  QUIZ: { label: "Graded quiz", icon: HelpCircle },
  PRACTICE_QUIZ: { label: "Practice", icon: HelpCircle },
  DISCUSSION: { label: "Discussion", icon: MessageSquare },
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const { id } = await params;

  // Assigned-only: a course you weren't given is not yours to read.
  if (user.role !== "ADMIN") {
    const assigned = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: id } },
      select: { id: true },
    });
    if (!assigned) redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { activities: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  const [completedRows, attempts, socialProof, reviews, enrolled, myReview] = await Promise.all([
    prisma.activityProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { activityId: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id, passed: true },
      select: { activityId: true, score: true },
    }),
    getCourseSocialProof(course.id),
    prisma.courseReview.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { id: true },
    }),
    prisma.courseReview.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    }),
  ]);

  const isEnrolled = enrolled !== null;
  const meta = getCourseMetadata(course);
  const completed = new Set(completedRows.map((r) => r.activityId));

  // Best passed score per activity, for showing quiz results inline.
  const bestScore = new Map<string, number>();
  for (const a of attempts) {
    bestScore.set(a.activityId, Math.max(bestScore.get(a.activityId) ?? 0, a.score));
  }

  const allActivities = course.modules.flatMap((m) => m.activities);
  const doneCount = allActivities.filter((a) => completed.has(a.id)).length;
  const percent = allActivities.length ? Math.round((doneCount / allActivities.length) * 100) : 0;
  const nextActivity = allActivities.find((a) => !completed.has(a.id)) ?? null;
  const resumeHref = nextActivity
    ? `/learn/${course.id}/${nextActivity.id}`
    : allActivities[0]
    ? `/learn/${course.id}/${allActivities[0].id}`
    : null;

  const skills = course.skills ? course.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        {!isEnrolled && (
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full mb-3">
            Admin preview
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">{course.title}</h1>
        <p className="text-sm text-[#64748B] mt-2 max-w-2xl leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] font-semibold mt-3">
          <span>{meta.instructor}</span>
          <span className="text-slate-300">·</span>
          <span>{course.modules.length} modules · {allActivities.length} activities</span>
          {socialProof.reviewCount > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {socialProof.averageRating} ({socialProof.reviewCount})
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Modules — the workspace */}
        <div className="lg:col-span-2 space-y-4">
          {course.modules.map((mod) => {
            const acts = mod.activities;
            const modDone = acts.filter((a) => completed.has(a.id)).length;
            return (
              <div key={mod.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <h2 className="text-sm font-bold text-[#0F172A] truncate">{mod.title}</h2>
                  <span className="text-[10px] font-bold text-[#64748B] flex-shrink-0">
                    {modDone}/{acts.length}
                  </span>
                </div>
                <ul className="divide-y divide-[#F1F5F9]">
                  {acts.map((a) => {
                    const isDone = completed.has(a.id);
                    const t = TYPE_META[a.type];
                    const score = a.type === "QUIZ" ? bestScore.get(a.id) : undefined;
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/learn/${course.id}/${a.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors group !no-underline"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4.5 h-4.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4.5 h-4.5 text-slate-300 flex-shrink-0" />
                          )}
                          <t.icon className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                          <span className="flex-1 min-w-0 text-xs font-semibold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                            {a.title}
                          </span>
                          {score !== undefined && (
                            <span className="text-[10px] font-bold text-green-600 flex-shrink-0">{score}%</span>
                          )}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 hidden sm:block">
                            {t.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  {acts.length === 0 && (
                    <li className="px-5 py-4 text-xs text-[#64748B] font-semibold">No activities yet.</li>
                  )}
                </ul>
              </div>
            );
          })}

          {/* Reviews */}
          <div className="pt-4 space-y-4">
            <h2 className="text-sm font-black text-[#0F172A]">Reviews</h2>
            {isEnrolled && (
              <ReviewForm
                courseId={course.id}
                existingRating={myReview?.rating}
                existingBody={myReview?.body ?? undefined}
              />
            )}
            {reviews.length === 0 ? (
              <p className="text-xs text-[#64748B] font-semibold">
                No reviews yet.{" "}
                {isEnrolled ? "Be the first to leave one." : "Only assigned learners can review."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
                    <div className="flex items-center gap-0.5 mb-2 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-slate-200"}`} />
                      ))}
                    </div>
                    {rev.body && (
                      <p className="text-xs text-[#0F172A] italic leading-relaxed">&ldquo;{rev.body}&rdquo;</p>
                    )}
                    <p className="text-[10px] text-[#64748B] font-semibold mt-2">
                      {rev.user.name} ·{" "}
                      {rev.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky progress / resume sidebar */}
        <aside className="lg:sticky lg:top-6 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-bold text-[#0F172A]">Your progress</span>
              <span className="text-2xl font-black text-[#0F172A]">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full ${percent === 100 ? "bg-green-500" : "bg-[#4F46E5]"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] font-semibold text-[#64748B] mb-4">
              {doneCount} of {allActivities.length} activities complete
            </p>

            {resumeHref && (
              <Link
                href={resumeHref}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-lg text-xs font-bold transition-colors !no-underline"
              >
                {percent === 0 ? "Start course" : percent === 100 ? "Review course" : "Continue"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {skills.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-3">What you&apos;ll learn</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="text-[10px] font-semibold text-[#0F172A] bg-[#F1F5F9] px-2 py-1 rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs">
            {[
              ["Difficulty", course.difficulty],
              ["Duration", course.duration],
              ["Instructor", meta.instructor],
              ["Enrolled", `${socialProof.learnerCount}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[#64748B] font-semibold">{k}</span>
                <span className="text-[#0F172A] font-bold">{v}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
