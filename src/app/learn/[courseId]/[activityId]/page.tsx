import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ActivityActions } from "@/components/ActivityActions";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Download, Lightbulb, PlayCircle, BookOpen, HelpCircle, MessageSquare, ExternalLink, Clock } from "lucide-react";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { parseResources } from "@/lib/activities";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ courseId: string; activityId: string }>;
}) {
  const { courseId, activityId } = await params;

  // Fetch the active activity and module metadata
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      module: true,
    },
  });

  if (!activity) {
    notFound();
  }

  // Fetch all modules with nested activities to build course-wide linear sequence
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      activities: {
        orderBy: { order: "asc" },
      },
    },
  });

  const flatActivities = modules.flatMap((m) => m.activities);
  const currentIndex = flatActivities.findIndex((a) => a.id === activity.id);

  if (currentIndex === -1) {
    notFound();
  }

  const prevActivity = currentIndex > 0 ? flatActivities[currentIndex - 1] : null;
  const nextActivity = currentIndex < flatActivities.length - 1 ? flatActivities[currentIndex + 1] : null;

  const parsedResources = parseResources(activity.resources);

  // Auto-resolve icons based on type
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "VIDEO":
        return { label: "Video Lecture", icon: <PlayCircle className="w-3.5 h-3.5 mr-1" /> };
      case "READING":
        return { label: "Technical Reading", icon: <BookOpen className="w-3.5 h-3.5 mr-1" /> };
      case "QUIZ":
        return { label: "Graded Quiz", icon: <HelpCircle className="w-3.5 h-3.5 mr-1" /> };
      case "PRACTICE_QUIZ":
        return { label: "Practice Assessment", icon: <HelpCircle className="w-3.5 h-3.5 mr-1" /> };
      case "DISCUSSION":
        return { label: "Discussion Hub", icon: <MessageSquare className="w-3.5 h-3.5 mr-1" /> };
      default:
        return { label: "Learning Activity", icon: <PlayCircle className="w-3.5 h-3.5 mr-1" /> };
    }
  };

  const typeConfig = getActivityTypeLabel(activity.type);

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-6 md:px-8 py-10 bg-[#F8FAFC]/10 min-h-full font-sans selection:bg-[#EEF2FF] selection:text-[#0F172A]">
      
      {/* Upper Navigation / Metadata Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#E2E8F0]/40 pb-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center text-[10px] font-bold text-[#0F172A] uppercase tracking-wider bg-[#EEF2FF] px-2.5 py-1 rounded-full border border-[#E2E8F0]/40">
            {typeConfig.icon} {typeConfig.label} • Activity {currentIndex + 1} of {flatActivities.length}
          </span>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight text-[#0F172A]">
            {activity.title}
          </h1>
          {activity.duration && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
              <Clock className="w-3.5 h-3.5" /> {activity.duration}
            </span>
          )}
        </div>
        
        {/* Toggle Manual Completion only for non-quiz/non-practice elements */}
        {activity.type !== "QUIZ" && activity.type !== "PRACTICE_QUIZ" && (
          <div className="flex items-center gap-2 select-none self-start sm:self-auto">
            <ActivityActions activityId={activity.id} />
          </div>
        )}
      </div>

      {/* CORE ACTIVITY WORKSPACE RENDERER */}
      <div className="flex-1 space-y-8">
        
        <ActivityRenderer activity={activity} />

        {/* Resources Section if items exist */}
        {parsedResources.length > 0 && (
          <div className="space-y-4 mt-10 border-t border-[#E2E8F0]/40 pt-8">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#0F172A]" /> Downloadable Resource Guides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsedResources.map((res, rIdx) => (
                <a
                  key={rIdx}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 border border-[#E2E8F0]/50 rounded-2xl flex items-center bg-white hover:bg-[#F8FAFC]/30 hover:border-[#E2E8F0] transition-all cursor-pointer group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#0F172A] flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <span className="font-extrabold text-xs md:text-sm text-[#0F172A] truncate group-hover:underline flex items-center gap-1">
                      {res.title} <ExternalLink className="w-3 h-3 text-[#64748B]" />
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">External reference resource</span>
                  </div>
                  <Download className="w-4 h-4 text-[#64748B] flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation (Previous / Next Activities) */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0]/40 mt-16 bg-white/50 rounded-2xl p-5 shadow-sm">
        {prevActivity ? (
          <Link
            href={`/learn/${courseId}/${prevActivity.id}`}
            className="flex flex-col items-start px-4 py-3 rounded-xl border border-[#E2E8F0]/50 bg-white hover:bg-[#F8FAFC]/20 transition-all group max-w-[45%] min-w-[120px] text-left"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
              <ChevronLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5" /> Previous Unit
            </span>
            <span className="font-extrabold text-xs text-[#0F172A] truncate w-full">{prevActivity.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextActivity ? (
          <Link
            href={`/learn/${courseId}/${nextActivity.id}`}
            className="flex flex-col items-end px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-[#0F172A]/90 text-white transition-all group text-right max-w-[45%] min-w-[120px] shadow-sm hover:shadow-md"
          >
            <span className="text-[9px] font-bold text-[#EEF2FF] uppercase tracking-wider mb-1 flex items-center">
              Next Unit <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-extrabold text-xs text-white truncate w-full">{nextActivity.title}</span>
          </Link>
        ) : (
          <div className="flex flex-col items-end px-5 py-3 rounded-xl bg-[#EEF2FF] text-[#0F172A] text-right max-w-[45%] min-w-[120px] shadow-sm border border-[#0F172A]/15">
             <span className="text-[9px] font-extrabold uppercase tracking-wider mb-1">🎉 Course Complete</span>
             <span className="font-black text-xs text-[#0F172A]">You finished all units!</span>
          </div>
        )}
      </div>
    </div>
  );
}
