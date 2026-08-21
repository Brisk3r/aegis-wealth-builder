"use client";

// 16-Step Procedural Synth Step Sequencer Workbench
// 100% Procedural Web Audio API Synthesis Engine
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

import React, { useState, useEffect, useRef, useCallback } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface StepSequencerProps {
  onClose: () => void;
}

type PresetType = "CYBERPUNK" | "DEEP_SPACE" | "HYPER_RUSH" | "COSMIC_NEBULA" | "SYNTHWAVE_DRIFT";

interface TrackConfig {
  id: string;
  name: string;
  shortLabel: string;
  color: string;
  defaultMuted: boolean;
}

const TRACKS: TrackConfig[] = [
  { id: "kick", name: "Sub Kick 808", shortLabel: "KICK-808", color: "#FF3366", defaultMuted: false },
  { id: "snare", name: "Cyber Snare", shortLabel: "SNARE-CYB", color: "#FF9900", defaultMuted: false },
  { id: "hihat", name: "Laser Hi-Hat", shortLabel: "HAT-LASER", color: "#00F0FF", defaultMuted: false },
  { id: "lead", name: "FM Lead Arp", shortLabel: "LEAD-FM", color: "#39FF14", defaultMuted: false },
];

const PRESETS: Record<PresetType, { bpm: number; grid: boolean[][]; leadPitches?: number[] }> = {
  CYBERPUNK: {
    bpm: 130,
    grid: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, false, true, false, false, true, false, true, true, false, true, false, false, true, true, false],
    ],
    leadPitches: [5, 7, 8, 10, 5, 8, 10, 12, 5, 7, 8, 10, 7, 10, 12, 14],
  },
  DEEP_SPACE: {
    bpm: 105,
    grid: [
      [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [true, false, false, true, true, false, true, false, false, true, true, false, true, false, false, true],
    ],
    leadPitches: [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 11, 9, 7, 4],
  },
  HYPER_RUSH: {
    bpm: 160,
    grid: [
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, true],
    ],
    leadPitches: [8, 10, 12, 10, 8, 12, 14, 12, 10, 12, 14, 15, 12, 14, 15, 15],
  },
  COSMIC_NEBULA: {
    bpm: 118,
    grid: [
      [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
      [false, false, false, false, true, false, false, true, false, false, false, false, true, false, true, false],
      [true, false, true, true, false, true, true, false, true, false, true, true, false, true, true, false],
      [false, true, false, true, true, false, true, false, false, true, false, true, true, false, true, true],
    ],
    leadPitches: [3, 5, 6, 8, 10, 8, 6, 5, 3, 6, 8, 10, 13, 10, 8, 6],
  },
  SYNTHWAVE_DRIFT: {
    bpm: 124,
    grid: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
      [true, false, false, true, false, true, false, false, true, false, false, true, false, true, true, false],
    ],
    leadPitches: [5, 8, 10, 12, 10, 8, 5, 7, 5, 8, 10, 12, 14, 12, 10, 8],
  },
};

export default function StepSequencerModal({ onClose }: StepSequencerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(128);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<PresetType>("CYBERPUNK");

  // Track Mute / Solo states
  const [mutedTracks, setMutedTracks] = useState<boolean[]>([false, false, false, false]);
  const [soloTracks, setSoloTracks] = useState<boolean[]>([false, false, false, false]);

  // 4 Tracks x 16 Steps Matrix
  const [grid, setGrid] = useState<boolean[][]>(PRESETS.CYBERPUNK.grid);
  const [leadPitches, setLeadPitches] = useState<number[]>(
    PRESETS.CYBERPUNK.leadPitches || [5, 7, 8, 10, 5, 8, 10, 12, 5, 7, 8, 10, 7, 10, 12, 14]
  );

  const stepRef = useRef<number>(0);

  // Check if any track is soloed
  const hasSolo = soloTracks.some(Boolean);

  const isTrackAudible = useCallback(
    (trackIdx: number) => {
      if (hasSolo) {
        return soloTracks[trackIdx];
      }
      return !mutedTracks[trackIdx];
    },
    [hasSolo, soloTracks, mutedTracks]
  );

  const toggleCell = (trackIdx: number, stepIdx: number) => {
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[trackIdx][stepIdx] = !copy[trackIdx][stepIdx];
      return copy;
    });

    // Preview sound on interaction
    soundManager.resume();
    if (trackIdx === 0) soundManager.playKick808(160, 38, 0.3, 0.6);
    else if (trackIdx === 1) soundManager.playSnare(0.6);
    else if (trackIdx === 2) soundManager.playHiHat(false);
    else if (trackIdx === 3) soundManager.playFMLead(stepIdx, leadPitches[stepIdx]);
  };

  const cycleLeadPitch = (stepIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeadPitches((prev) => {
      const copy = [...prev];
      copy[stepIdx] = (copy[stepIdx] + 1) % soundManager.PENTATONIC_SCALE.length;
      soundManager.playFMLead(stepIdx, copy[stepIdx]);
      return copy;
    });
  };

  const playStepSound = useCallback(
    (step: number) => {
      // Track 0: Kick 808
      if (grid[0][step] && isTrackAudible(0)) {
        soundManager.playKick808(165, 36, 0.4, 0.7);
      }
      // Track 1: Snare
      if (grid[1][step] && isTrackAudible(1)) {
        soundManager.playSnare(0.6);
      }
      // Track 2: Hi-Hat
      if (grid[2][step] && isTrackAudible(2)) {
        soundManager.playHiHat(step % 4 === 2);
      }
      // Track 3: FM Lead
      if (grid[3][step] && isTrackAudible(3)) {
        soundManager.playFMLead(step, leadPitches[step]);
      }
    },
    [grid, isTrackAudible, leadPitches]
  );

  useEffect(() => {
    if (!isPlaying) return;

    soundManager.resume();
    const intervalMs = (60 / bpm / 4) * 1000;
    const timer = setInterval(() => {
      const s = stepRef.current;
      playStepSound(s);
      setCurrentStep(s);
      stepRef.current = (s + 1) % 16;
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, bpm, playStepSound]);

  const handleTogglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) {
      soundManager.playOverdriveActivate();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    stepRef.current = 0;
    setCurrentStep(0);
  };

  const loadPreset = (presetName: PresetType) => {
    setActivePreset(presetName);
    const preset = PRESETS[presetName];
    setBpm(preset.bpm);
    setGrid(preset.grid);
    if (preset.leadPitches) {
      setLeadPitches(preset.leadPitches);
    }
    soundManager.playDraftSelect();
  };

  const toggleMute = (trackIdx: number) => {
    setMutedTracks((prev) => {
      const copy = [...prev];
      copy[trackIdx] = !copy[trackIdx];
      return copy;
    });
    soundManager.playBumperHit(trackIdx + 1, "STANDARD");
  };

  const toggleSolo = (trackIdx: number) => {
    setSoloTracks((prev) => {
      const copy = [...prev];
      copy[trackIdx] = !copy[trackIdx];
      return copy;
    });
    soundManager.playBumperHit(trackIdx + 2, "BOUNCE_SUPER");
  };

  const clearTrack = (trackIdx: number) => {
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[trackIdx] = Array(16).fill(false);
      return copy;
    });
    soundManager.playLaserDeflection(1400);
  };

  const randomizeTrack = (trackIdx: number) => {
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[trackIdx] = Array(16)
        .fill(false)
        .map(() => Math.random() > 0.6);
      return copy;
    });
    soundManager.playBumperHit(4, "GOLDEN_CORE");
  };

  const clearAllTracks = () => {
    setGrid([
      Array(16).fill(false),
      Array(16).fill(false),
      Array(16).fill(false),
      Array(16).fill(false),
    ]);
    soundManager.playLaserDeflection(1000);
  };

  const randomizeAll = () => {
    setGrid([
      Array(16)
        .fill(false)
        .map((_, i) => i % 4 === 0 || Math.random() > 0.75),
      Array(16)
        .fill(false)
        .map((_, i) => i % 8 === 4 || Math.random() > 0.8),
      Array(16)
        .fill(false)
        .map(() => Math.random() > 0.35),
      Array(16)
        .fill(false)
        .map(() => Math.random() > 0.5),
    ]);
    soundManager.playExplosion("SMALL");
  };

  const pentatonicNoteNames = [
    "C4",
    "D4",
    "E4",
    "G4",
    "A4",
    "C5",
    "D5",
    "E5",
    "G5",
    "A5",
    "C6",
    "D6",
    "E6",
    "G6",
    "A6",
    "C7",
  ];

  return (
    <div className={styles.modalBackdrop}>
      <div
        className={`${styles.techModalContainer} glass`}
        style={{ maxWidth: "980px", width: "96vw", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>PROCEDURAL AUDIO SYNTHESIS WORKBENCH</div>
            <h2 className={styles.modalTitle}>16-STEP SYNTH LOOP SEQUENCER</h2>
            <p className={styles.modalSubtitle}>
              4-Track Procedural Web Audio Engine -- FM Bell Modulator, Sub-Bass 808 &amp; Filter Sweeps
            </p>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn} title="Close Sequencer">
            [X]
          </button>
        </div>

        {/* Master Transport & Controls Bar */}
        <div
          className="glass"
          style={{
            padding: "0.85rem 1.1rem",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.85rem",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            background: "rgba(15, 23, 42, 0.75)",
          }}
        >
          {/* Transport buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexWrap: "wrap" }}>
            <button
              onClick={handleTogglePlay}
              className={styles.overdriveBtn}
              style={{
                padding: "0.6rem 1.25rem",
                margin: 0,
                fontSize: "0.85rem",
                fontWeight: 900,
                background: isPlaying
                  ? "#FF3366"
                  : "linear-gradient(135deg, #00F0FF, #39FF14)",
                boxShadow: isPlaying
                  ? "0 0 16px rgba(255, 51, 102, 0.6)"
                  : "0 0 16px rgba(0, 240, 255, 0.4)",
              }}
            >
              {isPlaying ? "[|| PAUSE]" : "[>] PLAY LOOP"}
            </button>

            <button
              onClick={handleStop}
              className={styles.deckNavBtn}
              style={{
                padding: "0.6rem 0.95rem",
                fontSize: "0.8rem",
                fontWeight: 800,
                background: "rgba(30, 41, 59, 0.9)",
                borderColor: "rgba(148, 163, 184, 0.4)",
              }}
            >
              [STOP]
            </button>

            {/* Tempo Slider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                marginLeft: "0.4rem",
                padding: "0.3rem 0.65rem",
                borderRadius: "8px",
                background: "rgba(2, 6, 23, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 800 }}>TEMPO:</span>
              <button
                onClick={() => setBpm((b) => Math.max(90, b - 2))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00F0FF",
                  fontWeight: 900,
                  cursor: "pointer",
                  padding: "0 3px",
                }}
              >
                [-]
              </button>
              <input
                type="range"
                min="90"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                style={{ width: "85px", accentColor: "#00F0FF", cursor: "pointer" }}
              />
              <button
                onClick={() => setBpm((b) => Math.min(180, b + 2))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00F0FF",
                  fontWeight: 900,
                  cursor: "pointer",
                  padding: "0 3px",
                }}
              >
                [+]
              </button>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 900,
                  color: "#00F0FF",
                  minWidth: "60px",
                  fontFamily: "monospace",
                }}
              >
                {bpm} BPM
              </span>
            </div>
          </div>

          {/* Presets Strip */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 800 }}>PRESETS:</span>
            {(
              [
                "CYBERPUNK",
                "DEEP_SPACE",
                "HYPER_RUSH",
                "COSMIC_NEBULA",
                "SYNTHWAVE_DRIFT",
              ] as PresetType[]
            ).map((preset) => (
              <button
                key={preset}
                onClick={() => loadPreset(preset)}
                className={styles.deckNavBtn}
                style={{
                  padding: "0.32rem 0.55rem",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  borderColor: activePreset === preset ? "#00F0FF" : "rgba(148, 163, 184, 0.25)",
                  background:
                    activePreset === preset
                      ? "rgba(0, 240, 255, 0.2)"
                      : "rgba(15, 23, 42, 0.7)",
                  color: activePreset === preset ? "#00F0FF" : "#CBD5E1",
                }}
              >
                {preset.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Master Utility Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={randomizeAll}
              className={styles.deckNavBtn}
              style={{
                padding: "0.32rem 0.65rem",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#39FF14",
                borderColor: "rgba(57, 255, 20, 0.4)",
              }}
              title="Randomize Matrix"
            >
              [RND ALL]
            </button>
            <button
              onClick={clearAllTracks}
              className={styles.deckNavBtn}
              style={{
                padding: "0.32rem 0.65rem",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#FF3366",
                borderColor: "rgba(255, 51, 102, 0.4)",
              }}
              title="Clear Matrix"
            >
              [CLR ALL]
            </button>
          </div>
        </div>

        {/* Step Indicator Header Ribbon (1 to 16) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.3rem 0.6rem",
            marginTop: "0.25rem",
          }}
        >
          <div style={{ width: "190px", fontSize: "0.7rem", fontWeight: 800, color: "#64748B" }}>
            TRACK / CHANNELS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(16, 1fr)",
              gap: "0.35rem",
              flex: 1,
            }}
          >
            {Array.from({ length: 16 }).map((_, idx) => {
              const isCurrent = isPlaying && currentStep === idx;
              const isBeatStart = idx % 4 === 0;
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: "center",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    fontFamily: "monospace",
                    color: isCurrent ? "#FFFFFF" : isBeatStart ? "#00F0FF" : "#64748B",
                    background: isCurrent ? "rgba(0, 240, 255, 0.4)" : "transparent",
                    borderRadius: "4px",
                    padding: "2px 0",
                    borderBottom: isCurrent
                      ? "2px solid #00F0FF"
                      : isBeatStart
                      ? "1px solid rgba(0, 240, 255, 0.3)"
                      : "none",
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Tracks Step Matrix Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {TRACKS.map((track, trackIdx) => {
            const isMuted = mutedTracks[trackIdx];
            const isSolo = soloTracks[trackIdx];
            const isAudible = isTrackAudible(trackIdx);

            return (
              <div
                key={track.id}
                className="glass"
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  border: isAudible
                    ? `1px solid ${track.color}44`
                    : "1px solid rgba(148, 163, 184, 0.15)",
                  background: isAudible ? "rgba(15, 23, 42, 0.8)" : "rgba(15, 23, 42, 0.4)",
                  opacity: isAudible ? 1 : 0.45,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Track Header & Controls */}
                <div
                  style={{
                    width: "190px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.4rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", minWidth: "95px" }}>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 900,
                        color: isAudible ? track.color : "#94A3B8",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {track.name}
                    </span>
                    <span style={{ fontSize: "0.62rem", color: "#64748B", fontFamily: "monospace" }}>
                      [{track.shortLabel}]
                    </span>
                  </div>

                  {/* Per-Track Actions: Mute, Solo, Random, Clear */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <button
                      onClick={() => toggleMute(trackIdx)}
                      style={{
                        padding: "0.2rem 0.35rem",
                        fontSize: "0.62rem",
                        fontWeight: 900,
                        borderRadius: "4px",
                        border: isMuted ? "1px solid #FF3366" : "1px solid rgba(148, 163, 184, 0.3)",
                        background: isMuted ? "#FF3366" : "rgba(30, 41, 59, 0.8)",
                        color: isMuted ? "#FFFFFF" : "#94A3B8",
                        cursor: "pointer",
                      }}
                      title="Mute Track"
                    >
                      M
                    </button>
                    <button
                      onClick={() => toggleSolo(trackIdx)}
                      style={{
                        padding: "0.2rem 0.35rem",
                        fontSize: "0.62rem",
                        fontWeight: 900,
                        borderRadius: "4px",
                        border: isSolo ? "1px solid #39FF14" : "1px solid rgba(148, 163, 184, 0.3)",
                        background: isSolo ? "#39FF14" : "rgba(30, 41, 59, 0.8)",
                        color: isSolo ? "#000000" : "#94A3B8",
                        cursor: "pointer",
                      }}
                      title="Solo Track"
                    >
                      S
                    </button>
                    <button
                      onClick={() => randomizeTrack(trackIdx)}
                      style={{
                        padding: "0.2rem 0.32rem",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        borderRadius: "4px",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        background: "rgba(30, 41, 59, 0.6)",
                        color: "#CBD5E1",
                        cursor: "pointer",
                      }}
                      title="Randomize Track"
                    >
                      R
                    </button>
                    <button
                      onClick={() => clearTrack(trackIdx)}
                      style={{
                        padding: "0.2rem 0.32rem",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        borderRadius: "4px",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        background: "rgba(30, 41, 59, 0.6)",
                        color: "#CBD5E1",
                        cursor: "pointer",
                      }}
                      title="Clear Track"
                    >
                      C
                    </button>
                  </div>
                </div>

                {/* 16 Step Buttons for This Track */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(16, 1fr)",
                    gap: "0.35rem",
                    flex: 1,
                  }}
                >
                  {grid[trackIdx].map((active, stepIdx) => {
                    const isCurrent = isPlaying && currentStep === stepIdx;
                    const isBeatBlock = Math.floor(stepIdx / 4) % 2 === 1;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleCell(trackIdx, stepIdx)}
                        style={{
                          height: "38px",
                          borderRadius: "6px",
                          border: isCurrent
                            ? "2px solid #FFFFFF"
                            : active
                            ? `1px solid ${track.color}`
                            : isBeatBlock
                            ? "1px solid rgba(148, 163, 184, 0.2)"
                            : "1px solid rgba(148, 163, 184, 0.12)",
                          background: active
                            ? isCurrent
                              ? "#FFFFFF"
                              : track.color
                            : isCurrent
                            ? "rgba(255, 255, 255, 0.18)"
                            : isBeatBlock
                            ? "rgba(30, 41, 59, 0.45)"
                            : "rgba(15, 23, 42, 0.65)",
                          boxShadow: active
                            ? `0 0 10px ${track.color}88, inset 0 0 4px rgba(255,255,255,0.4)`
                            : "none",
                          cursor: "pointer",
                          transition: "all 0.08s ease",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        {/* Note badge for FM Lead track */}
                        {trackIdx === 3 && active && (
                          <span
                            onClick={(e) => cycleLeadPitch(stepIdx, e)}
                            style={{
                              fontSize: "0.58rem",
                              fontWeight: 900,
                              fontFamily: "monospace",
                              color: isCurrent ? "#000000" : "#020617",
                              background: "rgba(255, 255, 255, 0.8)",
                              padding: "1px 3px",
                              borderRadius: "3px",
                              lineHeight: 1,
                            }}
                            title={`Pitch: ${pentatonicNoteNames[leadPitches[stepIdx]]} (Click to cycle)`}
                          >
                            {pentatonicNoteNames[leadPitches[stepIdx]]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Debrief and Tips */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.8rem",
            marginTop: "1.1rem",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            background: "rgba(2, 6, 23, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
            <strong style={{ color: "#00F0FF" }}>[TIP]</strong> Click lead note badges to cycle
            pentatonic pitch (C4 - C7). M = Mute, S = Solo, R = Randomize, C = Clear.
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn} style={{ padding: "0.5rem 1.4rem" }}>
            [DONE / CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
