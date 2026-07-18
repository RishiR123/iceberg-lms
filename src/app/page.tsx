import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";

export default async function Home() {
  // Fetch the active course from the database
  const course = await prisma.course.findFirst({
    include: {
      modules: {
        orderBy: { order: "asc" },
      },
    },
  });

  // The catalog advertised on the landing page has to be the catalog that exists.
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },
    take: 6,
    include: {
      modules: { select: { _count: { select: { activities: true } } } },
    },
  });

  const courseCards = courses.map((c) => ({
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    duration: c.duration,
    moduleCount: c.modules.length,
    activityCount: c.modules.reduce((sum, m) => sum + m._count.activities, 0),
  }));

  // Whoever is actually credited on a course, grouped so each person appears once.
  const instructorGroups = await prisma.course.groupBy({
    by: ["instructor", "organization"],
    _count: { _all: true },
    orderBy: { instructor: "asc" },
    take: 3,
  });
  const instructors = instructorGroups.map((g) => ({
    instructor: g.instructor,
    organization: g.organization,
    courseCount: g._count._all,
  }));

  return (
    <div className="flex-1 bg-white text-[#0B012C] min-h-full flex flex-col font-sans selection:bg-[#E9D5FF] selection:text-[#0B012C]">
      
      {/* 1. Header Navigation Bar */}
      <header className="border-b border-[#E2D5F8]/40 bg-[#F5EFFF]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-[#0B012C] font-black text-xl tracking-tight flex items-center gap-1.5">
                <span className="text-xl">🧊</span> Iceberg
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#645A95]">
              <span className="hover:text-[#0B012C] cursor-pointer transition-colors">Explore</span>
              <span className="hover:text-[#0B012C] cursor-pointer transition-colors">Courses</span>
              <span className="hover:text-[#0B012C] cursor-pointer transition-colors">Online Degrees</span>
              <span className="hover:text-[#0B012C] cursor-pointer transition-colors">Certification</span>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-bold text-[#645A95] hover:text-[#0B012C] cursor-pointer transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#0B012C] hover:bg-[#0B012C]/90 text-white rounded-full text-xs font-bold transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Lavender Theme) */}
      <section className="py-16 md:py-24 bg-[#F5EFFF] relative overflow-hidden border-b border-[#E2D5F8]/40">
        
        {/* Floating background shape animations matching image */}
        <div className="absolute left-[8%] top-[15%] text-xl opacity-50 select-none animate-bounce">⭐️</div>
        <div className="absolute right-[10%] top-[25%] text-xl opacity-50 select-none animate-pulse">🔷</div>
        <div className="absolute left-[5%] bottom-[20%] text-xl opacity-40 select-none">🔺</div>
        <div className="absolute right-[7%] bottom-[15%] text-xl opacity-40 select-none">💬</div>

        <div className="max-w-4xl mx-auto text-center px-6 space-y-6 relative z-10">
          
          {/* Yellow Star Badge */}
          <div className="flex justify-center select-none">
            <span className="text-3xl text-[#FEF08A] drop-shadow-sm filter">⭐</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0B012C] tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Shatter All Online Limits Instantly
          </h1>
          
          <p className="text-[#645A95] text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium">
            Achieve greater heights by pushing past the boundaries of what's possible online. Learn, practice, and build masterclasses.
          </p>

          {/* Buttons matching image exactly */}
          <div className="pt-4 flex justify-center items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 bg-[#0B012C] hover:bg-[#0B012C]/95 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border-2 border-[#0B012C] hover:bg-[#0B012C]/5 flex items-center justify-center text-[#0B012C] transition-all shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero Illustration cards row (Centered blocks matching layout) */}
        <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
          
          {/* Portrait Left */}
          <div className="border border-[#E2D5F8]/60 rounded-3xl p-6 bg-white text-left space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="aspect-[4/3] w-full bg-[#E9D5FF]/30 rounded-2xl overflow-hidden relative border border-[#E2D5F8]/40">
              <img src="/hero_student.png" alt="Collaborative learning" className="object-cover w-full h-full scale-105" />
            </div>
            <div>
              <span className="bg-[#E9D5FF] text-[#0B012C] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Active Live Session</span>
              <h4 className="font-extrabold text-sm text-[#0B012C] mt-2">Personalized feedback with leaders</h4>
            </div>
          </div>

          {/* Central Main Portrait */}
          <div className="border-2 border-[#0B012C] rounded-3xl p-6 bg-white text-left space-y-4 shadow-lg hover:shadow-xl transition-all scale-105 relative">
            <div className="absolute -top-3.5 left-6 bg-[#0B012C] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Highly Recommended
            </div>
            <div className="aspect-[4/3] w-full bg-[#FEF08A]/30 rounded-2xl overflow-hidden relative border border-[#E2D5F8]/40">
              <img src="/testimonial_mel.png" alt="Engineering Leads" className="object-cover w-full h-full" />
            </div>
            <div>
              <span className="bg-[#FEF08A] text-[#0B012C] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Course Material</span>
              <h4 className="font-extrabold text-base text-[#0B012C] mt-2">100% complete engineering masterclasses</h4>
            </div>
          </div>

          {/* Content Card Right */}
          <div className="border border-[#E2D5F8]/60 rounded-3xl p-6 bg-white text-left space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="aspect-[4/3] w-full bg-[#0B012C] rounded-2xl p-5 flex flex-col justify-between text-white border border-black/40">
              <div className="flex justify-between items-start">
                <span className="text-xl">🧊</span>
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#E9D5FF]">Syllabus</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-xs tracking-tight text-[#E9D5FF] uppercase">{course?.title || "WhisperType Assistant Course"}</h4>
                <p className="text-[10px] text-white/70 line-clamp-2">Offline voice transcription checks.</p>
              </div>
            </div>
            <div>
              <span className="bg-[#D9F99D] text-[#0B012C] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Local Cache Specs</span>
              <h4 className="font-extrabold text-sm text-[#0B012C] mt-2">Secure progress tracking stored locally</h4>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Upskill Rapidly Banner */}
      <section className="py-20 bg-white border-b border-[#E2D5F8]/40 text-center relative overflow-hidden">
        {/* Decorative Floating Cones/Stars */}
        <div className="absolute left-10 top-10 text-xl opacity-30 select-none animate-bounce">🧊</div>
        <div className="absolute right-12 bottom-8 text-xl opacity-30 select-none animate-pulse">🔷</div>
        
        <div className="max-w-4xl mx-auto px-6 space-y-4 relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0B012C] leading-tight max-w-3xl mx-auto">
            Upskill Rapidly To Advance{" "}
            <span className="inline-flex items-center gap-1.5 px-2 bg-[#F5EFFF] border border-[#E2D5F8]/60 rounded-2xl">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E9D5FF] inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FEF08A] inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#A5F3FC] inline-block" />
            </span>{" "}
            Your Career And Unlock Opportunities.
          </h2>
          <p className="text-[#645A95] text-xs md:text-sm font-semibold pt-2">
            Leverage robust engineering tracks containing complete project plans, tutorials, and graded checkpoints.
          </p>
        </div>
      </section>

      {/* 4. Innovative Teaching Strategies Row */}
      <section className="py-20 md:py-28 bg-[#F5EFFF]/30">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl font-black text-[#0B012C] tracking-tight">
                Innovative Teaching Strategies For Engagement
              </h2>
              <p className="text-sm text-[#645A95] font-semibold">Learn from industry managers and certified leads.</p>
            </div>
            {/* Filter pills */}
            <div className="flex items-center space-x-2 select-none self-start">
              <span className="px-4 py-1.5 rounded-full border border-[#E2D5F8]/60 text-xs font-bold text-[#0B012C] bg-white cursor-pointer">All</span>
              <span className="px-4 py-1.5 rounded-full border border-transparent text-xs font-bold text-[#645A95] hover:text-[#0B012C] cursor-pointer">Senior</span>
              <span className="px-4 py-1.5 rounded-full bg-[#0B012C] text-white text-xs font-bold cursor-pointer">Junior</span>
            </div>
          </div>

          {/* Instructors are read off the courses that exist, not invented. */}
          {instructors.length === 0 ? (
            <div className="border border-dashed border-[#E2D5F8] rounded-3xl p-12 text-center">
              <p className="text-xs text-[#645A95] font-semibold">
                Instructors appear here once courses are published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((person) => (
                <div
                  key={`${person.instructor}-${person.organization}`}
                  className="border border-[#E2D5F8]/60 rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="aspect-[4/3] w-full bg-[#F5EFFF] flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-[#645A95]" />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#645A95] block">
                      {person.organization}
                    </span>
                    <h4 className="font-extrabold text-base text-[#0B012C] pt-1">{person.instructor}</h4>
                    <p className="text-[11px] text-[#645A95] font-semibold leading-relaxed">
                      Teaches {person.courseCount} course{person.courseCount === 1 ? "" : "s"} in this catalog.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Critical Growth Skills Section (Grid) */}
      <section className="py-20 bg-white border-t border-b border-[#E2D5F8]/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-[#0B012C] tracking-tight leading-tight">
              Critical Growth Skills For Personal And Professional
            </h2>
            <p className="text-[#645A95] text-xs font-bold">Maximize development through sequenced activity structures.</p>
          </div>

          {/* Real catalog: every card below is a course that actually exists. */}
          {courseCards.length === 0 ? (
            <div className="border border-dashed border-[#E2D5F8] rounded-3xl p-12 text-center space-y-2 bg-white">
              <h4 className="font-black text-base text-[#0B012C]">No courses published yet</h4>
              <p className="text-xs text-[#645A95] font-semibold">
                Courses will appear here once they are published from the admin workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courseCards.map((c, idx) => {
                const tones = [
                  "bg-[#FEF08A]/20 border-[#FEF08A]/50",
                  "bg-[#F5EFFF] border-[#E2D5F8]/60",
                  "bg-[#D9F99D]/20 border-[#D9F99D]/50",
                ];
                return (
                  <Link
                    key={c.id}
                    href={`/course/${c.id}`}
                    className={`border rounded-3xl p-6 flex flex-col justify-between min-h-[180px] text-left shadow-sm hover:shadow-md transition-all !no-underline ${tones[idx % tones.length]}`}
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#645A95]">
                        {c.difficulty}
                      </span>
                      <h4 className="font-bold text-sm text-[#0B012C] leading-snug">{c.title}</h4>
                    </div>
                    <div className="pt-4">
                      <span className="text-[10px] text-[#645A95] uppercase tracking-wider font-bold block">
                        {c.moduleCount} module{c.moduleCount === 1 ? "" : "s"} • {c.activityCount} activit
                        {c.activityCount === 1 ? "y" : "ies"} • {c.duration}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. Milestone Graduation Benefits Section */}
      <section className="py-20 md:py-28 bg-[#F5EFFF]/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Smile Graduate photo container */}
          <div className="border border-[#E2D5F8]/60 rounded-3xl p-8 bg-white text-center space-y-6 shadow-sm">
            <span className="text-3xl block">🎓</span>
            <h3 className="text-2xl font-black text-[#0B012C] tracking-tight">Achieve Your Milestones</h3>
            <p className="text-xs text-[#645A95] leading-relaxed max-w-sm mx-auto font-semibold">
              Join thousands of certified engineering professionals deploying secure local systems globally.
            </p>
            
            <div className="pt-4 flex items-center justify-center space-x-6">
              <div className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full bg-[#E9D5FF] flex items-center justify-center text-[#0B012C] text-sm">🚀</span>
                <span className="text-[10px] font-bold text-[#0B012C] mt-1.5">Career</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full bg-[#FEF08A] flex items-center justify-center text-[#0B012C] text-sm">🌱</span>
                <span className="text-[10px] font-bold text-[#0B012C] mt-1.5">Growth</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full bg-[#A5F3FC] flex items-center justify-center text-[#0B012C] text-sm">🤝</span>
                <span className="text-[10px] font-bold text-[#0B012C] mt-1.5">Network</span>
              </div>
            </div>
          </div>

          {/* Right: Layout list of cards mimicking phone interfaces */}
          <div className="border border-[#E2D5F8]/60 bg-white rounded-3xl p-8 space-y-6 text-left shadow-sm">
            <span className="text-xs font-bold text-[#0B012C] bg-[#F5EFFF] px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">Graduation Goals Tracker</span>
            <h3 className="text-xl md:text-2xl font-black text-[#0B012C] tracking-tight">Comprehensive Progress Metrics</h3>
            <p className="text-xs text-[#645A95] leading-relaxed font-semibold">
              Analyze metrics, test algorithms, retry quiz cards, and trace performance charts right from your central user workspace.
            </p>

            {course && (
              <div className="bg-[#F5EFFF]/30 border border-[#E2D5F8]/50 rounded-2xl p-4 flex items-center justify-between shadow-sm gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 flex-shrink-0 bg-[#0B012C] rounded-xl flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#0B012C] truncate">{course.title}</h4>
                    <span className="text-[10px] text-[#645A95] font-semibold">
                      {course.modules.length} module{course.modules.length === 1 ? "" : "s"} to work through
                    </span>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="text-[10px] font-bold text-[#0B012C] bg-[#D9F99D] px-2.5 py-1 rounded-full flex-shrink-0 !no-underline"
                >
                  Start
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 7. Unlock Career Growth (List of accordion rows) */}
      <section className="py-20 md:py-28 bg-white border-t border-[#E2D5F8]/40">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-[#0B012C] tracking-tight">
              Unlock Career Growth With Skill Up Certification
            </h2>
            {/* Filter tags matching the image */}
            <div className="flex flex-wrap justify-center gap-2 pt-2 select-none">
              <span className="px-4 py-1.5 rounded-full bg-[#0B012C] text-white text-xs font-bold cursor-pointer">Benefit</span>
              <span className="px-4 py-1.5 rounded-full border border-[#E2D5F8]/60 text-xs font-bold text-[#645A95] hover:text-[#0B012C] cursor-pointer bg-[#F5EFFF]/20">Courses Offered</span>
              <span className="px-4 py-1.5 rounded-full border border-[#E2D5F8]/60 text-xs font-bold text-[#645A95] hover:text-[#0B012C] cursor-pointer bg-[#F5EFFF]/20">Learning Paths</span>
              <span className="px-4 py-1.5 rounded-full border border-[#E2D5F8]/60 text-xs font-bold text-[#645A95] hover:text-[#0B012C] cursor-pointer bg-[#F5EFFF]/20">Success Stories</span>
            </div>
          </div>

          {/* List of Accordion Rows exactly like image */}
          <div className="space-y-3">
            
            {/* Row 1 */}
            <div className="bg-[#0B012C] text-white rounded-2xl p-5 flex items-center justify-between border border-[#0B012C] shadow">
              <div className="flex items-start gap-4 text-left">
                <div className="w-5 h-5 rounded-full border-2 border-[#E9D5FF] bg-[#E9D5FF] mt-0.5 flex items-center justify-center text-[8px] font-bold text-[#0B012C]">✓</div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight text-[#E9D5FF]">Career Advancement</h4>
                  <span className="text-[11px] text-white/80">Industry-Relevant Skills to stay current with trending demands.</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">➔</span>
            </div>

            {/* Row 2 */}
            <div className="bg-[#F5EFFF]/10 text-[#0B012C] rounded-2xl p-5 flex items-center justify-between border border-[#E2D5F8]/60 shadow-sm hover:bg-[#F5EFFF]/20 transition-all">
              <div className="flex items-start gap-4 text-left">
                <div className="w-5 h-5 rounded-full border-2 border-[#E2D5F8] mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Flexibility & Convenience</h4>
                  <span className="text-[11px] text-[#645A95] font-semibold">Accessible Anywhere. Fit modules around busy lifestyles seamlessly.</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#645A95] text-xs font-bold border border-[#E2D5F8]/60">➔</span>
            </div>

            {/* Row 3 */}
            <div className="bg-white text-[#0B012C] rounded-2xl p-5 flex items-center justify-between border border-[#E2D5F8]/60 shadow-sm hover:bg-[#F5EFFF]/20 transition-all">
              <div className="flex items-start gap-4 text-left">
                <div className="w-5 h-5 rounded-full border-2 border-[#E2D5F8] mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Networking Opportunities</h4>
                  <span className="text-[11px] text-[#645A95] font-semibold">Join Communities. Discuss each activity with your colleagues.</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#645A95] text-xs font-bold border border-[#E2D5F8]/60">➔</span>
            </div>

            {/* Row 4 */}
            <div className="bg-white text-[#0B012C] rounded-2xl p-5 flex items-center justify-between border border-[#E2D5F8]/60 shadow-sm hover:bg-[#F5EFFF]/20 transition-all">
              <div className="flex items-start gap-4 text-left">
                <div className="w-5 h-5 rounded-full border-2 border-[#E2D5F8] mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Affordable Education</h4>
                  <span className="text-[11px] text-[#645A95] font-semibold">Financial Aid Options. Completely open-access for corporate teams.</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#645A95] text-xs font-bold border border-[#E2D5F8]/60">➔</span>
            </div>

            {/* Row 5 */}
            <div className="bg-white text-[#0B012C] rounded-2xl p-5 flex items-center justify-between border border-[#E2D5F8]/60 shadow-sm hover:bg-[#F5EFFF]/20 transition-all">
              <div className="flex items-start gap-4 text-left">
                <div className="w-5 h-5 rounded-full border-2 border-[#E2D5F8] mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Personal Growth</h4>
                  <span className="text-[11px] text-[#645A95] font-semibold">Lifelong Learning. Expand limits of speech technology and STT.</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#645A95] text-xs font-bold border border-[#E2D5F8]/60">➔</span>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Call To Action (Bottom dark banner) */}
      <section className="py-12 bg-[#F5EFFF]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0B012C] rounded-3xl p-10 md:p-16 text-white shadow-xl text-center relative overflow-hidden">
            
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                Download Iceberg And Elevate Your Skills With Our All-In-One App
              </h2>
              <p className="text-[#E9D5FF] text-xs leading-relaxed font-medium">
                Unlock curriculum details and offline quizzes anywhere. Available now on Android and Apple marketplaces.
              </p>

              {/* App store badges */}
              <div className="flex justify-center items-center gap-4 pt-4 select-none">
                <div className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 cursor-pointer text-left transition-all">
                  <span className="text-xl">🍏</span>
                  <div className="text-[9px]">
                    <span className="block text-white/50 leading-none">Download on the</span>
                    <span className="text-xs font-bold text-white leading-tight">App Store</span>
                  </div>
                </div>
                <div className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 cursor-pointer text-left transition-all">
                  <span className="text-xl">🤖</span>
                  <div className="text-[9px]">
                    <span className="block text-white/50 leading-none">Get it on</span>
                    <span className="text-xs font-bold text-white leading-tight">Google Play</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-[#E2D5F8]/40 py-12 text-[#645A95]">
        <div className="max-w-7xl mx-auto px-6 space-y-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-[#0B012C] font-black text-lg tracking-tight flex items-center gap-1.5">
                <span>🧊</span> Iceberg
              </span>
            </div>

            <nav className="flex flex-wrap justify-center items-center gap-6 text-xs md:text-sm font-bold">
              <span className="hover:text-[#0B012C] cursor-pointer">Overview</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Lessons</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Pricing</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Blog</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Help</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Contact</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Privacy</span>
            </nav>
          </div>

          <div className="border-t border-[#E2D5F8]/20 pt-6 flex flex-col md:flex-row justify-between items-center text-[11px] gap-4 font-semibold">
            <span>© 2026 Iceberg. All rights reserved.</span>
            <div className="flex space-x-4">
              <span className="hover:text-[#0B012C] cursor-pointer">Terms</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Privacy</span>
              <span className="hover:text-[#0B012C] cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
