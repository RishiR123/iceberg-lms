import { PlayCircle, BookOpen } from "lucide-react";
import { toYouTubeEmbed } from "@/lib/activities";
import { Prose } from "./Prose";

/**
 * A video lesson: the embed plus whatever notes the author wrote beneath it.
 * With no parseable URL it says so rather than rendering a dead frame.
 */
export function VideoActivity({
  title,
  videoUrl,
  content,
}: {
  title: string;
  videoUrl: string | null;
  content: string;
}) {
  const embedUrl = toYouTubeEmbed(videoUrl);

  return (
    <div className="space-y-8">
      {embedUrl ? (
        <div className="rounded-3xl overflow-hidden aspect-video bg-black shadow-lg border border-[#0B012C] relative">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-3xl aspect-video bg-[#F5EFFF]/40 border border-dashed border-[#E2D5F8] flex flex-col items-center justify-center gap-2 text-center px-6">
          <PlayCircle className="w-8 h-8 text-[#645A95]" />
          <p className="text-xs font-bold text-[#0B012C]">No video linked yet</p>
          <p className="text-[11px] text-[#645A95] font-semibold max-w-xs">
            An administrator can add a YouTube link to this activity in the admin workspace.
          </p>
        </div>
      )}

      {content?.trim() && (
        <div className="border border-[#E2D5F8]/50 bg-white rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-extrabold text-xs md:text-sm text-[#0B012C] border-b border-[#E2D5F8]/30 pb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#0B012C]" /> Notes
          </h3>
          <Prose html={content} className="mt-6" />
        </div>
      )}
    </div>
  );
}
