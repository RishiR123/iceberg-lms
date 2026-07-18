"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Plus, X } from "lucide-react";
import { assignCourseAction, unassignCourseAction } from "@/app/actions/enrollmentActions";

export type AssignableCourse = {
  id: string;
  title: string;
  difficulty: string;
  duration: string;
  activityCount: number;
  assignedUserIds: string[];
};

export function AssignCourses({
  userId,
  userName,
  courses,
}: {
  userId: string;
  userName: string;
  courses: AssignableCourse[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const assigned = courses.filter((c) => c.assignedUserIds.includes(userId));
  const available = courses.filter((c) => !c.assignedUserIds.includes(userId));

  const run = (courseId: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    setBusyId(courseId);
    startTransition(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  };

  if (courses.length === 0) {
    return (
      <p className="text-[11px] text-[#645A95] font-semibold py-2">
        No courses exist yet — create one in the Courses section first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Assigned */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Assigned to {userName} ({assigned.length})
          </p>
          {assigned.length === 0 ? (
            <p className="text-[11px] text-[#645A95] font-semibold py-2">
              No courses assigned yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {assigned.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 bg-[#F5EFFF]/40 border border-[#E2D5F8]/60 rounded-xl px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#0B012C] truncate">{c.title}</p>
                    <p className="text-[9px] text-[#645A95] font-semibold">
                      {c.activityCount} activities · {c.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={() => run(c.id, () => unassignCourseAction(userId, c.id))}
                    disabled={busyId === c.id}
                    title="Remove assignment"
                    className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {busyId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Available ({available.length})
          </p>
          {available.length === 0 ? (
            <p className="text-[11px] text-[#645A95] font-semibold py-2 inline-flex items-center gap-1.5">
              <Check className="w-3 h-3" /> Assigned to every course.
            </p>
          ) : (
            <div className="space-y-1.5">
              {available.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 bg-white border border-[#E2D5F8]/60 rounded-xl px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#0B012C] truncate">{c.title}</p>
                    <p className="text-[9px] text-[#645A95] font-semibold">
                      {c.activityCount} activities · {c.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={() => run(c.id, () => assignCourseAction(userId, c.id))}
                    disabled={busyId === c.id}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-black text-[#2563EB] hover:underline disabled:opacity-40 cursor-pointer"
                  >
                    {busyId === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Assign
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-[#645A95] font-semibold">
        Removing an assignment hides the course from their dashboard but keeps their progress, so
        reassigning it restores their history.
      </p>
    </div>
  );
}
