"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Lock } from "lucide-react";
import { changePasswordAction } from "@/app/actions/accountActions";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Checked here purely for a fast message; the server does the real validation.
    if (newPassword !== confirmPassword) {
      setError("The new passwords don't match.");
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction({ currentPassword, newPassword });
      if (!res.success) {
        setError(res.error ?? "Could not change your password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    autoComplete: string
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          id={id}
          type="password"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          disabled={isPending}
          placeholder="••••••••"
          className="w-full text-xs border border-[#E2D5F8]/60 pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#2563EB]/60 focus:bg-white transition-all font-semibold text-[#0B012C] disabled:opacity-60"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {field("cur-pw", "Current Password", currentPassword, setCurrentPassword, "current-password")}
        {field("new-pw", "New Password", newPassword, setNewPassword, "new-password")}
        {field("cnf-pw", "Confirm New", confirmPassword, setConfirmPassword, "new-password")}
      </div>

      {error && (
        <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-[11px] text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Password changed.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B012C] text-white text-[11px] font-bold rounded-xl hover:bg-[#0B012C]/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating
            </>
          ) : saved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Updated
            </>
          ) : (
            "Change password"
          )}
        </button>
        <span className="text-[10px] text-[#645A95] font-semibold">At least 8 characters.</span>
      </div>
    </form>
  );
}
