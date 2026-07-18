import Link from "next/link";
import { ArrowUpRight, BookOpen, BarChart3, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

const features = [
  {
    icon: BookOpen,
    title: "Assigned courses",
    body: "Administrators assign courses to each person. Everyone sees exactly what they need to work through — nothing more.",
  },
  {
    icon: BarChart3,
    title: "Progress that's real",
    body: "Every completed activity, quiz attempt and score is tracked per person, so progress reflects actual work.",
  },
  {
    icon: CheckCircle2,
    title: "Quizzes & completion",
    body: "Graded quizzes are marked on the server with pass thresholds, so completion means the material was understood.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 bg-white text-[#0F172A] min-h-full flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#E2E8F0]/50 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-[#0F172A]">
            <Logo markClassName="w-5 h-5" className="text-lg" />
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#E2E8F0]/40">
        <div className="max-w-3xl mx-auto text-center px-6 py-24 md:py-32 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Learning, organised.
          </h1>
          <p className="text-[#64748B] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Iceberg is your team's learning platform — assigned courses, real progress tracking,
            and quizzes, in one place.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Sign in <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#0F172A]">
                <f.icon className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold">{f.title}</h2>
              <p className="text-xs text-[#64748B] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0]/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between text-[#64748B]">
          <Logo markClassName="w-4 h-4" className="text-sm" />
          <span className="text-xs">© 2026 Iceberg. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
