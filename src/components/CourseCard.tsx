"use client";

import Link from "next/link";
import { Star, Users, Clock, BookOpen, CheckCircle } from "lucide-react";
import type { Course } from "@prisma/client";
import { useCourseProgress } from "./CourseProgressProvider";
import { Progress } from "@/components/ui/progress";
import { getCourseMetadata } from "@/lib/courseMetadata";

export function CourseCard({
  course,
  activityCount = 0,
  activities = [],
  socialProof,
  isEnrolled = false,
}: {
  course: Course;
  activityCount?: number;
  activities?: any[];
  socialProof?: { averageRating: number | null; reviewCount: number; learnerCount: number };
  isEnrolled?: boolean;
}) {
  const { isCompleted } = useCourseProgress();
  const meta = getCourseMetadata(course);
  
  // Compute progress based on activities
  const activityIds = activities.map(a => a.id);
  const completedCount = activityIds.filter(id => isCompleted(id)).length;
  const progressPercentage = activityIds.length > 0 ? Math.round((completedCount / activityIds.length) * 100) : 0;

  return (
    <Link 
      href={`/course/${course.id}`} 
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl transition-all"
    >
      <div className="flex flex-col h-full bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
        {/* Aspect-Video Thumbnail */}
        <div className="relative aspect-video w-full bg-muted overflow-hidden border-b border-border/40">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30">
              <BookOpen className="w-8 h-8" />
            </div>
          )}
          {/* Logo badge in corner */}
          <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide text-foreground shadow-sm uppercase">
            {meta.organization}
          </div>
        </div>

        {/* Content Box */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1.5">
            <span className="text-primary font-semibold">{meta.difficulty}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{meta.duration}</span>
            </div>
          </div>

          <h3 className="font-semibold text-sm leading-snug text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-[11px] text-muted-foreground mb-2">
            by {meta.instructor}
          </p>

          {/* Rating reflects real reviews; a course with none says so rather than inventing a score. */}
          <div className="flex items-center space-x-1 mb-3">
            {socialProof && socialProof.reviewCount > 0 ? (
              <>
                <span className="text-xs font-semibold text-foreground">{socialProof.averageRating}</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  ({socialProof.reviewCount})
                </span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-muted-foreground">No reviews yet</span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
              </>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" />
              {socialProof?.learnerCount ?? 0} enrolled
            </span>
          </div>

          {/* Progress and Continue footer */}
          <div className="mt-auto pt-3 border-t border-border/40 flex flex-col space-y-2">
            {completedCount > 0 ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span className="flex items-center text-green-600 gap-0.5"><CheckCircle className="w-3 h-3" /> {completedCount}/{activityCount} Complete</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1 bg-muted [&>div]:bg-green-600" />
              </div>
            ) : (
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>{activityCount} activities</span>
                <span>{isEnrolled ? "Not started" : "Not enrolled"}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <span className="text-[11px] font-semibold text-primary group-hover:text-primary/80 transition-colors inline-flex items-center gap-0.5">
                {completedCount > 0 ? "Continue Learning" : isEnrolled ? "Start Course" : "View Course"}{" "}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
