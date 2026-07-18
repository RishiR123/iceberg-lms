"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Check } from "lucide-react";
import { submitReviewAction } from "@/app/actions/enrollmentActions";

export function ReviewForm({
  courseId,
  existingRating,
  existingBody,
}: {
  courseId: string;
  existingRating?: number;
  existingBody?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existingBody ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }

    startTransition(async () => {
      const res = await submitReviewAction(courseId, rating, body);
      if (!res.success) {
        setError(res.error ?? "Could not save your review.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="p-4 border border-border/60 bg-card rounded-xl space-y-3">
      <h3 className="text-xs font-bold text-foreground">
        {existingRating ? "Update your review" : "Leave a review"}
      </h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-amber-500 cursor-pointer disabled:opacity-50"
            disabled={isPending}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star className={`w-5 h-5 ${n <= (hover || rating) ? "fill-current" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isPending}
        placeholder="What did you think of this course? (optional)"
        className="w-full h-20 bg-secondary/20 border border-border/50 rounded-lg p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-60"
      />

      {error && <p className="text-[10px] text-red-600 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
          </>
        ) : saved ? (
          <>
            <Check className="w-3.5 h-3.5" /> Saved
          </>
        ) : (
          "Submit review"
        )}
      </button>
    </form>
  );
}
