// Procedural Web Audio API Sound Synthesizer Engine
// 100% Zero-Latency, Zero External Dependencies, Procedural Synthesis
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

import { BumperType } from "./types";

export type SoundIntensity = "SMALL" | "MEDIUM" | "MASSIVE" | "small" | "medium" | "boss";

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.4;
  private droneVolume: number = 0.25;
  private noiseBuffer: AudioBuffer | null = null;

  // Drone active nodes reference for smooth crossfade stops
  private droneNodes: {
    leftOsc: OscillatorNode;
    rightOsc: OscillatorNode;
    subOsc: OscillatorNode;
    filter: BiquadFilterNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    gain: GainNode;
  } | null = null;

  private musicInterval: number | null = null;
  private musicStep: number = 0;

  // 16 Equal-Temperament Notes across 3 full octaves: Pentatonic Scale C4 (261.63 Hz) to C7 (2093.00 Hz)
  public readonly PENTATONIC_SCALE: readonly number[] = [
    261.63, // [ 0] C4
    293.66, // [ 1] D4
    329.63, // [ 2] E4
    392.00, // [ 3] G4
    440.00, // [ 4] A4
    523.25, // [ 5] C5
    587.33, // [ 6] D5
    659.25, // [ 7] E5
    783.99, // [ 8] G5
    880.00, // [ 9] A5
    1046.50, // [10] C6
    1174.66, // [11] D6
    1318.51, // [12] E6
    1567.98, // [13] G6
    1760.00, // [14] A6
    2093.00, // [15] C7
  ];

  // --- LIFECYCLE & CONTEXT INITIALIZATION ---

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
        this.musicGain = this.ctx.createGain();
        this.droneGain = this.ctx.createGain();

        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.droneGain.gain.setValueAtTime(this.droneVolume, this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.droneGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Pre-generate 2-second white noise buffer for zero GC allocations
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

  // --- VOLUME & MUTE CONTROLS ---

  public setMasterVolume(vol: number): void {
    this.init();
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime);
  }

  public setSfxVolume(vol: number): void {
    this.init();
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number): void {
    this.init();
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setDroneVolume(vol: number): void {
    this.init();
    this.droneVolume = Math.max(0, Math.min(1, vol));
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(this.droneVolume, this.ctx.currentTime);
    }
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

  // --- WEB VIBRATION API HAPTICS ---

  public triggerHaptic(pattern: number | number[] = 15): void {
    if (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic errors on unsupported hardware
      }
    }
  }

  // --- ITEM 1 & 2: 2-OPERATOR FM BELL SYNTHESIS & PENTATONIC COMBO SCALE ---

  /**
   * 2-Operator FM Bell Tone Modulator
   * Modulator oscillator frequency modulates carrier oscillator with exponential modulation index decay
   */
  public playFMBell(
    freq: number,
    modRatio: number = 2.0,
    modIndex: number = 3.0,
    decayTime: number = 0.35,
    carrierType: OscillatorType = "sine",
    volume: number = 0.45
  ): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const carrierOsc = this.ctx.createOscillator();
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const carrierGain = this.ctx.createGain();

    const modFreq = freq * modRatio;
    const initialModDepth = freq * modIndex;

    // Carrier Oscillator configuration
    carrierOsc.type = carrierType;
    carrierOsc.frequency.setValueAtTime(freq, t);

    // Modulator Oscillator configuration (Modulator -> ModGain -> Carrier.frequency)
    modOsc.type = "sine";
    modOsc.frequency.setValueAtTime(modFreq, t);

    // Exponential modulation index decay (bright clangorous attack collapsing to pure crystal tone)
    modGain.gain.setValueAtTime(initialModDepth, t);
    modGain.gain.exponentialRampToValueAtTime(0.01, t + decayTime * 0.6);

    modOsc.connect(modGain);
    modGain.connect(carrierOsc.frequency);

    // Carrier Amplitude Envelope
    carrierGain.gain.setValueAtTime(0.001, t);
    carrierGain.gain.linearRampToValueAtTime(volume, t + 0.004);
    carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);

    carrierOsc.connect(carrierGain);
    carrierGain.connect(this.sfxGain);

    modOsc.start(t);
    carrierOsc.start(t);
    modOsc.stop(t + decayTime + 0.05);
    carrierOsc.stop(t + decayTime + 0.05);
  }

  /**
   * Dynamic Bumper Collision Sound: Combines 2-Operator FM Bell Synthesis with Pentatonic Scale
   */
  public playBumperHit(combo: number = 1, type: BumperType | string = "STANDARD"): void {
    this.init();
    this.resume();

    // Map combo streak to 16 equal-temperament pentatonic notes (C4 to C7)
    const noteIndex = Math.min(Math.max(0, combo - 1), this.PENTATONIC_SCALE.length - 1);
    const freq = this.PENTATONIC_SCALE[noteIndex];

    // Bumper-specific FM timbre modulation parameters
    let modRatio = 2.0;
    let modIndex = 2.5;
    let decay = 0.35;
    let carrierType: OscillatorType = "sine";
    let volume = 0.45;
    let hapticPattern: number | number[] = 12;

    switch (type) {
      case "BOUNCE_SUPER":
        modRatio = 3.5;
        modIndex = 3.8;
        decay = 0.45;
        carrierType = "triangle";
        volume = 0.55;
        hapticPattern = [15, 20, 25];
        break;
      case "GOLDEN_CORE":
        modRatio = 1.414; // Golden ratio inharmonic chime
        modIndex = 4.2;
        decay = 0.55;
        carrierType = "sine";
        volume = 0.6;
        hapticPattern = [18, 15, 30];
        break;
      case "PRISM_LASER":
        modRatio = 4.25;
        modIndex = 5.0;
        decay = 0.28;
        carrierType = "sawtooth";
        volume = 0.4;
        hapticPattern = [14, 18];
        break;
      case "TESLA_NODE":
        modRatio = 5.0;
        modIndex = 6.0;
        decay = 0.22;
        carrierType = "sawtooth";
        volume = 0.45;
        hapticPattern = [10, 10, 20];
        break;
      case "EXPLOSIVE":
        modRatio = 0.5;
        modIndex = 4.0;
        decay = 0.4;
        carrierType = "triangle";
        volume = 0.6;
        hapticPattern = [25, 20];
        break;
      case "WARP_PORTAL":
        modRatio = 1.732;
        modIndex = 3.2;
        decay = 0.48;
        carrierType = "sine";
        volume = 0.5;
        hapticPattern = [15, 35];
        break;
      case "SHIELD_BEACON":
        modRatio = 2.5;
        modIndex = 2.8;
        decay = 0.38;
        carrierType = "triangle";
        volume = 0.5;
        hapticPattern = [16, 20];
        break;
      case "STANDARD":
      default:
        modRatio = 2.756; // Crystal bell chime
        modIndex = 2.5;
        decay = 0.32;
        carrierType = "sine";
        volume = 0.45;
        hapticPattern = combo > 8 ? [15, 20, 25] : combo > 4 ? [12, 16] : 10;
        break;
    }

    this.triggerHaptic(hapticPattern);
    this.playFMBell(freq, modRatio, modIndex, decay, carrierType, volume);

    // If super high combo milestone (every 8 combos), trigger ascending harmonic shimmer chord
    if (combo > 1 && combo % 8 === 0) {
      this.playComboChord(combo);
    }
  }

  /**
   * Ascending Harmonic Pentatonic Arpeggio / Chord Shimmer for High Combos
   */
  public playComboChord(comboLevel: number = 8): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const baseIdx = Math.min((comboLevel / 4) | 0, 8);
    const chordNotes = [
      this.PENTATONIC_SCALE[baseIdx % this.PENTATONIC_SCALE.length],
      this.PENTATONIC_SCALE[(baseIdx + 2) % this.PENTATONIC_SCALE.length],
      this.PENTATONIC_SCALE[(baseIdx + 4) % this.PENTATONIC_SCALE.length],
      this.PENTATONIC_SCALE[(baseIdx + 7) % this.PENTATONIC_SCALE.length],
    ];

    chordNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playFMBell(freq, 2.0, 2.0, 0.4, "sine", 0.25);
      }, idx * 45);
    });
  }

  // --- ITEM 3: SUB-BASS 808 SYNTHESIZER ---

  /**
   * Sub-Bass 808 Synthesizer with exponential pitch and amplitude envelope
   */
  public playKick808(
    punchFreq: number = 160,
    subFreq: number = 38,
    decay: number = 0.45,
    volume: number = 0.65
  ): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";

    // Exponential pitch envelope: instant punch down to deep sub-bass
    osc.frequency.setValueAtTime(punchFreq, t);
    osc.frequency.exponentialRampToValueAtTime(subFreq, t + 0.055);
    osc.frequency.setValueAtTime(subFreq, t + 0.055);
    osc.frequency.exponentialRampToValueAtTime(subFreq * 0.8, t + decay);

    // Punch and sub decay amplitude envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + decay + 0.05);
    this.triggerHaptic(18);
  }

  /**
   * Multi-Layer Supernova / Explosions with Sub-Bass 808 & Biquad Filtered Noise
   */
  public playExplosion(intensity: SoundIntensity = "MEDIUM"): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const norm = String(intensity).toUpperCase();
    const isBoss = norm === "MASSIVE" || norm === "BOSS";
    const isSmall = norm === "SMALL";

    const duration = isBoss ? 0.95 : isSmall ? 0.28 : 0.52;
    const peakVol = isBoss ? 0.75 : isSmall ? 0.3 : 0.5;
    const t = this.ctx.currentTime;

    // Trigger synchronized haptics
    this.triggerHaptic(isBoss ? [50, 40, 70, 50, 120] : isSmall ? 15 : [25, 30]);

    // Layer 1: Sub-Bass 808 Pitch Drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";

    const punchFreq = isBoss ? 190 : isSmall ? 130 : 160;
    const subFreq = isBoss ? 26 : isSmall ? 45 : 34;

    subOsc.frequency.setValueAtTime(punchFreq, t);
    subOsc.frequency.exponentialRampToValueAtTime(subFreq, t + 0.07);
    subOsc.frequency.exponentialRampToValueAtTime(subFreq * 0.75, t + duration);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(peakVol * 0.9, t + 0.004);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t);
    subOsc.stop(t + duration + 0.05);

    // Layer 2: White Noise Burst with Swept Biquad Lowpass Filter
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      const startCutoff = isBoss ? 1600 : isSmall ? 750 : 1100;
      filter.frequency.setValueAtTime(startCutoff, t);
      filter.frequency.exponentialRampToValueAtTime(25, t + duration * 0.9);
      if (isBoss) filter.Q.setValueAtTime(2.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(peakVol * 0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + duration);
    }
  }

  // --- ITEM 4: WHITE NOISE BURST SHAPER & LASER DEFLECTION ---

  /**
   * Resonant Biquad Filter Swept Laser Deflection
   */
  public playLaserDeflection(centerPitch: number = 2600): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = 0.16;

    // Layer 1: Resonant Noise Burst
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(centerPitch, t);
      filter.frequency.exponentialRampToValueAtTime(centerPitch * 2.5, t + duration);
      filter.Q.setValueAtTime(6.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + duration);
    }

    // Layer 2: Rapid Pitch Sweep Laser Ting
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(centerPitch * 1.2, t);
    osc.frequency.exponentialRampToValueAtTime(centerPitch * 0.35, t + duration);

    oscGain.gain.setValueAtTime(0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration + 0.02);

    this.triggerHaptic([12, 10]);
  }

  public playShieldDeflect(): void {
    this.playLaserDeflection(1800);
  }

  public playShieldBreak(): void {
    this.init();
    this.resume();
    this.triggerHaptic([40, 20, 40]);
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = 0.35;

    // Shatter noise
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2400, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + duration);
    }

    // Dissonant shatter pings
    [620, 580, 310].forEach((freq, idx) => {
      setTimeout(() => {
        this.playFMBell(freq, 3.14, 4.0, 0.25, "sawtooth", 0.3);
      }, idx * 30);
    });
  }

  /**
   * Procedural Cyber Snare for Step Sequencer & Combat
   */
  public playSnare(snappy: number = 0.5): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = 0.18;

    // Noise crackle
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400 + snappy * 1000, t);
      filter.Q.setValueAtTime(2.0, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + duration);
    }

    // Snare tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.08);

    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
    this.triggerHaptic(12);
  }

  /**
   * Procedural Laser Hi-Hat for Step Sequencer
   */
  public playHiHat(isOpen: boolean = false): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted || !this.noiseBuffer) return;

    const t = this.ctx.currentTime;
    const duration = isOpen ? 0.22 : 0.045;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(8500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  /**
   * Procedural FM Synth Lead for Step Sequencer & Melodies
   */
  public playFMLead(stepIndex: number, noteIndexOrFreq?: number): void {
    let freq = 440;
    if (typeof noteIndexOrFreq === "number") {
      if (noteIndexOrFreq < this.PENTATONIC_SCALE.length) {
        freq = this.PENTATONIC_SCALE[noteIndexOrFreq];
      } else {
        freq = noteIndexOrFreq;
      }
    } else {
      const idx = (stepIndex * 3) % this.PENTATONIC_SCALE.length;
      freq = this.PENTATONIC_SCALE[idx];
    }

    this.playFMBell(freq, 2.0, 2.8, 0.22, "triangle", 0.35);
  }

  // --- ITEM 5: CONTINUOUS AMBIENT BINAURAL DRONE PAD ---

  /**
   * Starts Continuous Ambient Binaural Drone Pad with Smooth Volume Enveloping
   * Detuned dual carrier (108 Hz Left, 114 Hz Right) generates a 6 Hz Theta binaural beat
   */
  public startAmbientDrone(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.droneGain || this.droneNodes !== null) return;

    const t = this.ctx.currentTime;

    // Master Drone Gain Node with 1.8s smooth linear fade-in
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, t);
    padGain.gain.exponentialRampToValueAtTime(this.droneVolume, t + 1.8);
    padGain.connect(this.droneGain);

    // Left Carrier: 108.0 Hz Sine Wave
    const leftOsc = this.ctx.createOscillator();
    leftOsc.type = "sine";
    leftOsc.frequency.setValueAtTime(108.0, t);

    // Right Carrier: 114.0 Hz Sine Wave (+6.0 Hz Theta Binaural Shift)
    const rightOsc = this.ctx.createOscillator();
    rightOsc.type = "sine";
    rightOsc.frequency.setValueAtTime(114.0, t);

    // Sub-Bass Atmosphere: 54.0 Hz Triangle Sub-Drone
    const subOsc = this.ctx.createOscillator();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(54.0, t);

    // Swept Lowpass Filter for Cosmic Atmosphere
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, t);

    // Slow LFO for Atmospheric Breathing (0.12 Hz sinusoidal sweep)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, t);
    lfoGain.gain.setValueAtTime(45, t); // Filter cutoff modulation depth +-45 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Signal Routing
    leftOsc.connect(filter);
    rightOsc.connect(filter);
    subOsc.connect(filter);

    filter.connect(padGain);

    leftOsc.start(t);
    rightOsc.start(t);
    subOsc.start(t);
    lfo.start(t);

    this.droneNodes = {
      leftOsc,
      rightOsc,
      subOsc,
      filter,
      lfo,
      lfoGain,
      gain: padGain,
    };
  }

  /**
   * Smoothly fades out and shuts down the Binaural Ambient Drone Pad
   */
  public stopAmbientDrone(): void {
    if (!this.droneNodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    const nodes = this.droneNodes;
    this.droneNodes = null;

    // Smooth 1.2s exponential fade-out to prevent audio pops/clicks
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
    nodes.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    setTimeout(() => {
      try {
        nodes.leftOsc.stop();
        nodes.rightOsc.stop();
        nodes.subOsc.stop();
        nodes.lfo.stop();
        nodes.leftOsc.disconnect();
        nodes.rightOsc.disconnect();
        nodes.subOsc.disconnect();
        nodes.lfo.disconnect();
        nodes.filter.disconnect();
        nodes.gain.disconnect();
      } catch {
        // Safe disposal
      }
    }, 1300);
  }

  public startAmbiance(): void {
    this.startAmbientDrone();
  }

  public stopAmbiance(): void {
    this.stopAmbientDrone();
  }

  // --- GENERAL GAMEPLAY SOUND EFFECTS ---

  public playLaunch(powerRatio: number = 0.5): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const baseFreq = 180 + powerRatio * 320;
    osc.frequency.setValueAtTime(baseFreq * 0.4, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.16);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);

    const hapticDuration = Math.min(50, 15 + Math.round(powerRatio * 35));
    this.triggerHaptic(hapticDuration);
  }

  public playShardCollect(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
    this.triggerHaptic(8);
  }

  public playOverdriveActivate(): void {
    this.init();
    this.resume();
    this.triggerHaptic([30, 20, 30, 20, 50]);
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.51);
  }

  public playDraftSelect(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 Major Triad
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.26);
    });
    this.triggerHaptic(15);
  }

  public playGameOver(): void {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [440, 392, 349.23, 293.66]; // Descending A-G-F-D
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
    this.triggerHaptic([35, 30, 45]);
  }
}

export const soundManager = new SoundEngine();
