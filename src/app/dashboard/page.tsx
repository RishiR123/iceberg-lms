import { CheckCircle2, Sparkles, Activity } from "lucide-react";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLearnerStats, getEnrolledCourseProgress, getWeeklyActivity } from "@/lib/stats";

export const metadata = {
  title: "Dashboard | Iceberg",
  description: "View your learning completions, hours active, and schedule metrics.",
};

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const [stats, courses, weekly] = await Promise.all([
    getLearnerStats(user.id),
    getEnrolledCourseProgress(user.id),
    getWeeklyActivity(user.id),
  ]);

  const peakDay = Math.max(...weekly.map((d) => d.count), 1);
  const inProgress = courses.filter((c) => c.percent < 100);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <div className="flex-1 bg-background min-h-full flex flex-col font-sans selection:bg-[#E9D5FF] selection:text-[#0B012C]">
      
      {/* Upper header section */}
      <section className="bg-white border-b border-[#E2D5F8]/40 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left space-y-2">
            <div className="flex items-center space-x-2 text-[#0B012C] text-xs font-bold uppercase tracking-wider bg-[#F5EFFF] px-3 py-1 rounded-full w-max border border-[#E2D5F8]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Iceberg Workspace</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B012C] tracking-tight">Welcome back! {user.name}</h1>
            <p className="text-sm text-[#645A95] font-semibold">Track your progress and pick up where you left off.</p>
          </div>
          
          <div className="flex items-center gap-3 select-none">
            <span className="text-xs font-bold text-[#0B012C] bg-[#FEF08A] px-3.5 py-1.5 rounded-full border border-[#E2D5F8]/40">
              {user.role === "ADMIN" ? "Administrator" : "Student"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main metrics and grids (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Completed */}
            <div className="border border-[#E2D5F8]/60 bg-white rounded-3xl p-6 text-left relative overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-[#D9F99D] flex items-center justify-center text-[#0B012C]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#645A95] uppercase tracking-wider block">Courses Completed</span>
              <span className="text-4xl font-black text-[#0B012C] block mt-4">{stats.coursesCompleted}</span>
            </div>

            {/* In Progress */}
            <div className="border border-[#E2D5F8]/60 bg-[#F5EFFF]/30 rounded-3xl p-6 text-left relative overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-[#FEF08A] flex items-center justify-center text-[#0B012C]">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#645A95] uppercase tracking-wider block">Courses in Progress</span>
              <span className="text-4xl font-black text-[#0B012C] block mt-4">{stats.coursesInProgress}</span>
            </div>

            {/* Activities Completed */}
            <div className="border border-[#E2D5F8]/60 bg-white rounded-3xl p-6 text-left relative overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-[#A5F3FC] flex items-center justify-center text-[#0B012C]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#645A95] uppercase tracking-wider block">Activities Completed</span>
              <span className="text-4xl font-black text-[#0B012C] block mt-4">{stats.activitiesCompleted}</span>
            </div>

          </div>

          {/* 2. Middle Row: Select Category & Active hours bar chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Block: Select Category & Tasks cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2D5F8]/30 pb-3">
                <h3 className="text-xs font-black uppercase text-[#645A95] tracking-wider">Continue Learning</h3>
                <span className="text-[10px] font-bold text-[#645A95]">
                  {courses.length} assigned
                </span>
              </div>

              <div className="space-y-4">
                {inProgress.length === 0 ? (
                  <div className="border border-dashed border-[#E2D5F8] rounded-3xl p-6 bg-white text-left space-y-2">
                    <h4 className="font-extrabold text-sm text-[#0B012C]">
                      {courses.length === 0 ? "No courses assigned yet" : "Nothing in progress"}
                    </h4>
                    <p className="text-[11px] text-[#645A95] font-semibold">
                      {courses.length === 0
                        ? "Your administrator assigns courses to you — they'll appear here when they do."
                        : "You've finished everything assigned to you."}
                    </p>
                  </div>
                ) : (
                  inProgress.map((course) => (
                    <div
                      key={course.courseId}
                      className="border border-[#E2D5F8]/50 rounded-3xl p-5 bg-white text-left flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="space-y-2 min-w-0">
                        <span className="bg-[#F5EFFF] text-[#0B012C] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                          {course.percent}% complete
                        </span>
                        <h4 className="font-extrabold text-sm text-[#0B012C] truncate">{course.title}</h4>
                        <span className="text-[10px] text-[#645A95] font-semibold block">
                          {course.completedActivities} of {course.totalActivities} activities done
                        </span>
                      </div>
                      <Link
                        href={
                          course.nextActivityId
                            ? `/learn/${course.courseId}/${course.nextActivityId}`
                            : `/course/${course.courseId}`
                        }
                        className="w-8 h-8 flex-shrink-0 rounded-full bg-[#0B012C] hover:bg-[#0B012C]/90 text-white flex items-center justify-center text-xs"
                        aria-label={`Continue ${course.title}`}
                      >
                        ➔
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Block: Active hours weekly bar chart */}
            <div className="border border-[#E2D5F8]/60 bg-[#0B012C] rounded-3xl p-6 text-left flex flex-col justify-between shadow-md text-white min-h-[340px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#E9D5FF] tracking-wider">This Week</h3>
                  <span className="text-[10px] text-white/60 font-semibold block">Activities completed per day</span>
                </div>
              </div>

              {/* Bar heights are scaled against the week's busiest day. */}
              <div className="h-44 flex items-end justify-between gap-3 px-2 pt-6">
                {weekly.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-white/10 rounded-t-lg relative overflow-hidden h-36 flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.count > 0 ? "bg-[#FEF08A]" : "bg-transparent"
                        }`}
                        style={{ height: `${Math.round((day.count / peakDay) * 100)}%` }}
                        title={`${day.count} completed`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/70">{day.label}</span>
                  </div>
                ))}
              </div>
              {stats.activitiesCompleted === 0 && (
                <p className="text-[10px] text-white/50 font-semibold text-center pt-3">
                  Complete an activity and it will appear here.
                </p>
              )}
            </div>

          </div>

          {/* 3. Task Schedule Calendar Widget block */}
          <div className="border border-[#E2D5F8]/60 bg-white rounded-3xl p-6 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2D5F8]/30 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#645A95] uppercase tracking-wider block">Calendar</span>
                <h3 className="text-base font-black text-[#0B012C]">
                  {today.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center select-none font-bold">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                <span key={idx} className="text-xs text-[#645A95] font-extrabold py-1">{day}</span>
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dateNum = idx + 1;
                const isToday = dateNum === today.getDate();
                return (
                  <span
                    key={idx}
                    className={`text-xs py-2 rounded-xl flex items-center justify-center border transition-all ${
                      isToday
                        ? "bg-[#FEF08A] text-[#0B012C] border-[#0B012C]/30 font-black scale-105 shadow-sm"
                        : "text-[#0B012C] border-transparent"
                    }`}
                  >
                    {dateNum}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ongoing, Upcoming and Schedule panels (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Ongoing Courses Progress Panel */}
          <div className="border border-[#E2D5F8]/60 bg-white rounded-3xl p-6 text-left shadow-sm space-y-5">
            <div className="border-b border-[#E2D5F8]/30 pb-3">
              <h3 className="text-xs font-black uppercase text-[#645A95] tracking-wider">Ongoing Courses</h3>
            </div>

            <div className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-[11px] text-[#645A95] font-semibold">No enrollments yet.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.courseId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0B012C] gap-2">
                      <span className="truncate">{course.title}</span>
                      <span className="flex-shrink-0">{course.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-[#E2D5F8]/20">
                      <div className="bg-[#0B012C] h-full rounded-full" style={{ width: `${course.percent}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
