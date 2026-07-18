"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, PlayCircle, BookOpen, HelpCircle, MessageSquare, ArrowLeft } from "lucide-react";
import { useCourseProgress } from "./CourseProgressProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

// Precise activity-type mapping interfaces
interface Activity {
  id: string;
  title: string;
  type: "VIDEO" | "READING" | "QUIZ" | "PRACTICE_QUIZ" | "DISCUSSION";
  duration: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  activities: Activity[];
}

export function Sidebar({ courseId, modules }: { courseId: string; modules: Module[] }) {
  const pathname = usePathname();
  const { isCompleted } = useCourseProgress();

  // Aggregate stats across all activities
  const allActivities = modules.flatMap((m) => m.activities);
  const totalCount = allActivities.length;
  const completedCount = allActivities.filter((a) => isCompleted(a.id)).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Helper to resolve custom icons based on ActivityType
  const getActivityIcon = (type: string, completed: boolean, isActive: boolean) => {
    if (completed) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#0F172A] fill-[#EEF2FF] flex-shrink-0" />;
    }
    switch (type) {
      case "VIDEO":
        return <PlayCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#0F172A]" : "text-slate-400"}`} />;
      case "READING":
        return <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#0F172A]" : "text-slate-400"}`} />;
      case "QUIZ":
      case "PRACTICE_QUIZ":
        return <HelpCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#0F172A]" : "text-slate-400"}`} />;
      case "DISCUSSION":
        return <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#0F172A]" : "text-slate-400"}`} />;
      default:
        return <PlayCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="hidden md:flex flex-col w-72 flex-shrink-0 border-r border-[#E2E8F0]/40 bg-white h-[calc(100vh-56px)] fixed left-0 top-14 select-none z-30 shadow-sm">
      
      {/* 1. Header Back Navigation */}
      <div className="px-5 pt-4 pb-2">
        <Link 
          href="/dashboard" 
          className="text-[11px] font-black text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors !no-underline hover:!no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to catalog
        </Link>
      </div>

      {/* 2. Sidebar Progress Header Panel */}
      <div className="p-5 border-b border-[#E2E8F0]/30 bg-[#F8FAFC]/10 m-3 rounded-2xl border border-[#E2E8F0]/40">
        <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Course Progress</span>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs font-extrabold text-[#0F172A]">
            <span>{progressPercentage}% Completed</span>
            <span className="text-[10px] text-[#64748B] font-bold">{completedCount}/{totalCount} units</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 bg-slate-100 [&>div]:bg-[#EEF2FF] transition-all duration-300 border border-slate-200/50 rounded-full" />
        </div>
      </div>

      {/* 3. Curriculum Accordion Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <Accordion defaultValue={modules.map(m => m.id)} className="w-full space-y-2.5">
          {modules.map((module) => (
            <AccordionItem 
              key={module.id} 
              value={module.id} 
              className="border border-[#E2E8F0]/30 rounded-2xl overflow-hidden bg-[#FAFAFA]/40 hover:bg-[#FAFAFA] transition-all"
            >
              <AccordionTrigger className="px-4 py-3 hover:!no-underline [&[data-state=open]]:bg-[#F8FAFC]/15 transition-all flex items-center justify-between !no-underline">
                <div className="flex flex-col items-start text-left space-y-0.5 !no-underline">
                  <span className="text-[8px] font-black tracking-wider text-[#64748B] uppercase !no-underline">
                    Module {module.order} • {module.activities.length} Units
                  </span>
                  <span className="font-extrabold text-xs text-[#0F172A] leading-snug line-clamp-1 !no-underline">
                    {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 border-t border-[#E2E8F0]/20 bg-white">
                <div className="flex flex-col py-1">
                  {module.activities.map((activity) => {
                    const activityUrl = `/learn/${courseId}/${activity.id}`;
                    const isActive = pathname === activityUrl;
                    const completed = isCompleted(activity.id);

                    return (
                      <Link
                        key={activity.id}
                        href={activityUrl}
                        className={`flex items-start px-4 py-3.5 transition-all border-l-2 !no-underline hover:!no-underline ${
                          isActive
                            ? "bg-[#F8FAFC]/30 border-[#0F172A] font-extrabold shadow-inner"
                            : "border-transparent hover:bg-[#F8FAFC]/15"
                        }`}
                      >
                        <div className="mt-0.5 mr-2.5 flex-shrink-0">
                          {getActivityIcon(activity.type, completed, isActive)}
                        </div>
                        <div className="flex-1 min-w-0 text-left !no-underline">
                          <span className={`text-[11px] leading-snug line-clamp-2 !no-underline block ${
                            isActive 
                              ? "font-black text-[#0F172A] !no-underline" 
                              : "font-semibold text-[#64748B] hover:text-[#0F172A] !no-underline"
                          }`}>
                            {activity.title}
                          </span>
                          {activity.duration && (
                            <span className="text-[9px] text-slate-400 block mt-1 font-semibold !no-underline">
                              {activity.duration} • {activity.type.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  {module.activities.length === 0 && (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium !no-underline">
                      No activities in this module yet.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
