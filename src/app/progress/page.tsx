import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckCircle2, Activity, Trophy, ListChecks } from "lucide-react";
import { getLearnerStats, getEnrolledCourseProgress, getActivityHeatmap } from "@/lib/stats";

export const metadata = { title: "Progress | Iceberg" };

export default async function ProgressPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const [stats, courses, heatmap] = await Promise.all([
    getLearnerStats(user.id),
    getEnrolledCourseProgress(user.id),
    getActivityHeatmap(user.id),
  ]);

  const tiles = [
    { label: "Courses completed", value: stats.coursesCompleted, icon: Trophy },
    { label: "In progress", value: stats.coursesInProgress, icon: Activity },
    { label: "Activities done", value: stats.activitiesCompleted, icon: CheckCircle2 },
    { label: "Quizzes passed", value: stats.quizzesPassed, icon: ListChecks },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full space-y-8">
      <div>
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Progress</h1>
        <p className="text-xs text-[#64748B] font-semibold mt-1">Everything you&apos;ve completed, tracked from real activity.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] mb-4">
              <t.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-3xl font-black text-[#0F172A] leading-none">{t.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mt-2">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Per-course progress */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="text-sm font-black text-[#0F172A] mb-4">By course</h2>
        {courses.length === 0 ? (
          <p className="text-xs text-[#64748B] font-semibold">No courses assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((c) => {
              const done = c.percent === 100;
              return (
                <div key={c.courseId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] truncate pr-3">{c.title}</span>
                    <span className={`font-semibold flex-shrink-0 ${done ? "text-green-600" : "text-[#64748B]"}`}>
                      {c.completedActivities}/{c.totalActivities} · {c.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${done ? "bg-green-500" : "bg-[#4F46E5]"}`}
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity heatmap */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-black text-[#0F172A]">Activity</h2>
          <span className="text-[10px] font-semibold text-[#64748B]">Last 32 weeks · darker = more completed</span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[640px] flex gap-3">
            <div className="flex flex-col justify-between py-1 text-[9px] font-bold text-slate-400 w-6 pr-1 shrink-0">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div
              className="flex-1 grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${heatmap.length}, minmax(0, 1fr))` }}
            >
              {heatmap.map((week, wi) => (
                <div key={wi} className="grid gap-[3px]" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
                  {week.map((day) => {
                    let bg = "bg-[#F1F5F9]";
                    if (day.count >= 7) bg = "bg-[#3730A3]";
                    else if (day.count >= 5) bg = "bg-[#4F46E5]";
                    else if (day.count >= 3) bg = "bg-[#818CF8]";
                    else if (day.count >= 1) bg = "bg-[#C7D2FE]";
                    return (
                      <div
                        key={day.date}
                        className={`w-2.5 h-2.5 rounded-[2px] ${bg}`}
                        title={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
