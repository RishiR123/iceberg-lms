"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, User, Mail } from "lucide-react";
import { updateProfileAction } from "@/app/actions/accountActions";

export function ProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = name !== initialName || email !== initialEmail;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateProfileAction({ name, email });
      if (!res.success) {
        setError(res.error ?? "Could not save your profile.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="acct-name" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
            Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              id="acct-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="w-full text-xs border border-[#E2D5F8]/60 pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#2563EB]/60 focus:bg-white transition-all font-semibold text-[#0B012C] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="acct-email" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              id="acct-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="w-full text-xs border border-[#E2D5F8]/60 pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#2563EB]/60 focus:bg-white transition-all font-semibold text-[#0B012C] disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !dirty}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B012C] text-white text-[11px] font-bold rounded-xl hover:bg-[#0B012C]/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
            </>
          ) : saved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            "Save changes"
          )}
        </button>
        {dirty && !isPending && (
          <span className="text-[10px] text-[#645A95] font-semibold">Unsaved changes</span>
        )}
      </div>
    </form>
  );
}
