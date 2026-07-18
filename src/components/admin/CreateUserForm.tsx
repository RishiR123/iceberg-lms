"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Copy, Check, X } from "lucide-react";
import { createUserAction } from "@/app/actions/accountActions";

type Created = {
  name: string;
  email: string;
  role: string;
  password: string;
  generated: boolean;
  emailStatus: "sent" | "failed" | "skipped" | "off";
};

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [autoPassword, setAutoPassword] = useState(true);
  const [password, setPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setEmail("");
    setRole("STUDENT");
    setAutoPassword(true);
    setPassword("");
    setSendEmail(true);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createUserAction({
        name,
        email,
        role,
        password: autoPassword ? undefined : password,
        sendEmail,
      });

      if (!res.success) {
        setError(res.error ?? "Could not create that account.");
        return;
      }

      setCreated({
        ...res.user,
        password: res.password,
        generated: res.generated,
        emailStatus: res.emailStatus,
      });
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Shown once — the password is hashed on save and can't be read back. */}
      {created && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-green-900">Account created — copy these credentials now</h4>
              <p className="text-[10px] text-green-800 font-semibold">
                {created.emailStatus === "sent"
                  ? `Emailed to ${created.email}. Also shown once below — it's stored hashed and can't be recovered later.`
                  : created.emailStatus === "failed"
                  ? "⚠️ Email failed to send — copy the password below and share it manually."
                  : created.emailStatus === "off"
                  ? "Email is not configured — copy the password below and share it manually."
                  : "This password is shown once. It's stored hashed, so it can't be recovered later — only reset."}
              </p>
            </div>
            <button
              onClick={() => setCreated(null)}
              className="text-green-700 hover:text-green-900 cursor-pointer flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-3 font-mono text-[11px] text-[#0B012C] space-y-1">
            <div>
              <span className="text-slate-400">email </span>
              {created.email}
            </div>
            <div>
              <span className="text-slate-400">pass&nbsp; </span>
              {created.password}
            </div>
          </div>

          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-[10px] font-bold rounded-lg hover:bg-green-800 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy credentials"}
          </button>
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B012C] text-white text-[11px] font-bold rounded-xl hover:bg-[#0B012C]/90 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> New account
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-[#E2D5F8] bg-[#F5EFFF]/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-[#0B012C]">Create an account</h4>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="text-slate-400 hover:text-[#0B012C] cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="nu-name" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
                Full Name
              </label>
              <input
                id="nu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
                placeholder="Ada Lovelace"
                className="w-full text-xs border border-[#E2D5F8]/60 px-4 py-3 rounded-xl bg-white focus:outline-none focus:border-[#2563EB]/60 font-semibold text-[#0B012C] disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="nu-email" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
                Email
              </label>
              <input
                id="nu-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                placeholder="ada@company.com"
                className="w-full text-xs border border-[#E2D5F8]/60 px-4 py-3 rounded-xl bg-white focus:outline-none focus:border-[#2563EB]/60 font-semibold text-[#0B012C] disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">Role</span>
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-[#E2D5F8]/60 max-w-xs">
              {(["STUDENT", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isPending}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    role === r ? "bg-[#0B012C] text-white shadow-sm" : "text-[#645A95] hover:bg-[#F5EFFF]"
                  }`}
                >
                  {r === "STUDENT" ? "Student" : "Admin"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPassword}
                onChange={(e) => setAutoPassword(e.target.checked)}
                disabled={isPending}
                className="accent-[#0B012C] w-3.5 h-3.5"
              />
              <span className="text-[11px] font-semibold text-[#0B012C]">
                Generate a strong password automatically
              </span>
            </label>

            {!autoPassword && (
              <div className="space-y-1.5">
                <label htmlFor="nu-pw" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
                  Initial Password
                </label>
                <input
                  id="nu-pw"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                  placeholder="At least 8 characters"
                  className="w-full max-w-xs text-xs border border-[#E2D5F8]/60 px-4 py-3 rounded-xl bg-white focus:outline-none focus:border-[#2563EB]/60 font-semibold text-[#0B012C] disabled:opacity-60"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={isPending}
                className="accent-[#0B012C] w-3.5 h-3.5"
              />
              <span className="text-[11px] font-semibold text-[#0B012C]">
                Email the sign-in details to this address
              </span>
            </label>
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B012C] text-white text-[11px] font-bold rounded-xl hover:bg-[#0B012C]/90 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Create account
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
