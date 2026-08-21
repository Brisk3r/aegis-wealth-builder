// Procedural Web Audio API Soundboard for Void Survivors (Nova Protocol)
// 100% Zero-Latency, Zero External Dependencies, Native Web Audio Synthesis
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

export class VoidSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private noiseBuffer: AudioBuffer | null = null;
  private lastChimeTime: number = 0;
  private chimeStreak: number = 0;

  // Scale for XP Gem Chimes: Pentatonic Frequencies
  private readonly GEM_CHIME_PITCHES: number[] = [
    1046.50, // C6
    1174.66, // D6
    1318.51, // E6
    1567.98, // G6
    1760.00, // A6
    2093.00, // C7
    2349.32, // D7
    2637.02, // E7
  ];

  public init(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.sfxGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.generateNoiseBuffer();
      }
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private generateNoiseBuffer(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * 1. XP Gem Crystalline FM Chime
   * 2-Operator FM Bell with frequency progression for pickup streaks.
   */
  public playXPGemChime(streakOverride?: number): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.25) {
      this.chimeStreak = Math.min(this.GEM_CHIME_PITCHES.length - 1, this.chimeStreak + 1);
    } else {
      this.chimeStreak = 0;
    }
    this.lastChimeTime = now;

    const pitchIndex = streakOverride !== undefined ? (streakOverride % this.GEM_CHIME_PITCHES.length) : this.chimeStreak;
    const baseFreq = this.GEM_CHIME_PITCHES[pitchIndex];

    // Carrier Oscillator
    const carrier = this.ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.setValueAtTime(baseFreq, now);

    // Modulator Oscillator (FM modulation for glass/crystalline harmonic character)
    const modulator = this.ctx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.setValueAtTime(baseFreq * 2.76, now);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(baseFreq * 1.5, now);
    modGain.gain.exponentialRampToValueAtTime(1.0, now + 0.12);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    // Amplitude Envelope
    const ampGain = this.ctx.createGain();
    ampGain.gain.setValueAtTime(0.35, now);
    ampGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    carrier.connect(ampGain);
    ampGain.connect(this.sfxGain);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 0.15);
    carrier.stop(now + 0.15);
  }

  /**
   * 2. Chain Lightning Arc Zap
   * Filtered white noise burst mixed with fast descending pitch sweep.
   */
  public playChainLightningZap(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Pitch drop oscillator
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    const oscFilter = this.ctx.createBiquadFilter();
    oscFilter.type = "bandpass";
    oscFilter.frequency.setValueAtTime(1600, now);
    oscFilter.Q.setValueAtTime(3.0, now);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);

    // Noise crackle burst
    if (this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(2800, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.15);
    }
  }

  /**
   * 3. Missile Launch Chirp
   */
  public playMissileLaunch(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * 4. Missile 808 Sub-Bass Explosion
   */
  public playMissileExplosion(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 808 Sub Drop
    const subOsc = this.ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.42);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + 0.45);

    // Resonant Noise Blast
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.4);
    }
  }

  /**
   * 5. Orbiting Plasma Blade Slice
   */
  public playBladeSlice(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * 6. Laser Drone Pulse / Sizzle
   */
  public playDroneLaserPulse(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * 7. Level-Up 4-Note Major Arpeggio Shimmer [C5, E5, G5, C6]
   */
  public playLevelUpFanfare(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = startTime + idx * 0.06;

      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });
  }

  /**
   * 8. Dash / Dodge Roll Whoosh
   */
  public playDashSwoosh(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * 9. Extraction Siren / Alarm
   */
  public playExtractionSiren(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.25);
    osc.frequency.linearRampToValueAtTime(880, now + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  /**
   * 10. Extraction Victory Cascade
   */
  public playExtractionVictory(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const victoryNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    const startTime = this.ctx.currentTime;

    victoryNotes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = startTime + idx * 0.08;

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  }

  /**
   * 11. Boss Spawn Alarm
   */
  public playBossAlarm(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  /**
   * 12. Player Hit / Damage
   */
  public playPlayerHit(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * 13. Shield Deflection
   */
  public playShieldDeflect(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const voidSound = new VoidSoundEngine();
