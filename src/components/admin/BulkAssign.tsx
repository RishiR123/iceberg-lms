"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Layers, X } from "lucide-react";
import { assignCourseBulkAction } from "@/app/actions/enrollmentActions";
import type { ManagedUser } from "./PeoplePanel";
import type { AssignableCourse } from "./AssignCourses";

/** Assign one course to many students at once. */
export function BulkAssign({
  students,
  courses,
}: {
  students: ManagedUser[];
  courses: AssignableCourse[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const course = courses.find((c) => c.id === courseId);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // "Select all" only offers those not already on the chosen course.
  const assignable = course
    ? students.filter((s) => !course.assignedUserIds.includes(s.id))
    : students;
  const allSelected = assignable.length > 0 && assignable.every((s) => selected.has(s.id));

  const reset = () => {
    setCourseId("");
    setSelected(new Set());
    setError(null);
  };

  const submit = () => {
    setError(null);
    if (!courseId) return setError("Pick a course.");
    if (selected.size === 0) return setError("Pick at least one student.");

    startTransition(async () => {
      const res = await assignCourseBulkAction([...selected], courseId);
      if (!res.success) {
        setError(res.error ?? "Could not assign the course.");
        return;
      }
      setDone(res.assigned);
      setTimeout(() => setDone(null), 4000);
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  if (courses.length === 0) return null;

  return (
    <div>
      {done !== null && (
        <p className="mb-3 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Assigned to {done} student{done === 1 ? "" : "s"}.
        </p>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-[11px] font-bold rounded-xl hover:bg-[#F8FAFC] transition-all active:scale-95 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" /> Bulk assign
        </button>
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/30 p-5 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-[#0F172A]">Assign a course to multiple students</h4>
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="text-slate-400 hover:text-[#0F172A] cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bulk-course" className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">
              Course
            </label>
            <select
              id="bulk-course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setSelected(new Set());
              }}
              disabled={isPending}
              className="w-full text-xs border border-[#E2E8F0]/60 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:border-[#4F46E5]/60 font-semibold text-[#0F172A] disabled:opacity-60"
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.activityCount} activities)
                </option>
              ))}
            </select>
          </div>

          {course && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">
                  Students ({selected.size} selected)
                </label>
                {assignable.length > 0 && (
                  <button
                    onClick={() =>
                      setSelected(allSelected ? new Set() : new Set(assignable.map((s) => s.id)))
                    }
                    className="text-[10px] font-bold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    {allSelected ? "Clear all" : "Select all unassigned"}
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-[#E2E8F0]/60 bg-white p-2">
                {students.map((s) => {
                  const already = course.assignedUserIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg select-none ${
                        already ? "opacity-45" : "cursor-pointer hover:bg-[#F8FAFC]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={already || selected.has(s.id)}
                        disabled={already || isPending}
                        onChange={() => toggle(s.id)}
                        className="accent-[#0F172A] w-3.5 h-3.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#0F172A] truncate block">{s.name}</span>
                        <span className="text-[9px] text-[#64748B] font-semibold truncate block">{s.email}</span>
                      </span>
                      {already && (
                        <span className="text-[9px] font-black uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Assigned
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={isPending || !courseId || selected.size === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0F172A] text-white text-[11px] font-bold rounded-xl hover:bg-[#0F172A]/90 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" /> Assign to {selected.size || 0} student
                {selected.size === 1 ? "" : "s"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
