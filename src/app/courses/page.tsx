import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourseProgress } from "@/lib/stats";

export const metadata = { title: "My Courses | Iceberg" };

export default async function CoursesPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const courses = await getEnrolledCourseProgress(user.id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">My Courses</h1>
        <p className="text-xs text-[#64748B] font-semibold mt-1">
          {courses.length === 0
            ? "Nothing assigned yet."
            : `${courses.length} course${courses.length === 1 ? "" : "s"} assigned to you.`}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="border border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center bg-white">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-[#0F172A]">No courses assigned</h2>
          <p className="text-xs text-[#64748B] font-semibold mt-1 max-w-sm mx-auto">
            Your administrator assigns courses to you. They&apos;ll appear here as soon as they do.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => {
            const href = c.nextActivityId
              ? `/learn/${c.courseId}/${c.nextActivityId}`
              : `/course/${c.courseId}`;
            const done = c.percent === 100;
            return (
              <Link
                key={c.courseId}
                href={href}
                className="group flex flex-col bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#CBD5E1] hover:shadow-sm transition-all !no-underline"
              >
                <div className="aspect-[16/9] bg-[#F1F5F9] overflow-hidden">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h2 className="text-sm font-bold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#4F46E5] transition-colors">
                    {c.title}
                  </h2>
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B]">
                      <span>{done ? "Completed" : `${c.completedActivities} of ${c.totalActivities} done`}</span>
                      <span className={done ? "text-green-600" : "text-[#0F172A]"}>{c.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${done ? "bg-green-500" : "bg-[#4F46E5]"}`}
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] pt-1">
                      {c.percent === 0 ? "Start" : done ? "Review" : "Continue"}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
