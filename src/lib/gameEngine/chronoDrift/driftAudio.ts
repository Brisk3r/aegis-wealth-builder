// ============================================================================
// CHRONO DRIFT (NEON RACER) - PROCEDURAL WEB AUDIO SYNTHESIZER
// Aegis Arcade Universe (Project Phoenix)
// Strict 7-Bit ASCII Compliance -- Zero-Mojibake -- ANSI Windows-1252 Safe
// ============================================================================

export class DriftAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isRunning: boolean = false;

  // Continuous Engine Nodes
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  // Continuous Tire Screech Nodes
  private screechGain: GainNode | null = null;
  private screechFilter: BiquadFilterNode | null = null;
  private screechSource: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  public init(): void {
    if (typeof window === "undefined") return;
    if (this.ctx) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.engineGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.engineGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.generateNoiseBuffer();
      this.startEngineDrone();
      this.startScreechLoop();
    } catch {
      // Graceful fallback if Web Audio is unsupported
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private generateNoiseBuffer(): void {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2; // 2 second looping buffer
    this.noiseBuffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private startEngineDrone(): void {
    if (!this.ctx || !this.engineGain || this.engineOsc) return;

    // Sawtooth engine oscillator + Sub square oscillator
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.setValueAtTime(75, this.ctx.currentTime);

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = "triangle";
    this.engineSubOsc.frequency.setValueAtTime(37.5, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineSubOsc.connect(subGain);
    subGain.connect(this.engineFilter);

    this.engineFilter.connect(this.engineGain);

    this.engineOsc.start();
    this.engineSubOsc.start();
    this.isRunning = true;
  }

  private startScreechLoop(): void {
    if (!this.ctx || !this.noiseBuffer || !this.masterGain || this.screechSource) return;

    this.screechSource = this.ctx.createBufferSource();
    this.screechSource.buffer = this.noiseBuffer;
    this.screechSource.loop = true;

    this.screechFilter = this.ctx.createBiquadFilter();
    this.screechFilter.type = "bandpass";
    this.screechFilter.frequency.setValueAtTime(1600, this.ctx.currentTime);
    this.screechFilter.Q.setValueAtTime(4.5, this.ctx.currentTime);

    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.screechSource.connect(this.screechFilter);
    this.screechFilter.connect(this.screechGain);
    this.screechGain.connect(this.masterGain);

    this.screechSource.start();
  }

  /**
   * Updates real-time engine RPM and tire screech based on physics state.
   */
  public updatePhysicsAudio(
    speed: number,
    topSpeed: number,
    throttle: number,
    slipAngle: number,
    isDrifting: boolean,
    boostTimer: number
  ): void {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Engine Pitch & Volume
    const speedRatio = Math.min(1.0, speed / Math.max(1, topSpeed));
    const targetFreq = 75 + speedRatio * 380 + (boostTimer > 0 ? 120 : 0);
    const targetCutoff = 300 + throttle * 1800 + speedRatio * 600;
    const targetVolume = Math.min(0.5, 0.08 + throttle * 0.25 + speedRatio * 0.2);

    if (this.engineOsc && this.engineSubOsc && this.engineFilter && this.engineGain) {
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.04);
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.04);
      this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.04);
      this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.05);
    }

    // 2. Tire Screech Noise
    const absBeta = Math.abs(slipAngle);
    if (this.screechFilter && this.screechGain) {
      if (isDrifting && speed > 50) {
        const bandFreq = 1400 + absBeta * 1200;
        const screechVol = Math.min(0.35, Math.max(0, (absBeta - 0.2) / 0.6) * 0.35);
        this.screechFilter.frequency.setTargetAtTime(bandFreq, now, 0.03);
        this.screechGain.gain.setTargetAtTime(screechVol, now, 0.03);
      } else {
        this.screechGain.gain.setTargetAtTime(0.0, now, 0.05);
      }
    }
  }

  /**
   * Checkpoint Gate Ding (Dual-Tone C6 & E6 sine bell).
   */
  public playCheckpointDing(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    [1046.5, 1318.51].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * Turbo Boost Discharge sound (Dual-oscillator upward frequency sweep + sub punch).
   */
  public playTurboDischarge(tier: number = 1): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.45;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    const baseStart = tier === 3 ? 240 : tier === 2 ? 200 : 180;
    const targetEnd = tier === 3 ? 1900 : tier === 2 ? 1600 : 1400;

    osc1.frequency.setValueAtTime(baseStart, now);
    osc1.frequency.exponentialRampToValueAtTime(targetEnd, now + duration);

    osc2.frequency.setValueAtTime(baseStart * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(targetEnd * 1.2, now + duration);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Boost Pad Whoosh sound.
   */
  public playBoostPadWhoosh(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Wall Collision impact thud.
   */
  public playWallHit(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Lap Completion Fanfare (Ascending 4-note arpeggio [C5, E5, G5, C6]).
   */
  public playLapFanfare(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  /**
   * Race Finish Victory Fanfare (Celebratory multi-stage fanfare).
   */
  public playRaceVictoryFanfare(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const chords = [
      { freq: 523.25, time: 0.0 }, // C5
      { freq: 659.25, time: 0.12 }, // E5
      { freq: 783.99, time: 0.24 }, // G5
      { freq: 1046.5, time: 0.36 }, // C6
      { freq: 1318.51, time: 0.52 }, // E6
      { freq: 1567.98, time: 0.70 }, // G6
    ];
    const now = this.ctx.currentTime;

    chords.forEach(({ freq, time }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.3, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + time);
      osc.stop(now + time + 0.6);
    });
  }

  /**
   * Clean shutdown of active nodes on component unmount.
   */
  public destroy(): void {
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      if (this.engineSubOsc) {
        this.engineSubOsc.stop();
        this.engineSubOsc.disconnect();
      }
      if (this.screechSource) {
        this.screechSource.stop();
        this.screechSource.disconnect();
      }
      if (this.ctx && this.ctx.state !== "closed") {
        this.ctx.close();
      }
    } catch {}
    this.ctx = null;
    this.isRunning = false;
  }
}
