import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, PlayCircle, Star, Award, CheckCircle, MonitorPlay, ChevronRight, HelpCircle, GraduationCap, ShieldCheck, MessageSquare } from "lucide-react";
import { getCourseMetadata } from "@/lib/courseMetadata";
import { getCourseSocialProof } from "@/lib/stats";
import { ReviewForm } from "@/components/ReviewForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function CourseDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Assigned-only: a course you were not given is not yours to read.
  if (user.role !== "ADMIN") {
    const assigned = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: id } },
      select: { id: true },
    });
    if (!assigned) redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          activities: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const allActivities = course.modules.flatMap((m) => m.activities);
  const firstActivity = allActivities[0];
  const meta = getCourseMetadata(course);

  const defaultOutcomes = [
    `Master professional techniques for ${course.title}`,
    "Gain industry-verified workflows and best practices",
    "Build a production-ready portfolio to demonstrate expertise",
    "Design and deploy responsive, accessible software solutions",
  ];

  const outcomes = course.outcomes
    ? course.outcomes.split("|").map(o => o.trim()).filter(Boolean)
    : defaultOutcomes;

  const defaultSkills = [
    course.title.split(" ")[0] || "Engineering",
    "System Design",
    "Best Practices",
    "Performance Optimization",
    "Architecture",
    "Scalability",
  ];

  const skills = course.skills
    ? course.skills.split(",").map(s => s.trim()).filter(Boolean)
    : defaultSkills;

  const defaultFaqs = [
    { q: "Is this course completely self-paced?", a: "Yes. You can start, pause, and resume any activity at your convenience. All materials are available 24/7." },
    { q: "Are there any grading requirements?", a: "To complete the course, you must pass all Graded Quizzes with an 80% or higher score. Other activity types require viewing or manual marking." },
    { q: "Are there any prerequisites?", a: "No prior experience is strictly required, though some familiarity with core technology concepts will help you progress faster." },
  ];

  const faqs = course.faqs
    ? course.faqs.split("|").map(faqStr => {
        const parts = faqStr.split(" - ");
        return {
          q: parts[0]?.trim() || "Information Question",
          a: parts[1]?.trim() || "Dynamic syllabus answer detail.",
        };
      }).filter(f => f.q && f.a)
    : defaultFaqs;

  const [socialProof, reviews, enrolled, myReview] = await Promise.all([
    getCourseSocialProof(course.id),
    prisma.courseReview.findMany({
      where: { courseId: course.id, body: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { id: true },
    }),
    prisma.courseReview.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    }),
  ]);
  const isEnrolled = enrolled !== null;

  // Map dynamic icons for activities in curriculum list
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="w-3.5 h-3.5 text-primary" />;
      case "READING":
        return <BookOpen className="w-3.5 h-3.5 text-primary" />;
      case "QUIZ":
      case "PRACTICE_QUIZ":
        return <HelpCircle className="w-3.5 h-3.5 text-primary" />;
      case "DISCUSSION":
        return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
      default:
        return <PlayCircle className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="flex-1 bg-background text-foreground">
      {/* Premium Minimal Breadcrumb Header */}
      <section className="border-b border-border/50 py-3 bg-secondary/20">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-semibold">{meta.organization}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground truncate max-w-[200px] md:max-w-none">{course.title}</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <section className="py-10">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-start relative">
          
          {/* LEFT COLUMN: Curriculum & Technical Specs (Takes up 65% width) */}
          <div className="w-full lg:w-2/3 space-y-12">
            
            {/* Title & Organization Info */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" /> Professional Certificate
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {course.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-2 text-muted-foreground">
                {socialProof.reviewCount > 0 ? (
                  <div className="flex items-center font-semibold text-foreground">
                    <Star className="w-4 h-4 mr-1.5 fill-amber-500 text-amber-500" />
                    <span>{socialProof.averageRating}</span>
                    <span className="text-muted-foreground font-normal ml-1">
                      ({socialProof.reviewCount} review{socialProof.reviewCount === 1 ? "" : "s"})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <Star className="w-4 h-4 mr-1.5" />
                    <span>No reviews yet</span>
                  </div>
                )}
                <span>•</span>
                <div>
                  <span className="font-semibold text-foreground">{socialProof.learnerCount}</span> enrolled
                </div>
                <span>•</span>
                <div>
                  <span className="font-semibold text-foreground">Instructor:</span> {meta.instructor}
                </div>
                <span>•</span>
                <div>
                  <span className="font-semibold text-foreground">Partner:</span> {meta.organization}
                </div>
              </div>
            </div>

            {/* Quick Specs Highlights */}
            <div className="grid grid-cols-3 gap-4 py-5 border-y border-border/60 text-center md:text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">Difficulty</span>
                <span className="font-semibold text-xs md:text-sm text-foreground block mt-0.5">{meta.difficulty} Level</span>
              </div>
              <div className="border-x border-border/60 px-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">Estimated Time</span>
                <span className="font-semibold text-xs md:text-sm text-foreground block mt-0.5">{meta.duration}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">Curriculum</span>
                <span className="font-semibold text-xs md:text-sm text-foreground block mt-0.5">{allActivities.length} Activities</span>
              </div>
            </div>

            {/* Skills Acquired */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Skills you will gain</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill}
                    className="text-xs font-semibold text-foreground bg-secondary px-3 py-1 rounded-lg border border-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Curriculum/Syllabus Collapse (Core content) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight text-foreground">Course Curriculum</h2>
                <span className="text-xs text-muted-foreground font-medium">{course.modules.length} Modules • {allActivities.length} Units</span>
              </div>
              
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-sm">
                <Accordion defaultValue={course.modules.map(m => m.id)} className="w-full">
                  {course.modules.map((module) => (
                    <AccordionItem key={module.id} value={module.id} className="border-b border-border/40 last:border-none">
                      <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 transition-colors hover:no-underline [&[data-state=open]]:bg-muted/10">
                        <div className="flex flex-col items-start text-left">
                          <span className="text-[9px] font-bold tracking-wider text-primary uppercase mb-1">MODULE {module.order}</span>
                          <span className="font-semibold text-sm text-foreground">{module.title}</span>
                          <span className="text-xs text-muted-foreground font-normal mt-1 block">{module.description}</span>
                          <div className="flex items-center text-xs font-medium text-muted-foreground mt-2 space-x-3">
                            <span className="flex items-center"><PlayCircle className="w-3.5 h-3.5 mr-1" /> {module.activities.length} activities</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0 border-t border-border/50">
                        <div className="flex flex-col bg-secondary/10">
                          {module.activities.map((activity, index) => (
                            <div
                              key={activity.id}
                              className={`flex items-start justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors group ${index !== module.activities.length - 1 ? "border-b border-border/40" : ""}`}
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors">
                                    {activity.title}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    {getActivityIcon(activity.type)}
                                    <span>{activity.duration ? `${activity.duration} • ` : ""}{activity.type.replace("_", " ")}</span>
                                  </span>
                                </div>
                              </div>
                              <Link 
                                href={`/learn/${course.id}/${activity.id}`}
                                className="text-xs font-semibold text-primary border border-primary/20 px-3 py-1 rounded bg-background shadow-inner hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-all"
                              >
                                View
                              </Link>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-secondary/35 rounded-xl p-6 border border-border/60 space-y-4">
              <h2 className="text-sm uppercase tracking-wider font-bold text-muted-foreground">What you will learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" /> FAQ & Assistance
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 border border-border/60 rounded-xl bg-card">
                    <h4 className="font-semibold text-xs md:text-sm text-foreground">{faq.q}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Enterprise Reviews */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" /> Verified Learner Reviews
              </h2>
              {isEnrolled && (
                <ReviewForm
                  courseId={course.id}
                  existingRating={myReview?.rating}
                  existingBody={myReview?.body ?? undefined}
                />
              )}

              {reviews.length === 0 ? (
                <div className="p-6 border border-dashed border-border/60 rounded-xl text-center text-xs text-muted-foreground">
                  No reviews yet.{" "}
                  {isEnrolled ? "Be the first to leave one." : "Only assigned learners can review."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-border/60 bg-card rounded-xl flex flex-col justify-between hover:shadow-sm transition-all duration-200">
                      <div>
                        <div className="flex items-center space-x-0.5 mb-2 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-muted"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-foreground italic leading-relaxed">"{rev.body}"</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {rev.user.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-[10px] text-foreground">{rev.user.name}</h5>
                          <p className="text-[9px] text-muted-foreground">
                            {rev.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Information/Enrollment specs Card (Takes up 35% width) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-20 z-10">
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-md">
              <div className="aspect-video w-full bg-muted relative border-b border-border/40">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <MonitorPlay className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background/95 flex items-center justify-center shadow-md border border-border/40 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200">
                    <PlayCircle className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xl font-bold text-foreground mb-4">
                  {isEnrolled ? "Assigned to you" : "Admin preview"}
                </div>

                {!firstActivity ? (
                  <div className="w-full py-3 bg-muted text-muted-foreground text-center font-semibold text-sm rounded-lg cursor-not-allowed">
                    No activities yet
                  </div>
                ) : (
                  <Link
                    href={`/learn/${course.id}/${firstActivity.id}`}
                    className="block w-full py-3 bg-primary text-primary-foreground text-center font-semibold text-sm rounded-lg hover:bg-primary/95 transition-all active:scale-98 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {isEnrolled ? "Start learning" : "Preview as admin"}
                  </Link>
                )}
                
                <div className="space-y-2.5 mt-6 pt-5 border-t border-border/60 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-primary" /> On-demand video syllabus</div>
                  <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Readings, notes & resource downloads</div>
                  <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Graded quizzes & discussion threads</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
