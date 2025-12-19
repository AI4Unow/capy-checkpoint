import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User preferences for game settings
 * Persisted to localStorage
 */
interface SettingsState {
  // Accessibility
  reducedMotion: boolean;
  colorBlindMode: boolean;

  // Audio (prep for Phase 2)
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;

  // Actions
  setReducedMotion: (enabled: boolean) => void;
  setColorBlindMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
}

/**
 * Check system preference for reduced motion
 */
function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults - muted by default (classroom-friendly)
      reducedMotion: getSystemReducedMotion(),
      colorBlindMode: false,
      soundEnabled: false,
      musicEnabled: false,
      soundVolume: 0.7,
      musicVolume: 0.5,

      // Actions
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setColorBlindMode: (enabled) => set({ colorBlindMode: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: "capy-settings",
    }
  )
);
