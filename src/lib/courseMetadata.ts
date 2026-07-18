// Reports what the course record actually says. It deliberately has no
// title-keyword fallbacks: the previous version invented an instructor and
// organization from the title (claiming real, named people taught courses they
// have never seen), which is not something a course row can support.
// Rating/review/learner counts are not here at all — they are derived from real
// CourseReview and Enrollment rows in lib/stats.ts.

const DEFAULTS = {
  organization: "Internal",
  instructor: "Course team",
  difficulty: "Beginner",
  duration: "Self-paced",
};

export function getCourseMetadata(
  course:
    | {
        title?: string;
        difficulty?: string;
        duration?: string;
        instructor?: string;
        organization?: string;
      }
    | null
    | undefined
    | string
) {
  if (!course || typeof course === "string") {
    return { ...DEFAULTS };
  }

  return {
    organization: course.organization?.trim() || DEFAULTS.organization,
    instructor: course.instructor?.trim() || DEFAULTS.instructor,
    difficulty: course.difficulty?.trim() || DEFAULTS.difficulty,
    duration: course.duration?.trim() || DEFAULTS.duration,
  };
}
