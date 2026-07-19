import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Trophy, Activity } from "lucide-react";
import { getLoggedInUser } from "@/lib/auth";
import { getLearnerStats, getEnrolledCourseProgress } from "@/lib/stats";
import { ProgressRing } from "@/components/ProgressRing";

export const metadata = { title: "Home | Iceberg" };

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const [stats, courses] = await Promise.all([
    getLearnerStats(user.id),
    getEnrolledCourseProgress(user.id),
  ]);

  // "Continue" picks the course you're partway through, else the first started,
  // else the first assigned.
  const inProgress = courses.filter((c) => c.percent > 0 && c.percent < 100);
  const resume = inProgress[0] ?? courses.find((c) => c.percent < 100) ?? courses[0] ?? null;
  const resumeHref = resume
    ? resume.nextActivityId
      ? `/learn/${resume.courseId}/${resume.nextActivityId}`
      : `/course/${resume.courseId}`
    : null;

  const tiles = [
    { label: "Completed", value: stats.coursesCompleted, icon: Trophy },
    { label: "In progress", value: stats.coursesInProgress, icon: Activity },
    { label: "Activities", value: stats.activitiesCompleted, icon: CheckCircle2 },
    { label: "Quizzes passed", value: stats.quizzesPassed, icon: BookOpen },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full space-y-8">
      <div>
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-xs text-[#64748B] font-semibold mt-1">
          {courses.length === 0
            ? "No courses assigned yet — they'll appear here when your administrator assigns them."
            : "Pick up where you left off."}
        </p>
      </div>

      {/* Continue learning */}
      {resume && resumeHref && (
        <Link
          href={resumeHref}
          className="group block bg-[#0F172A] text-white rounded-2xl p-6 !no-underline hover:bg-[#0F172A]/95 transition-colors"
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
            {resume.percent === 0 ? "Start learning" : "Continue learning"}
          </span>
          <div className="flex items-center justify-between gap-6 mt-3">
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight truncate">{resume.title}</h2>
              <p className="text-xs text-white/60 font-medium mt-1">
                {resume.completedActivities} of {resume.totalActivities} activities complete
              </p>
              <div className="w-48 max-w-full h-1.5 bg-white/15 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#818CF8] rounded-full" style={{ width: `${resume.percent}%` }} />
              </div>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white text-[#0F172A] text-xs font-bold px-4 py-2.5 rounded-lg group-hover:gap-2.5 transition-all">
              {resume.percent === 0 ? "Start" : "Continue"} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      )}

      {/* Stats strip → Progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href="/progress"
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#CBD5E1] transition-colors !no-underline"
          >
            <div className="flex items-center gap-2 text-[#64748B]">
              <t.icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
            </div>
            <div className="text-2xl font-black text-[#0F172A] mt-2">{t.value}</div>
          </Link>
        ))}
      </div>

      {/* Your courses */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0F172A]">Your courses</h2>
            <Link
              href="/courses"
              className="text-[11px] font-bold text-[#4F46E5] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((c) => {
              const href = c.nextActivityId
                ? `/learn/${c.courseId}/${c.nextActivityId}`
                : `/course/${c.courseId}`;
              return (
                <Link
                  key={c.courseId}
                  href={href}
                  className="group flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#CBD5E1] transition-colors !no-underline"
                >
                  <ProgressRing percent={c.percent} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-[#64748B] font-semibold mt-0.5">
                      {c.percent === 100
                        ? "Completed"
                        : `${c.completedActivities}/${c.totalActivities} activities`}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <div className="border border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center bg-white">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-[#0F172A]">Nothing assigned yet</h2>
          <p className="text-xs text-[#64748B] font-semibold mt-1 max-w-sm mx-auto">
            When an administrator assigns you a course, it&apos;ll show up here and under My Courses.
          </p>
        </div>
      )}
    </div>
  );
}
