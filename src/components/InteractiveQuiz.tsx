"use client";

import { useState, useTransition } from "react";
import { Check, X, Award, RotateCcw, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { useCourseProgress } from "./CourseProgressProvider";
import { submitQuizAction } from "@/app/actions/learningActions";
import type { PublicQuizQuestion } from "@/lib/activities";

export type { PublicQuizQuestion };

type QuestionResult = {
  correct: boolean;
  correctAnswer: number | number[];
  explanation?: string;
};

export function InteractiveQuiz({
  activityId,
  questions,
  isPractice = false,
}: {
  activityId: string;
  questions: PublicQuizQuestion[];
  isPractice?: boolean;
}) {
  const { markAsComplete } = useCourseProgress();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [results, setResults] = useState<Record<string, QuestionResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleOptionSelect = (questionId: string, optionIndex: number, type: string) => {
    if (submitted) return;

    setSelectedAnswers((prev) => {
      const current = prev[questionId];
      if (type === "multiselect") {
        const arr = Array.isArray(current) ? [...current] : [];
        if (arr.includes(optionIndex)) {
          return { ...prev, [questionId]: arr.filter((x) => x !== optionIndex) };
        }
        return { ...prev, [questionId]: [...arr, optionIndex].sort() };
      }
      return { ...prev, [questionId]: optionIndex };
    });
  };

  const handleSubmit = () => {
    if (submitted || isSubmitting) return;
    setError(null);

    startTransition(async () => {
      const res = await submitQuizAction(activityId, selectedAnswers);
      if (!res.success) {
        setError(res.error ?? "Could not submit your attempt.");
        return;
      }

      setScore(res.score);
      setPassed(res.passed);
      setResults(res.results);
      setSubmitted(true);
      if (res.completed) {
        markAsComplete(activityId);
      }
    });
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setResults({});
    setError(null);
  };

  if (questions.length === 0) {
    return (
      <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs md:text-sm text-muted-foreground">
        No questions configured for this quiz activity.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto bg-background py-4 select-none">
      {/* Quiz Title Banner */}
      <div className="border border-border/50 bg-card rounded-xl p-5 shadow-sm flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPractice ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm md:text-base text-foreground">
            {isPractice ? "Practice Assessment" : "Graded Evaluation Check"}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isPractice
              ? "Unlimited attempts • Self-practice check • Instantly unlocks on submission"
              : "Requires 80% or higher score to pass and receive module completion credit"}
          </p>
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-5">
        {questions.map((q, index) => {
          const selected = selectedAnswers[q.id];
          const result = results[q.id];
          const correct = result?.correct ?? false;

          return (
            <div
              key={q.id}
              className={`border rounded-xl p-5 bg-card shadow-sm transition-all ${
                submitted
                  ? correct
                    ? "border-green-600/35 bg-green-500/[0.01]"
                    : "border-red-500/30 bg-red-500/[0.01]"
                  : "border-border/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs md:text-sm font-semibold text-foreground">
                  <span className="text-muted-foreground mr-1">Question {index + 1}:</span>
                  {q.question}
                </span>
                {submitted && (
                  <span className="flex-shrink-0 mt-0.5">
                    {correct ? (
                      <Check className="w-4 h-4 text-green-600 fill-green-600/10" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </span>
                )}
              </div>

              {/* Input Selection Options */}
              <div className="mt-4 space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isChecked =
                    q.type === "multiselect"
                      ? Array.isArray(selected) && selected.includes(optIdx)
                      : selected === optIdx;

                  let optionStyle = "border-border/60 hover:bg-muted/15";
                  if (isChecked) {
                    optionStyle = "border-primary bg-primary/[0.02] font-medium";
                  }

                  if (submitted && result) {
                    const key = result.correctAnswer;
                    const isCorrectOption = Array.isArray(key) ? key.includes(optIdx) : key === optIdx;

                    if (isCorrectOption) {
                      optionStyle = "border-green-600 bg-green-600/10 text-green-700 font-semibold";
                    } else if (isChecked) {
                      optionStyle = "border-red-500 bg-red-500/5 text-red-600 font-medium";
                    } else {
                      optionStyle = "border-border/40 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted || isSubmitting}
                      onClick={() => handleOptionSelect(q.id, optIdx, q.type)}
                      className={`w-full text-left p-3 border rounded-lg text-xs md:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                        isChecked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanations Accordion Block */}
              {submitted && result && (
                <div className="mt-4 pt-3.5 border-t border-border/40 text-[11px] md:text-xs text-muted-foreground leading-relaxed flex items-start gap-2 bg-muted/20 p-3 rounded-lg">
                  <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${correct ? "text-green-600" : "text-amber-500"}`} />
                  <div>
                    <span className="font-semibold text-foreground mr-1">
                      {correct ? "Correct!" : "Incorrect."}
                    </span>
                    {result.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grade Results Banner */}
      {submitted ? (
        <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
          isPractice || passed
            ? "border-green-600/35 bg-green-500/5"
            : "border-red-500/30 bg-red-500/5"
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPractice || passed ? "bg-green-600/10 text-green-600" : "bg-red-500/10 text-red-600"
            }`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {isPractice
                  ? `Practice Attempt Logged! Score: ${score}%`
                  : passed
                  ? `Quiz Passed! Score: ${score}%`
                  : `Score: ${score}% • Required: 80%`}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isPractice
                  ? "Good job checking your fundamentals. Your attempt is recorded."
                  : passed
                  ? "Module completion requirements completed successfully."
                  : "Let's review the explanations above and attempt again!"}
              </p>
            </div>
          </div>
          {(!passed && !isPractice) && (
            <button
              onClick={handleRetry}
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-background border border-border/50 text-xs font-semibold text-foreground hover:bg-muted/10 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry Graded Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length || isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs md:text-sm font-semibold hover:bg-primary/95 shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
