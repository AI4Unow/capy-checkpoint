"use client";

import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";

/**
 * Get last N days as YYYY-MM-DD strings
 */
function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString("en-CA")); // YYYY-MM-DD format
  }

  return days;
}

/**
 * Get day of week label (S, M, T, W, T, F, S)
 */
function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];
}

/**
 * Streak Calendar - Visual display of last 14 days of activity
 */
export function StreakCalendar() {
  const { history } = useDailyChallengeStore();
  const last14Days = getLastNDays(14);

  // Create a map of date -> history entry
  const historyMap = new Map(history.map((h) => [h.date, h]));

  // Get today's date string
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="bg-white/50 rounded-xl p-4">
      <h3 className="text-sm font-[family-name:var(--font-fredoka)] text-text/70 mb-3 text-center">
        Last 2 Weeks
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {last14Days.map((day) => {
          const entry = historyMap.get(day);
          const isToday = day === today;
          const isFuture = day > today;

          let bgClass = "bg-gray-200"; // Default: missed
          let textClass = "text-text/40";

          if (isFuture) {
            bgClass = "bg-gray-100";
            textClass = "text-text/20";
          } else if (entry?.completed) {
            // Completed - color based on performance
            if (entry.correct === entry.total) {
              bgClass = "bg-sage"; // Perfect
            } else if (entry.correct >= 2) {
              bgClass = "bg-sage/70"; // Great
            } else {
              bgClass = "bg-sage/40"; // Good
            }
            textClass = "text-text";
          }

          if (isToday) {
            bgClass += " ring-2 ring-yellow ring-offset-1";
          }

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${bgClass} ${textClass}`}
              title={day}
            >
              <span className="text-[10px] opacity-60">{getDayLabel(day)}</span>
              <span className="font-bold">{new Date(day).getDate()}</span>
              {entry?.completed && (
                <span className="text-[8px]">
                  {entry.correct}/{entry.total}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-text/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-sage" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
