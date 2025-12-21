"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/types/question";

interface AIHintProps {
  question: Question;
  studentAnswerIndex: number;
  onClose: () => void;
}

/**
 * AI-powered hint popup when student answers incorrectly
 * Game is paused until player clicks "Got it"
 */
export function AIHint({ question, studentAnswerIndex, onClose }: AIHintProps) {
  const [hint, setHint] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHint = async () => {
      try {
        const response = await fetch("/api/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.text,
            correctAnswer: question.options[question.correctIndex],
            studentAnswer: question.options[studentAnswerIndex],
            explanation: question.explanation,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setHint(data.hint);
        } else {
          // Fallback to static explanation
          setHint(question.explanation || "Try again! Think carefully about the question.");
        }
      } catch {
        setHint(question.explanation || "Keep trying! You've got this!");
      } finally {
        setLoading(false);
      }
    };

    fetchHint();
  }, [question, studentAnswerIndex]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-bounce-in bg-cream rounded-3xl border-4 border-text p-6 mx-4 max-w-md shadow-2xl">
        {/* Header with capybara */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🧠</span>
          <h3 className="font-fredoka text-xl text-text">AI Tutor Says...</h3>
        </div>

        {/* Hint content */}
        <div className="bg-white rounded-2xl p-4 border-2 border-sage mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-text">
              <span className="animate-pulse">💭</span>
              <span className="font-nunito">Thinking...</span>
            </div>
          ) : (
            <p className="font-nunito text-text leading-relaxed">{hint}</p>
          )}
        </div>

        {/* Correct answer reveal */}
        <div className="bg-sage/50 rounded-xl p-3 mb-4">
          <p className="font-nunito text-sm text-text">
            <span className="font-bold">Correct answer:</span>{" "}
            {question.options[question.correctIndex]}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-pink py-3 rounded-xl border-4 border-text font-fredoka text-text text-lg hover:scale-[1.02] transition-transform"
        >
          Got it! 💪
        </button>
      </div>
    </div>
  );
}
