"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { setActivityCompletionAction } from "@/app/actions/learningActions";

type CourseProgressContextType = {
  completedActivities: string[];
  markAsComplete: (activityId: string) => void;
  markAsIncomplete: (activityId: string) => void;
  isCompleted: (activityId: string) => boolean;
  isSaving: boolean;
};

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export function CourseProgressProvider({
  children,
  initialCompleted,
}: {
  children: React.ReactNode;
  initialCompleted: string[];
}) {
  const [completedActivities, setCompletedActivities] = useState<string[]>(initialCompleted);
  const [isSaving, startTransition] = useTransition();

  // Applied locally first so the tick responds immediately, then reverted if the
  // write fails — otherwise the UI would claim progress the database never got.
  const persist = (activityId: string, completed: boolean) => {
    const previous = completedActivities;
    setCompletedActivities((prev) =>
      completed
        ? prev.includes(activityId)
          ? prev
          : [...prev, activityId]
        : prev.filter((id) => id !== activityId)
    );

    startTransition(async () => {
      const res = await setActivityCompletionAction(activityId, completed);
      if (!res.success) {
        setCompletedActivities(previous);
      }
    });
  };

  const markAsComplete = (activityId: string) => persist(activityId, true);
  const markAsIncomplete = (activityId: string) => persist(activityId, false);
  const isCompleted = (activityId: string) => completedActivities.includes(activityId);

  return (
    <CourseProgressContext.Provider
      value={{ completedActivities, markAsComplete, markAsIncomplete, isCompleted, isSaving }}
    >
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error("useCourseProgress must be used within a CourseProgressProvider");
  }
  return context;
}
