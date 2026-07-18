"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, GraduationCap, Trash2, KeyRound, Copy, Check, X, Search, ChevronDown } from "lucide-react";
import { setUserRoleAction, deleteUserAction, resetUserPasswordAction } from "@/app/actions/accountActions";
import { CreateUserForm } from "./CreateUserForm";
import { AssignCourses, type AssignableCourse } from "./AssignCourses";
import { BulkAssign } from "./BulkAssign";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  enrollments: number;
  activitiesCompleted: number;
};

export function PeoplePanel({
  users,
  currentUserId,
  courses,
}: {
  users: ManagedUser[];
  currentUserId: string;
  courses: AssignableCourse[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reset, setReset] = useState<{ name: string; password: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const visible = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users;

  const admins = users.filter((u) => u.role === "ADMIN").length;

  const run = (id: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setBusyId(null);
      setConfirmId(null);
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  };

  const doReset = (u: ManagedUser) => {
    setError(null);
    setBusyId(u.id);
    startTransition(async () => {
      const res = await resetUserPasswordAction(u.id);
      setBusyId(null);
      if (!res.success) {
        setError(res.error ?? "Could not reset that password.");
        return;
      }
      setReset({ name: res.name, password: res.password });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-black text-[#0B012C]">People</h2>
          <p className="text-[11px] text-[#645A95] font-semibold">
            {users.length} account{users.length === 1 ? "" : "s"} · {admins} admin{admins === 1 ? "" : "s"} ·{" "}
            {users.length - admins} student{users.length - admins === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BulkAssign students={users} courses={courses} />
          <CreateUserForm />
        </div>
      </div>

      {reset && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-amber-900">New password for {reset.name}</h4>
              <p className="text-[10px] text-amber-800 font-semibold">
                Shown once. Their old password no longer works.
              </p>
            </div>
            <button onClick={() => setReset(null)} className="text-amber-700 hover:text-amber-900 cursor-pointer" aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-3 font-mono text-[11px] text-[#0B012C]">
            {reset.password}
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(reset.password);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 text-white text-[10px] font-bold rounded-lg hover:bg-amber-800 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy password"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {users.length > 5 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-full text-xs border border-[#E2D5F8]/60 pl-9 pr-3 py-2 rounded-xl bg-white focus:outline-none focus:border-[#2563EB]/60 font-semibold text-[#0B012C]"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2D5F8]/50">
              {["User", "Role", "Courses", "Completed", "Joined", ""].map((h) => (
                <th key={h} className="text-[9px] font-bold uppercase tracking-wider text-slate-400 pb-2.5 px-2 first:pl-0 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#645A95] font-semibold">
                  No accounts match “{query}”.
                </td>
              </tr>
            ) : (
              visible.map((u) => {
                const isSelf = u.id === currentUserId;
                const busy = busyId === u.id;

                return (
                  <Fragment key={u.id}>
                  <tr className="border-b border-[#E2D5F8]/25 hover:bg-[#F5EFFF]/25 transition-colors">
                    <td className="py-3 px-2 pl-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-[#0B012C] text-white flex items-center justify-center font-black text-[11px]">
                          {u.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0B012C] truncate">
                            {u.name}
                            {isSelf && <span className="text-[9px] text-[#645A95] font-semibold ml-1.5">(you)</span>}
                          </div>
                          <div className="text-[10px] text-[#645A95] font-semibold truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          u.role === "ADMIN"
                            ? "bg-[#0B012C] text-white border-black/10"
                            : "bg-[#F5EFFF] text-[#0B012C] border-[#E2D5F8]"
                        }`}
                      >
                        {u.role === "ADMIN" ? <ShieldCheck className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                        {u.role === "ADMIN" ? "Admin" : "Student"}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      <button
                        onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B012C] hover:text-[#2563EB] transition-colors cursor-pointer"
                        title={`Manage ${u.name}'s courses`}
                      >
                        {u.enrollments}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${expandedId === u.id ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-2 text-xs font-semibold text-[#0B012C]">{u.activitiesCompleted}</td>
                    <td className="py-3 px-2 text-[10px] font-semibold text-[#645A95] whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    <td className="py-3 px-2 pr-0">
                      <div className="flex items-center justify-end gap-3">
                        {busy && <Loader2 className="w-3 h-3 animate-spin text-[#645A95]" />}

                        <button
                          onClick={() => run(u.id, () => setUserRoleAction(u.id, u.role === "ADMIN" ? "STUDENT" : "ADMIN"))}
                          disabled={busy}
                          className="text-[10px] font-bold text-[#2563EB] hover:underline disabled:opacity-40 cursor-pointer whitespace-nowrap"
                        >
                          {u.role === "ADMIN" ? "Make student" : "Make admin"}
                        </button>

                        <button
                          onClick={() => doReset(u)}
                          disabled={busy}
                          title={`Reset password for ${u.name}`}
                          className="text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {!isSelf &&
                          (confirmId === u.id ? (
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <button
                                onClick={() => run(u.id, () => deleteUserAction(u.id))}
                                disabled={busy}
                                className="text-[10px] font-black text-red-600 hover:underline disabled:opacity-40 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="text-[10px] font-semibold text-[#645A95] hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmId(u.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title={`Remove ${u.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>

                  {expandedId === u.id && (
                    <tr className="border-b border-[#E2D5F8]/25 bg-[#F5EFFF]/20">
                      <td colSpan={6} className="px-2 pl-0 py-5">
                        <AssignCourses userId={u.id} userName={u.name} courses={courses} />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#645A95] font-semibold">
        Removing a user also removes their enrollments, progress, quiz attempts, notes and posts.
      </p>
    </div>
  );
}
