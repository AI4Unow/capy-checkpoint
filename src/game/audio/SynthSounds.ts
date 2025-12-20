/**
 * Synthesized sound effects using Web Audio API
 * These are procedurally generated sounds that don't require external files
 * Used as fallback when audio files aren't available
 */
export class SynthSounds {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // AudioContext created on first user interaction
  }

  /**
   * Initialize AudioContext (must be called from user gesture)
   */
  init(): void {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Play a soft wing flap "whoosh" sound
   */
  playFlap(): void {
    if (!this.enabled || !this.audioContext) return;
    // Create noise-based whoosh for wing flap
    this.playNoise(0.08, 0.25); // Short burst of filtered noise
    // Add a soft pitch sweep for fluttery feel
    this.playTone(600, 0.03, "sine", 0.15);
    setTimeout(() => this.playTone(450, 0.03, "sine", 0.1), 20);
  }

  /**
   * Play filtered white noise burst (for whoosh effects)
   */
  private playNoise(duration: number, volume: number): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // Low-pass filter for softer sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    // Envelope for quick fade
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
    source.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play ascending chime for correct answer
   */
  playCorrect(): void {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(523, 0.1, "sine", 0.4); // C5
    setTimeout(() => this.playTone(659, 0.1, "sine", 0.4), 100); // E5
    setTimeout(() => this.playTone(784, 0.15, "sine", 0.5), 200); // G5
  }

  /**
   * Play descending buzz for wrong answer
   */
  playWrong(): void {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(200, 0.15, "sawtooth", 0.3);
    setTimeout(() => this.playTone(150, 0.2, "sawtooth", 0.2), 100);
  }

  /**
   * Play excited fanfare for streak
   */
  playStreak(): void {
    if (!this.enabled || !this.audioContext) return;
    const notes = [523, 659, 784, 880, 1047]; // C5, E5, G5, A5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, "sine", 0.5), i * 60);
    });
  }

  /**
   * Play triumphant level up sound
   */
  playLevelUp(): void {
    if (!this.enabled || !this.audioContext) return;
    const notes = [262, 330, 392, 523]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, "triangle", 0.6), i * 150);
    });
  }

  /**
   * Play tick sound for spin wheel
   */
  playSpin(): void {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(800, 0.02, "sine", 0.2);
  }

  /**
   * Play jackpot fanfare for big wins
   */
  playJackpot(): void {
    if (!this.enabled || !this.audioContext) return;
    const notes = [523, 659, 784, 880, 1047]; // C5, E5, G5, A5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, "triangle", 0.6), i * 100);
    });
    // Add shimmer effect
    setTimeout(() => {
      this.playTone(1319, 0.3, "sine", 0.4); // E6
    }, 500);
  }

  /**
   * Cute happy squeak for correct answers
   */
  playHappyCapy(): void {
    if (!this.enabled || !this.audioContext) return;
    // High-pitched "squee": 600Hz→800Hz sweep
    this.playTone(600, 0.08, "sine", 0.4);
    setTimeout(() => this.playTone(800, 0.1, "sine", 0.4), 80);
  }

  /**
   * Soft sad whimper for wrong answers
   */
  playSadCapy(): void {
    if (!this.enabled || !this.audioContext) return;
    // Descending tone: 400Hz→250Hz
    this.playTone(400, 0.15, "sine", 0.3);
    setTimeout(() => this.playTone(300, 0.15, "sine", 0.2), 150);
    setTimeout(() => this.playTone(250, 0.2, "sine", 0.15), 300);
  }

  /**
   * Excited chirp for streaks and love reactions
   */
  playExcitedCapy(): void {
    if (!this.enabled || !this.audioContext) return;
    // Quick ascending chirps
    const notes = [500, 600, 700, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.06, "sine", 0.4), i * 50);
    });
  }

  /**
   * Box opening build-up sound
   */
  playBoxOpen(): void {
    if (!this.enabled || !this.audioContext) return;
    // Rising tension: ascending tones
    const notes = [200, 300, 400, 500, 600];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, "triangle", 0.35), i * 200);
    });
  }

  /**
   * Play a single tone
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volumeMultiplier: number = 1
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const finalVolume = this.volume * volumeMultiplier * 0.3; // Keep it quiet
    gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

// Singleton instance
export const synthSounds = new SynthSounds();
