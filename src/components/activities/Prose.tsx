/**
 * Renders admin-authored HTML with the house typography.
 *
 * The content is written by administrators through the admin workspace, so it is
 * trusted the same way any CMS trusts its editors — but it is still raw HTML, so
 * it stays funnelled through this one component rather than being scattered
 * across pages.
 */
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-sm prose-indigo max-w-none text-[#0F172A]/95 leading-relaxed font-medium
        prose-headings:text-[#0F172A] prose-headings:font-black prose-headings:tracking-tight
        prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-sm
        prose-p:text-[#0F172A]/85 prose-li:text-[#0F172A]/85 prose-strong:text-[#0F172A]
        prose-a:text-[#4F46E5] prose-a:font-semibold
        prose-code:text-[#0F172A] prose-code:bg-[#F8FAFC] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#0F172A] prose-pre:text-white prose-pre:rounded-2xl
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
