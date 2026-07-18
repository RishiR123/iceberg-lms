"use client";

import { useState, useEffect, useTransition } from "react";
import { FileText, Save, CheckCircle, Loader2 } from "lucide-react";
import { getNoteAction, saveNoteAction } from "@/app/actions/learningActions";

export function InteractiveNotes({ lessonId }: { lessonId: string }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getNoteAction(lessonId).then((res) => {
      if (!active) return;
      setNote(res.body ?? "");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [lessonId]);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveNoteAction(lessonId, note);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error ?? "Could not save your note.");
      }
    });
  };

  return (
    <div className="border border-border/60 bg-card rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs md:text-sm text-foreground">Scratchpad & Notes</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold rounded hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save Note
            </>
          )}
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
        placeholder={loading ? "Loading your notes…" : "Type your notes here… They are saved to your account."}
        className="w-full h-40 bg-secondary/20 border border-border/50 rounded-lg p-3 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent leading-relaxed resize-none scrollbar-hide disabled:opacity-60"
      />
      {error ? (
        <p className="text-[10px] text-red-600 text-right font-semibold">{error}</p>
      ) : (
        <p className="text-[10px] text-muted-foreground text-right italic">
          Saved to your account — available on any device.
        </p>
      )}
    </div>
  );
}
