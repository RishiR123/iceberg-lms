"use client";

import { useCourseProgress } from "./CourseProgressProvider";
import { CheckCircle2, Circle } from "lucide-react";

export function ActivityActions({ activityId }: { activityId: string }) {
  const { isCompleted, markAsComplete, markAsIncomplete } = useCourseProgress();
  const completed = isCompleted(activityId);

  return (
    <button
      onClick={() => (completed ? markAsIncomplete(activityId) : markAsComplete(activityId))}
      className={`flex items-center px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border ${
        completed
          ? "bg-green-500/10 text-green-600 border-green-600/30 hover:bg-green-500/20"
          : "bg-primary text-primary-foreground border-primary hover:bg-primary/95 shadow"
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed
        </>
      ) : (
        <>
          <Circle className="w-4 h-4 mr-2" />
          Mark as Complete
        </>
      )}
    </button>
  );
}
