import type { ActivityType } from "@prisma/client";
import { toPublicQuestions } from "@/lib/activities";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { VideoActivity } from "./VideoActivity";
import { ReadingActivity } from "./ReadingActivity";
import { DiscussionActivity } from "./DiscussionActivity";

export type RenderableActivity = {
  id: string;
  title: string;
  type: ActivityType;
  content: string;
  videoUrl: string | null;
};

/**
 * Picks the right component for an activity's type. Every learner-facing surface
 * goes through here, so adding a type means adding one case rather than editing
 * a page — and the quiz key is stripped in exactly one place.
 */
export function ActivityRenderer({ activity }: { activity: RenderableActivity }) {
  switch (activity.type) {
    case "VIDEO":
      return (
        <VideoActivity title={activity.title} videoUrl={activity.videoUrl} content={activity.content} />
      );

    case "READING":
      return <ReadingActivity content={activity.content} />;

    case "QUIZ":
      return (
        <InteractiveQuiz
          activityId={activity.id}
          questions={toPublicQuestions(activity.content)}
          isPractice={false}
        />
      );

    case "PRACTICE_QUIZ":
      return (
        <InteractiveQuiz
          activityId={activity.id}
          questions={toPublicQuestions(activity.content)}
          isPractice={true}
        />
      );

    case "DISCUSSION":
      return <DiscussionActivity activityId={activity.id} content={activity.content} />;

    default:
      return (
        <div className="p-6 border border-dashed border-[#E2E8F0] rounded-2xl text-center text-xs text-[#64748B] font-semibold">
          This activity type can&apos;t be displayed yet.
        </div>
      );
  }
}
