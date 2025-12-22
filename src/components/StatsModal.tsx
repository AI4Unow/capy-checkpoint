"use client";

import { useEffect, useCallback } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { useGameStore } from "@/stores/gameStore";
import { useBadgeStore } from "@/stores/badgeStore";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { useSpinStore } from "@/stores/spinStore";
import { BADGES } from "@/data/badges";
import type { Topic } from "@/types/question";

interface StatsModalProps {
  onClose: () => void;
}

const TOPIC_LABELS: Record<Topic, { name: string; emoji: string }> = {
  number: { name: "Number", emoji: "🔢" },
  calculation: { name: "Calculation", emoji: "➕" },
  geometry: { name: "Geometry", emoji: "📐" },
  measure: { name: "Measure", emoji: "📏" },
  data: { name: "Data", emoji: "📊" },
};

/**
 * Format subtopic for display (snake_case -> Title Case)
 */
function formatSubtopic(subtopic: string): string {
  return subtopic
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Stats Modal - Display comprehensive player statistics
 */
export function StatsModal({ onClose }: StatsModalProps) {
  // Escape key handler for accessibility
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Store hooks
  const {
    totalResponses,
    bestStreak,
    studentRating,
    getRatingInfo,
    getAllTopicProgress,
    getWeakTopics,
    getEloTrend,
    getQuestionsToNextLevel,
  } = useLearningStore();
  const { coins, bestScore } = useGameStore();
  const { getUnlockedCount } = useBadgeStore();
  const { currentStreak, longestStreak } = useDailyChallengeStore();
  const { totalSpins } = useSpinStore();

  const ratingInfo = getRatingInfo();
  const topicProgress = getAllTopicProgress();
  const weakTopics = getWeakTopics();
  const eloTrend = getEloTrend();
  const questionsToNext = getQuestionsToNextLevel();
  const badgeCount = getUnlockedCount();
  const totalBadges = BADGES.length;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
    >
      <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full max-h-[90vh] overflow-hidden animate-bounce-in flex flex-col">
        {/* Header */}
        <div className="bg-purple-500 p-6 border-b-4 border-text text-center shrink-0">
          <div className="text-5xl mb-2">📊</div>
          <h2
            id="stats-modal-title"
            className="text-3xl font-[family-name:var(--font-fredoka)] text-white"
          >
            Your Stats
          </h2>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Session Stats */}
          <StatCard title="Session Stats" emoji="🎮" bgColor="sky">
            <StatRow label="Questions Answered" value={totalResponses} />
            <StatRow label="Best Score" value={bestScore} />
            <StatRow label="Best Streak" value={`🔥 ${bestStreak}`} />
          </StatCard>

          {/* Learning Progress */}
          <StatCard title="Learning Progress" emoji="📈" bgColor="sage">
            {/* Elo with trend */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ratingInfo.emoji}</span>
                <div>
                  <div className="font-[family-name:var(--font-fredoka)] text-text">
                    {ratingInfo.name}
                  </div>
                  <div className="text-xs text-text/60">
                    Rating: {studentRating}
                    {eloTrend !== 0 && (
                      <span
                        className={
                          eloTrend > 0
                            ? "text-green-600 ml-1"
                            : "text-red-500 ml-1"
                        }
                      >
                        {eloTrend > 0 ? "↑" : "↓"}
                        {Math.abs(eloTrend)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {questionsToNext > 0 && (
                <div className="text-xs text-text/60 text-right">
                  ~{questionsToNext} Qs to next level
                </div>
              )}
            </div>

            {/* Rating progress bar */}
            <div className="mb-4">
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all"
                  style={{ width: `${ratingInfo.progress}%` }}
                />
              </div>
            </div>

            {/* Topic mastery bars */}
            <div className="space-y-2">
              <div className="text-sm font-[family-name:var(--font-fredoka)] text-text/80">
                Topic Mastery
              </div>
              {topicProgress.map(({ topic, progress }) => (
                <TopicProgressBar
                  key={topic}
                  progress={progress}
                  label={TOPIC_LABELS[topic]}
                />
              ))}
            </div>

            {/* Weak topics */}
            {weakTopics.length > 0 && (
              <div className="mt-3 pt-3 border-t border-text/10">
                <div className="text-xs text-text/60 mb-1">Needs Practice:</div>
                <div className="flex flex-wrap gap-1">
                  {weakTopics.map((subtopic) => (
                    <span
                      key={subtopic}
                      className="px-2 py-0.5 bg-pink/50 rounded-full text-xs text-text"
                    >
                      {formatSubtopic(subtopic)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </StatCard>

          {/* Gamification */}
          <StatCard title="Achievements" emoji="🏆" bgColor="yellow">
            <StatRow label="Badges" value={`${badgeCount}/${totalBadges}`} />
            <StatRow
              label="Daily Streak"
              value={`🔥 ${currentStreak} (best: ${longestStreak})`}
            />
            <StatRow label="Coins" value={`🪙 ${coins}`} />
            <StatRow label="Wheel Spins" value={totalSpins} />
          </StatCard>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-text/20 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-lg text-text hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

interface StatCardProps {
  title: string;
  emoji: string;
  bgColor: "sky" | "sage" | "yellow" | "pink";
  children: React.ReactNode;
}

function StatCard({ title, emoji, bgColor, children }: StatCardProps) {
  const bgClass = {
    sky: "bg-sky/30",
    sage: "bg-sage/30",
    yellow: "bg-yellow-200/30",
    pink: "bg-pink/30",
  }[bgColor];

  return (
    <div className={`${bgClass} rounded-xl p-4`}>
      <h3 className="text-lg font-[family-name:var(--font-fredoka)] text-text mb-3 flex items-center gap-2">
        <span>{emoji}</span>
        <span>{title}</span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text/70 font-[family-name:var(--font-nunito)]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-fredoka)] text-text">
        {value}
      </span>
    </div>
  );
}

interface TopicProgressBarProps {
  progress: number;
  label: { name: string; emoji: string };
}

function TopicProgressBar({ progress, label }: TopicProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-6">{label.emoji}</span>
      <div className="flex-1">
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-text/60 w-8 text-right">{progress}%</span>
    </div>
  );
}
