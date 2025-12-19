"use client";

import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";

interface SessionSummaryProps {
  onPlayAgain: () => void;
  onBoutique: () => void;
  onMenu: () => void;
}

// Format subtopic for display
function formatSubtopic(subtopic: string): string {
  return subtopic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SessionSummary({
  onPlayAgain,
  onBoutique,
  onMenu,
}: SessionSummaryProps) {
  const { score, correctCount } = useGameStore();
  const {
    studentRating,
    bestStreak,
    getRatingInfo,
    sessionTotal,
    sessionCorrect,
    sessionMasteries,
    sessionImproved,
    sessionWeakest,
    getDueReviewCount,
  } = useLearningStore();
  const ratingInfo = getRatingInfo();
  const dueCount = getDueReviewCount();

  const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
  const coinsEarned = correctCount * 10;

  // Get top improvements (sorted by delta, descending)
  const topImproved = [...sessionImproved]
    .filter((i) => i.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);

  // Get areas needing work (sorted by wrong count, descending)
  const needsWork = [...sessionWeakest]
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-sm w-full overflow-hidden animate-bounce-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-pink p-6 text-center border-b-4 border-text">
          <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-text">
            Great Job!
          </h2>
          <p className="text-text/70 mt-1 font-[family-name:var(--font-nunito)]">
            Session Complete
          </p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          {/* Score */}
          <div className="flex justify-between items-center">
            <span className="text-text/70 font-[family-name:var(--font-nunito)]">
              Score
            </span>
            <span className="text-2xl font-[family-name:var(--font-baloo)] text-text">
              {score}
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex justify-between items-center">
            <span className="text-text/70 font-[family-name:var(--font-nunito)]">
              Accuracy
            </span>
            <span className="text-2xl font-[family-name:var(--font-baloo)] text-text">
              {accuracy}%
            </span>
          </div>

          {/* Best streak */}
          {bestStreak >= 3 && (
            <div className="flex justify-between items-center">
              <span className="text-text/70 font-[family-name:var(--font-nunito)]">
                Best Streak
              </span>
              <span className="text-2xl font-[family-name:var(--font-baloo)] text-text">
                {bestStreak >= 5 ? "🔥" : "⚡"} {bestStreak}
              </span>
            </div>
          )}

          {/* Coins earned */}
          <div className="flex justify-between items-center bg-yellow/30 rounded-xl p-3 -mx-2">
            <span className="text-text font-[family-name:var(--font-nunito)]">
              Coins Earned
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xl">🪙</span>
              <span className="text-2xl font-[family-name:var(--font-baloo)] text-text">
                +{coinsEarned}
              </span>
            </div>
          </div>

          {/* Learning Insights Section */}
          {(sessionMasteries.length > 0 || topImproved.length > 0 || needsWork.length > 0) && (
            <div className="bg-sky/30 rounded-xl p-4 -mx-2 space-y-3">
              <h3 className="font-[family-name:var(--font-fredoka)] text-text text-lg">
                📊 Learning Insights
              </h3>

              {/* Mastered this session */}
              {sessionMasteries.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">🏆</span>
                  <div>
                    <span className="text-sm text-text/70">Mastered Today:</span>
                    <div className="font-[family-name:var(--font-nunito)] text-text">
                      {sessionMasteries.map(formatSubtopic).join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Improved areas */}
              {topImproved.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">📈</span>
                  <div>
                    <span className="text-sm text-text/70">Improved:</span>
                    <div className="font-[family-name:var(--font-nunito)] text-text">
                      {topImproved.map((i) => (
                        <span key={i.subtopic}>
                          {formatSubtopic(i.subtopic)} (+{Math.round(i.delta * 100)}%)
                        </span>
                      )).reduce((prev, curr, idx) => (
                        idx === 0 ? [curr] : [...prev, ", ", curr]
                      ) as React.ReactNode[], [] as React.ReactNode[])}
                    </div>
                  </div>
                </div>
              )}

              {/* Needs work */}
              {needsWork.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">💪</span>
                  <div>
                    <span className="text-sm text-text/70">Needs Practice:</span>
                    <div className="font-[family-name:var(--font-nunito)] text-text">
                      {needsWork.map((w) => (
                        <span key={w.subtopic}>
                          {formatSubtopic(w.subtopic)} ({w.wrongCount} wrong)
                        </span>
                      )).reduce((prev, curr, idx) => (
                        idx === 0 ? [curr] : [...prev, ", ", curr]
                      ) as React.ReactNode[], [] as React.ReactNode[])}
                    </div>
                  </div>
                </div>
              )}

              {/* Due for review tomorrow */}
              {dueCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-text/70">
                  <span>📅</span>
                  <span>{dueCount} topic{dueCount > 1 ? "s" : ""} due for review</span>
                </div>
              )}
            </div>
          )}

          {/* Rating level */}
          <div className="flex justify-between items-center bg-sage/30 rounded-xl p-3 -mx-2">
            <span className="text-text font-[family-name:var(--font-nunito)]">
              Level
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ratingInfo.emoji}</span>
              <div className="text-right">
                <div className="font-[family-name:var(--font-fredoka)] text-text">
                  {ratingInfo.name}
                </div>
                <div className="text-xs text-text/60">
                  Rating: {studentRating}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-text/60 mb-1">
              <span>Progress to next level</span>
              <span>{ratingInfo.progress}%</span>
            </div>
            <div className="h-3 bg-sage/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage transition-all duration-500"
                style={{ width: `${ratingInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white/50 border-t-2 border-text/10 space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-sage rounded-xl border-2 border-text font-[family-name:var(--font-baloo)] text-lg text-text hover:bg-sage/80 transition-colors"
          >
            Play Again
          </button>
          <div className="flex gap-2">
            <button
              onClick={onBoutique}
              className="flex-1 py-2 bg-pink rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-text hover:bg-pink/80 transition-colors"
            >
              🛍️ Boutique
            </button>
            <button
              onClick={onMenu}
              className="flex-1 py-2 bg-white rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-text hover:bg-gray-100 transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
