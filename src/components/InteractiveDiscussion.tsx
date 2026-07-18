"use client";

import { useState, useEffect, useTransition } from "react";
import { MessageSquare, Send, Check, Loader2 } from "lucide-react";
import { getDiscussionAction, postDiscussionAction } from "@/app/actions/learningActions";

interface Post {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  authorId: string;
  authorName: string;
}

function relativeTime(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function InteractiveDiscussion({ activityId }: { activityId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newComment, setNewComment] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPosting, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDiscussionAction(activityId).then((rows) => {
      if (!active) return;
      setPosts(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [activityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setError(null);

    startTransition(async () => {
      const res = await postDiscussionAction(activityId, newComment);
      if (!res.success) {
        setError(res.error ?? "Could not post your reply.");
        return;
      }
      setPosts(await getDiscussionAction(activityId));
      setNewComment("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    });
  };

  return (
    <div className="border border-border/60 bg-card rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center space-x-2 border-b border-border/40 pb-3">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-xs md:text-sm text-foreground">Activity Discussion Forum</h3>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-hide pr-1">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading discussion…
          </div>
        ) : posts.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No posts yet — start the discussion.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-3 bg-secondary/25 border border-border/40 rounded-lg space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[11px] text-foreground">{post.authorName}</span>
                <span className="text-[9px] text-muted-foreground">{relativeTime(post.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">{post.body}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isPosting}
          placeholder="Ask a question or contribute to the debate..."
          className="w-full pl-3 pr-12 py-2.5 bg-secondary/15 border border-border/50 rounded-lg text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPosting}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 transition-all shadow active:scale-95 disabled:opacity-50"
        >
          {isPosting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      {error && <p className="text-[10px] text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
