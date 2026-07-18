/**
 * The Iceberg mark: a clean geometric peak with its waterline reflection.
 * Monochrome, inherits `currentColor`, no emoji. Use `withWordmark` for the
 * full lockup, or the mark alone in tight spaces.
 */
export function LogoMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* peak above the waterline */}
      <path d="M12 3L19 13H5L12 3Z" fill="currentColor" />
      {/* smaller submerged reflection */}
      <path d="M12 21L7.5 15H16.5L12 21Z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function Logo({
  className = "",
  markClassName = "w-5 h-5",
  wordmark = true,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      {wordmark && <span className="font-bold tracking-tight">Iceberg</span>}
    </span>
  );
}
