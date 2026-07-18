import { InteractiveDiscussion } from "@/components/InteractiveDiscussion";
import { Prose } from "./Prose";

/** A discussion prompt plus the live thread beneath it. */
export function DiscussionActivity({ activityId, content }: { activityId: string; content: string }) {
  return (
    <div className="space-y-6">
      {content?.trim() && (
        <div className="p-5 md:p-6 border border-[#E2D5F8]/40 rounded-2xl bg-white">
          <Prose html={content} />
        </div>
      )}
      <InteractiveDiscussion activityId={activityId} />
    </div>
  );
}
