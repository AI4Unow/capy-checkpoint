/**
 * Question types for Cambridge Primary Checkpoint Math
 */

export type Topic = "number" | "calculation" | "geometry" | "measure" | "data";

export interface Question {
  id: string;
  topic: Topic;
  subtopic: string;
  difficulty: number; // 600-1400 Elo scale
  text: string;
  options: [string, string, string]; // Always 3 options
  correctIndex: 0 | 1 | 2;
  hint?: string;
  explanation: string;
}

export interface SubtopicMastery {
  subtopic: string;
  topic: Topic;
  score: number; // 0.0 - 1.0
  status: "not_started" | "learning" | "mastered";
  attempts: number;
  lastAttempt: Date | null;
}

export interface StudentProfile {
  id: string;
  displayName: string;
  eloRating: number; // default 1000
  responsesCount: number;
  yuzuCoins: number;
  currentWorld: number;
  streakDays: number;
  lastPlayedAt: Date | null;
  avatar: {
    skin: string;
    hat: string;
    cape: string;
  };
}
