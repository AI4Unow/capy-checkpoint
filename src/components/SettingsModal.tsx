"use client";

import { useSettingsStore } from "@/stores/settingsStore";

interface SettingsModalProps {
  onClose: () => void;
}

/**
 * Settings modal - allows users to configure accessibility and audio settings
 */
export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    reducedMotion,
    colorBlindMode,
    soundEnabled,
    musicEnabled,
    setReducedMotion,
    setColorBlindMode,
    setSoundEnabled,
    setMusicEnabled,
  } = useSettingsStore();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-sky p-4 border-b-4 border-text flex items-center justify-between">
          <h2 className="text-2xl font-[family-name:var(--font-fredoka)] text-text">
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white rounded-full border-2 border-text flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Settings content */}
        <div className="p-6 space-y-6">
          {/* Accessibility section */}
          <section>
            <h3 className="text-lg font-[family-name:var(--font-fredoka)] text-text mb-4">
              Accessibility
            </h3>

            {/* Reduced Motion */}
            <label className="flex items-center justify-between py-3 border-b border-text/10">
              <div>
                <span className="font-[family-name:var(--font-nunito)] text-text">
                  Reduced Motion
                </span>
                <p className="text-sm text-text/60">
                  Disable animations and confetti
                </p>
              </div>
              <ToggleSwitch
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </label>

            {/* Color Blind Mode */}
            <label className="flex items-center justify-between py-3 border-b border-text/10">
              <div>
                <span className="font-[family-name:var(--font-nunito)] text-text">
                  Color Blind Mode
                </span>
                <p className="text-sm text-text/60">
                  Add icons alongside colors
                </p>
              </div>
              <ToggleSwitch
                checked={colorBlindMode}
                onChange={setColorBlindMode}
              />
            </label>
          </section>

          {/* Audio section */}
          <section>
            <h3 className="text-lg font-[family-name:var(--font-fredoka)] text-text mb-4">
              Audio
            </h3>

            {/* Sound Effects */}
            <label className="flex items-center justify-between py-3 border-b border-text/10">
              <div>
                <span className="font-[family-name:var(--font-nunito)] text-text">
                  Sound Effects
                </span>
                <p className="text-sm text-text/60">
                  Play sounds for actions
                </p>
              </div>
              <ToggleSwitch
                checked={soundEnabled}
                onChange={setSoundEnabled}
              />
            </label>

            {/* Music */}
            <label className="flex items-center justify-between py-3">
              <div>
                <span className="font-[family-name:var(--font-nunito)] text-text">
                  Background Music
                </span>
                <p className="text-sm text-text/60">
                  Play music during gameplay
                </p>
              </div>
              <ToggleSwitch
                checked={musicEnabled}
                onChange={setMusicEnabled}
              />
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/50 border-t-2 border-text/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-sage rounded-xl border-2 border-text font-[family-name:var(--font-baloo)] text-lg text-text hover:scale-105 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Toggle switch component
 */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        checked ? "bg-sage" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full border-2 border-text transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
