import type { ActivityType } from "@prisma/client";

/**
 * Accepts the URL shapes an admin is likely to paste — watch?v=, youtu.be/,
 * /embed/, /shorts/ — and returns a privacy-mode embed URL. Anything it can't
 * parse returns null so the player can show an honest empty state rather than a
 * broken frame.
 */
export function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    }

    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;

    const start = u.searchParams.get("t") ?? u.searchParams.get("start");
    const seconds = start ? parseInt(start.replace(/[^0-9]/g, ""), 10) : NaN;

    return `https://www.youtube-nocookie.com/embed/${id}${
      Number.isFinite(seconds) && seconds > 0 ? `?start=${seconds}` : ""
    }`;
  } catch {
    return null;
  }
}

/** Deliberately has no `correct` field — the answer key must not reach the browser. */
export interface PublicQuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "multiselect" | "tf";
  options: string[];
}

/**
 * Strips the answer key and explanations out of stored quiz JSON. Anything this
 * returns is sent to the client, so `correct` must not survive it.
 */
export function toPublicQuestions(content: string): PublicQuizQuestion[] {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((q: Record<string, unknown>) => ({
      id: String(q.id),
      question: String(q.question),
      type: q.type as PublicQuizQuestion["type"],
      options: (q.options as string[]) ?? [],
    }));
  } catch {
    return [];
  }
}

/** Parses the `Title - url | Title2 - url2` convention used by the resources field. */
export function parseResources(resourcesStr: string | null | undefined) {
  if (!resourcesStr || !resourcesStr.trim()) return [];
  return resourcesStr.split("|").map((item) => {
    const parts = item.split(" - ");
    return {
      title: parts[0]?.trim() || "Resource",
      url: parts[1]?.trim() || "#",
    };
  });
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  VIDEO: "Video lecture",
  READING: "Reading",
  QUIZ: "Graded quiz",
  PRACTICE_QUIZ: "Practice quiz",
  DISCUSSION: "Discussion",
};
