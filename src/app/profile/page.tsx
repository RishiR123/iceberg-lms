import { Award, ShieldCheck, Mail, Calendar, User, Sparkles, CheckCircle2, Bookmark, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourseProgress, getLearnerStats, getActivityHeatmap } from "@/lib/stats";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";

export const metadata = {
  title: "Profile | Iceberg",
  description: "Your credentials, activity, and account details.",
};

export default async function ProfilePage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const [enrollments, stats, heatmap] = await Promise.all([
    getEnrolledCourseProgress(user.id),
    getLearnerStats(user.id),
    getActivityHeatmap(user.id),
  ]);

  const completedCourses = enrollments.filter((c) => c.totalActivities > 0 && c.percent === 100);
  const primaryPathway = enrollments.find((c) => c.percent < 100) ?? enrollments[0] ?? null;

  const initial = user.name ? user.name.slice(0, 1).toUpperCase() : "T";

  return (
    <div className="flex-1 bg-background min-h-full flex flex-col font-sans selection:bg-[#EEF2FF] selection:text-[#0F172A] pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-10 w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Premium Scholar Profile Card */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E2E8F0]/50 p-6 md:p-8 shadow-md relative overflow-hidden text-left">
            
            {/* Main Avatar Illustration */}
            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-[#E2E8F0]/30">
              <div className="relative group select-none">
                <div className="w-24 h-24 rounded-3xl bg-[#0F172A] text-white flex items-center justify-center font-black text-4xl shadow-lg border-2 border-white transition-transform group-hover:scale-105">
                  {initial}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
              </div>
              
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0F172A] uppercase tracking-wider bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-black/5">
                  <Sparkles className="w-2.5 h-2.5" /> {user.role === "ADMIN" ? "Administrator" : "Student"}
                </span>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{user.name}</h2>
                <p className="text-xs font-bold text-[#64748B]">
                  {completedCourses.length > 0
                    ? `${completedCourses.length} course${completedCourses.length === 1 ? "" : "s"} completed`
                    : "No courses completed yet"}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 py-6 text-center select-none">
              <div className="bg-[#F8FAFC]/30 rounded-2xl p-2.5 border border-[#E2E8F0]/20">
                <span className="block text-lg font-black text-[#0F172A]">{enrollments.length}</span>
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Enrollments</span>
              </div>
              <div className="bg-[#EEF2FF] rounded-2xl p-2.5 border border-[#E0E7FF]">
                <span className="block text-lg font-black text-[#0F172A]">{stats.coursesCompleted}</span>
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Completed</span>
              </div>
              <div className="bg-[#EEF2FF]/15 rounded-2xl p-2.5 border border-cyan-200/20">
                <span className="block text-lg font-black text-[#0F172A]">{stats.activitiesCompleted}</span>
                <span className="text-[9px] text-[#64748B] uppercase font-bold">Activities</span>
              </div>
            </div>

            {/* Personal Details Row list */}
            <div className="space-y-4 pt-4 border-t border-[#E2E8F0]/30">
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Email Address</span>
                  <span className="text-xs font-semibold text-[#0F172A]">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Role</span>
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {user.role === "ADMIN" ? "Administrator" : "Student"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Registered</span>
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Active Learning Path Progress Mini widget */}
          <div className="bg-[#0F172A] text-white rounded-3xl p-6 text-left space-y-4 shadow-lg relative overflow-hidden select-none">
            <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
              <Bookmark className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#4F46E5]" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#EEF2FF]">Primary Pathway</span>
            </div>
            <div className="space-y-1">
              {primaryPathway ? (
                <>
                  <h3 className="font-extrabold text-sm text-white">{primaryPathway.title}</h3>
                  <p className="text-[11px] text-[#EEF2FF] font-medium">
                    {primaryPathway.percent}% completed — {primaryPathway.completedActivities} of{" "}
                    {primaryPathway.totalActivities} activities.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-extrabold text-sm text-white">No active pathway</h3>
                  <p className="text-[11px] text-[#EEF2FF] font-medium">
                    Enroll in a course to start tracking progress.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verified Credentials & Accomplishments */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Section 1 Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0]/40 pb-3 text-left">
            <h2 className="text-xs font-bold uppercase text-[#64748B] tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0F172A]" /> Verified Skill Credentials
            </h2>
            <span className="text-[10px] font-black uppercase text-green-700 bg-[#EEF2FF] border border-green-200 px-3 py-1 rounded-full">
              {completedCourses.length} EARNED
            </span>
          </div>

          {/* Credentials are earned: one per course the learner actually finished. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {completedCourses.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 border border-dashed border-[#E2E8F0] rounded-2xl p-8 bg-white text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-[#64748B] mx-auto" />
                <h4 className="font-black text-sm text-[#0F172A]">No credentials yet</h4>
                <p className="text-[11px] text-[#64748B] font-semibold">
                  Finish every activity in a course to earn its credential.
                </p>
              </div>
            ) : (
              completedCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="border border-[#E2E8F0]/60 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[220px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-extrabold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full uppercase border border-black/5">
                        Completed
                      </span>
                      <ShieldCheck className="w-5 h-5 text-amber-500 fill-amber-100" />
                    </div>
                    <h4 className="font-black text-sm text-[#0F172A] leading-snug">{course.title}</h4>
                  </div>

                  <div className="pt-4 border-t border-slate-50 mt-4 space-y-1 select-none">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Activities completed</span>
                    <span className="text-[10px] font-black text-[#0F172A] block">
                      {course.completedActivities} of {course.totalActivities}
                    </span>
                    {course.completedAt && (
                      <span className="text-[9px] text-[#64748B] font-semibold">
                        Completed on{" "}
                        {course.completedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 2: LeetCode-style Active Learning Heatmap */}
          <div className="flex items-center gap-1.5 border-b border-[#E2E8F0]/40 pt-6 pb-3 text-left">
            <Activity className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Activity
            </h3>
          </div>



          <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#0F172A]">Activity over the last 32 weeks</h4>
                <p className="text-xs text-[#64748B] font-semibold">
                  Each square is a day; darker means more activities completed.
                </p>
              </div>

              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#0F172A]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black tracking-tight text-[#0F172A] leading-none">
                    {stats.activitiesCompleted}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 leading-none">
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* The actual Contribution Heatmap Grid */}
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="min-w-[640px] flex gap-3 select-none">
                
                {/* Weekday labels */}
                <div className="flex flex-col justify-between py-1 text-[9px] font-black text-slate-400 w-5 pr-1 shrink-0">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* One column per week, shaded by how many activities were completed that day. */}
                <div className="flex-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${heatmap.length}, minmax(0, 1fr))` }}>
                  {heatmap.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid gap-[3px]" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
                      {week.map((day) => {
                        let bgClass = "bg-slate-100 border border-slate-200/20";
                        if (day.count >= 7) bgClass = "bg-[#216e39]";
                        else if (day.count >= 5) bgClass = "bg-[#30a14e]";
                        else if (day.count >= 3) bgClass = "bg-[#40c463]";
                        else if (day.count >= 1) bgClass = "bg-[#9be9a8]";

                        return (
                          <div
                            key={day.date}
                            className={`w-2.5 h-2.5 rounded-[2px] transition-all hover:scale-110 ${bgClass}`}
                            title={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"} completed`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid footer legend */}
            <div className="flex justify-between items-center text-[9px] font-bold text-[#64748B] border-t border-[#E2E8F0]/30 pt-3 select-none">
              <span>Updated as you complete activities.</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200/20" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#9be9a8]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#40c463]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#30a14e]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#216e39]" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Section 3: Account settings — real, editable */}
          <div className="flex items-center gap-1.5 border-b border-[#E2E8F0]/40 pt-4 pb-3 text-left">
            <User className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Account Settings</h3>
          </div>

          <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-[#0F172A]">Profile</h4>
                <p className="text-[11px] text-[#64748B] font-semibold">
                  Your name and email as they appear across Iceberg.
                </p>
              </div>
              <ProfileForm name={user.name} email={user.email} />
            </div>

            <div className="space-y-4 pt-6 border-t border-[#E2E8F0]/40">
              <div>
                <h4 className="text-sm font-black text-[#0F172A]">Password</h4>
                <p className="text-[11px] text-[#64748B] font-semibold">
                  You&apos;ll need your current password to set a new one.
                </p>
              </div>
              <PasswordForm />
            </div>

            <div className="pt-6 border-t border-[#E2E8F0]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[10px] text-[#64748B] font-semibold">
                Member since{" "}
                {user.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
              </p>
              <Link
                href="/dashboard"
                className="text-[11px] font-black text-[#4F46E5] hover:underline !no-underline hover:!underline"
              >
                Return to catalog →
              </Link>
            </div>
          </div>

          {/* User management lives in the admin dashboard now. */}
          {user.role === "ADMIN" && (
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-8 shadow-sm text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black">Manage people and courses</h4>
                <p className="text-[11px] text-[#EEF2FF] font-medium">
                  Create accounts, set roles and author courses in the admin workspace.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-black rounded-xl hover:bg-[#EEF2FF]/90 transition-all active:scale-95 !no-underline flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Open admin workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
