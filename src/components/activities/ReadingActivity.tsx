import { Prose } from "./Prose";

/** A written lesson — just the authored prose in a readable column. */
export function ReadingActivity({ content }: { content: string }) {
  return (
    <div className="border border-[#E2D5F8]/50 bg-white rounded-3xl p-6 md:p-10 shadow-sm">
      <Prose html={content} />
    </div>
  );
}
