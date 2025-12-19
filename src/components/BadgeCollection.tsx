"use client";

import { useBadgeStore } from "@/stores/badgeStore";
import { useLearningStore } from "@/stores/learningStore";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { BADGES, BADGE_CATEGORIES } from "@/data/badges";
import type { Badge, BadgeCheckContext } from "@/types/badge";

interface BadgeCollectionProps {
  onClose: () => void;
}

/**
 * Badge Collection - Display all badges with progress
 */
export function BadgeCollection({ onClose }: BadgeCollectionProps) {
  const { isUnlocked, getProgress, getUnlockedCount } = useBadgeStore();
  const {
    totalResponses,
    bestStreak,
    masteryEntries,
    sessionCorrect,
  } = useLearningStore();
  const { currentStreak: dailyStreak } = useDailyChallengeStore();

  // Build context for progress calculation
  const masteredCount = masteryEntries.filter(
    (m) => m.status === "mastered"
  ).length;

  const context: BadgeCheckContext = {
    totalCorrect: sessionCorrect,
    totalAnswered: totalResponses,
    maxStreak: bestStreak,
    currentStreak: 0,
    masteredTopics: masteredCount,
    dailyStreak,
    currentHour: new Date().getHours(),
    lastAnswerTimeMs: 0,
  };

  const totalBadges = BADGES.length;
  const unlockedCount = getUnlockedCount();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-2xl w-full max-h-[90vh] overflow-hidden animate-bounce-in flex flex-col">
        {/* Header */}
        <div className="bg-purple-500 p-6 border-b-4 border-text text-center shrink-0">
          <div className="text-5xl mb-2">🏅</div>
          <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-white">
            Badge Collection
          </h2>
          <p className="text-white/80 font-[family-name:var(--font-nunito)] mt-2">
            {unlockedCount} / {totalBadges} unlocked
          </p>
        </div>

        {/* Badge categories */}
        <div className="p-4 overflow-y-auto flex-1">
          {BADGE_CATEGORIES.map((category) => {
            const categoryBadges = BADGES.filter(
              (b) => b.category === category.id
            );

            return (
              <div key={category.id} className="mb-6">
                <h3 className="text-lg font-[family-name:var(--font-fredoka)] text-text mb-3 flex items-center gap-2">
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {categoryBadges.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      unlocked={isUnlocked(badge.id)}
                      progress={getProgress(badge.id, context)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close button */}
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

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
  progress: number;
}

function BadgeCard({ badge, unlocked, progress }: BadgeCardProps) {
  // Secret badges show as "???" until unlocked
  const isSecret = badge.secret && !unlocked;

  // Tier colors
  const tierColors: Record<string, string> = {
    bronze: "from-amber-600 to-amber-800",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-400 to-yellow-600",
  };

  const tierBg = badge.tier ? tierColors[badge.tier] : "";

  return (
    <div
      className={`relative rounded-xl border-3 p-3 text-center transition-all ${
        unlocked
          ? "bg-white border-text shadow-md"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      {/* Tier indicator */}
      {badge.tier && unlocked && (
        <div
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${tierBg} border-2 border-white shadow-sm flex items-center justify-center`}
        >
          <span className="text-xs text-white font-bold">
            {badge.tier === "bronze" ? "B" : badge.tier === "silver" ? "S" : "G"}
          </span>
        </div>
      )}

      {/* Badge emoji */}
      <div
        className={`text-3xl mb-1 ${unlocked ? "" : "grayscale opacity-40"}`}
      >
        {isSecret ? "❓" : badge.emoji}
      </div>

      {/* Badge name */}
      <div
        className={`text-xs font-[family-name:var(--font-fredoka)] mb-1 truncate ${
          unlocked ? "text-text" : "text-text/50"
        }`}
      >
        {isSecret ? "???" : badge.name}
      </div>

      {/* Progress bar (if not unlocked) */}
      {!unlocked && !isSecret && (
        <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Unlocked checkmark */}
      {unlocked && (
        <div className="text-xs text-sage font-bold">✓ Unlocked</div>
      )}

      {/* Tooltip on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 bg-text/90 flex items-center justify-center p-2 transition-opacity">
        <div className="text-center">
          <div className="text-white text-xs font-[family-name:var(--font-nunito)]">
            {isSecret ? "Complete a secret challenge!" : badge.description}
          </div>
        </div>
      </div>
    </div>
  );
}
