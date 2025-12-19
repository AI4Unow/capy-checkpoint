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
  options: string[]; // 3 options for game gates
  correctIndex: number;
  hint?: string;
  explanation: string;
  // Extended fields for Cambridge questions
  source?: string; // e.g., "Cambridge 2014 Paper 1"
  marks?: number; // Original mark value
  hasImage?: boolean; // Question has associated image
  timesAnswered?: number; // For calibration
  correctRate?: number; // For calibration (0.0-1.0)
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
