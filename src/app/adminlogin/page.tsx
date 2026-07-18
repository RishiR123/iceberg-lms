"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, ShieldAlert, GraduationCap } from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/app/actions/authActions";
import { Logo } from "@/components/Logo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongPortal, setWrongPortal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWrongPortal(false);

    try {
      const res = await loginAction({ email, password }, "ADMIN");
      if (res?.success) {
        router.push(searchParams.get("next") || "/admin");
        router.refresh();
      } else {
        setError(res?.error || "Invalid credentials.");
        setWrongPortal(Boolean((res as { wrongPortal?: boolean })?.wrongPortal));
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 relative">
      <div className="absolute -top-12 left-0 select-none">
        <Link
          href="/"
          className="text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5 transition-colors !no-underline hover:!no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2D5F8]/60 p-8 md:p-10 shadow-lg text-left">
        <div className="space-y-2 mb-6">
          <div className="text-[#0B012C]">
            <Logo markClassName="w-5 h-5" className="text-xl" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#0B012C] px-2.5 py-1 rounded-full">
            <ShieldAlert className="w-3 h-3" /> Admin Portal
          </div>
          <h1 className="text-2xl font-black text-[#0B012C] tracking-tight pt-2">Administrator sign in</h1>
          <p className="text-xs text-[#645A95] font-semibold">
            Restricted to administrator accounts.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold space-y-1.5">
            <p>⚠️ {error}</p>
            {wrongPortal && (
              <Link href="/login" className="inline-flex items-center gap-1 font-black underline text-red-800">
                <GraduationCap className="w-3 h-3" /> Go to the student portal
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@company.com"
                className="w-full text-xs border border-[#E2D5F8]/60 pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0B012C]/60 focus:bg-white transition-all font-semibold text-[#0B012C]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-[10px] font-bold text-[#0B012C] uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full text-xs border border-[#E2D5F8]/60 pl-10 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0B012C]/60 focus:bg-white transition-all font-semibold text-[#0B012C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer select-none bg-[#0B012C] hover:bg-[#0B012C]/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying…</span>
              </>
            ) : (
              <span>Sign in to admin</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#E2D5F8]/40 text-center text-[10px] text-[#645A95] font-semibold select-none space-y-2">
          <p>Unauthorized access is not permitted.</p>
          <Link
            href="/login"
            className="text-[#645A95] hover:text-[#0B012C] font-bold inline-flex items-center gap-1 !no-underline hover:!underline"
          >
            <GraduationCap className="w-3 h-3" /> Student portal
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-white/40 font-semibold select-none">
        © 2026 Iceberg. All rights reserved.
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex-1 bg-[#0B012C] min-h-screen flex items-center justify-center p-6 selection:bg-[#E9D5FF] selection:text-[#0B012C] font-sans">
      <Suspense fallback={<Loader2 className="w-5 h-5 animate-spin text-white/60" />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
