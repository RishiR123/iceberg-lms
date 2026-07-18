"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/app/actions/authActions";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginAction({ email, password }, "STUDENT");
      if (res?.success) {
        router.push(searchParams.get("next") || "/dashboard");
        router.refresh();
      } else {
        setError(res?.error || "Invalid credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen">
      <div className="bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* LEFT: the form, on a warm gradient */}
        <div className="relative bg-gradient-to-b from-white via-white to-[#FEF08A]/40 p-8 md:p-12 flex flex-col overflow-y-auto">
          {/* Brand pill */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 self-start border border-[#0B012C]/15 rounded-full px-4 py-2 text-sm font-black tracking-tight text-[#0B012C] hover:border-[#0B012C]/40 transition-colors !no-underline hover:!no-underline"
          >
<Logo markClassName="w-4 h-4" />
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10">
            <div className="text-center space-y-1.5 mb-8">
              <h1 className="text-3xl font-black text-[#0B012C] tracking-tight">Welcome back</h1>
              <p className="text-xs text-[#645A95] font-semibold">
                Sign in to continue your learning.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[11px] font-bold text-[#645A95] block pl-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full text-sm bg-white/70 border border-[#0B012C]/10 pl-11 pr-4 py-3.5 rounded-full focus:outline-none focus:border-[#0B012C]/30 focus:bg-white transition-all font-medium text-[#0B012C] placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[11px] font-bold text-[#645A95] block pl-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full text-sm bg-white/70 border border-[#0B012C]/10 pl-11 pr-11 py-3.5 rounded-full focus:outline-none focus:border-[#0B012C]/30 focus:bg-white transition-all font-medium text-[#0B012C] placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B012C] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#FEF08A] hover:bg-[#FDE047] text-[#0B012C] rounded-full text-sm font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#645A95] select-none">
            <span>Accounts are created by your administrator.</span>
            <span>© 2026 Iceberg</span>
          </div>
        </div>

        {/* RIGHT: imagery. Hidden on small screens where the form is all that matters. */}
        <div className="relative hidden lg:block">
          <div className="relative w-full h-full overflow-hidden bg-[#0B012C]">
            <img
              src="/hero_student.png"
              alt="A learner working through a course"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B012C]/85 via-[#0B012C]/15 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-1.5">
              <h2 className="text-xl font-black tracking-tight leading-snug">
                Everything you learn, in one place.
              </h2>
              <p className="text-xs text-white/70 font-medium max-w-xs leading-relaxed">
                Your courses, progress and notes stay with your account — on any device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 bg-white selection:bg-[#FEF08A] selection:text-[#0B012C] font-sans">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#645A95]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
