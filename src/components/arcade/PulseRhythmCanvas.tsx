"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import { ParticleSystem } from "@/lib/gameEngine/particles";
import styles from "./KineticGame.module.css";

interface PulseRhythmProps {
  onScoreUpdate: (score: number) => void;
  onShardsCollected: (shards: number) => void;
  onGameOver: (finalScore: number, maxCombo: number) => void;
}

interface NotePulse {
  id: string;
  lane: number; // 0, 1, 2, 3
  targetTime: number; // exact target time in seconds
  hit: boolean;
  missed: boolean;
}

export default function PulseRhythmCanvas({
  onScoreUpdate,
  onShardsCollected,
  onGameOver,
}: PulseRhythmProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem());
  const [latencyOffsetMs, setLatencyOffsetMs] = useState<number>(0);

  const stateRef = useRef<{
    width: number;
    height: number;
    notes: NotePulse[];
    score: number;
    combo: number;
    maxCombo: number;
    hp: number;
    shards: number;
    bpm: number;
    beatInterval: number;
    approachTime: number;
    startTime: number;
    nextSpawnTime: number;
    latencyOffsetMs: number;
    isDead: boolean;
  }>({
    width: 600,
    height: 520,
    notes: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    hp: 100,
    shards: 0,
    bpm: 135,
    beatInterval: 60 / 135,
    approachTime: 1.6,
    startTime: 0,
    nextSpawnTime: 1.6,
    latencyOffsetMs: 0,
    isDead: false,
  });

  const laneKeys = ["D", "F", "J", "K"];
  const laneColors = ["#00F0FF", "#39FF14", "#FF9900", "#FF3366"];

  const handleHitLane = useCallback((laneIndex: number) => {
    const s = stateRef.current;
    if (s.isDead) return;

    soundManager.init();
    const currentAudioTime = (performance.now() * 0.001) - s.startTime;
    const effectiveTime = currentAudioTime - (s.latencyOffsetMs / 1000);
    const judgmentY = s.height - 70;
    const hitWindowSeconds = 0.135; // ~135ms judgment window

    // Find closest unhit note in this lane
    const eligible = s.notes.filter((n) => n.lane === laneIndex && !n.hit && !n.missed);
    let bestNote: NotePulse | null = null;
    let minDiff = 999;

    eligible.forEach((n) => {
      const diff = Math.abs(n.targetTime - effectiveTime);
      if (diff < minDiff && diff < hitWindowSeconds) {
        minDiff = diff;
        bestNote = n;
      }
    });

    const laneWidth = s.width / 4;
    const hitX = laneIndex * laneWidth + laneWidth * 0.5;

    if (bestNote) {
      (bestNote as NotePulse).hit = true;
      s.combo++;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;

      const isPerfect = minDiff < 0.055; // 55ms for Perfect
      // Combo multiplier scaling
      const comboMultiplier = s.combo >= 50 ? 4.0 : s.combo >= 30 ? 3.0 : s.combo >= 20 ? 2.5 : s.combo >= 10 ? 1.5 : 1.0;
      const basePts = isPerfect ? 300 : 150;
      const pts = Math.round(basePts * comboMultiplier);

      s.score += pts;
      s.shards += isPerfect ? 2 : 1;
      if (isPerfect) s.hp = Math.min(100, s.hp + 2); // Perfect streak health recovery

      onScoreUpdate(s.score);
      onShardsCollected(isPerfect ? 2 : 1);

      soundManager.playBumperHit(s.combo, isPerfect ? "GOLDEN_CORE" : "STANDARD");
      particleSystem.current.emitSparks(hitX, judgmentY, laneColors[laneIndex], 12, 4);
      particleSystem.current.emitShockwave(hitX, judgmentY, laneColors[laneIndex], 50);
      particleSystem.current.emitFloatingText(
        hitX,
        judgmentY,
        isPerfect ? `PERFECT! +${pts} (${comboMultiplier}x)` : `GREAT! +${pts} (${comboMultiplier}x)`,
        laneColors[laneIndex]
      );
    } else {
      // Miss strike
      s.combo = 0;
      s.hp = Math.max(0, s.hp - 8);
      particleSystem.current.emitFloatingText(hitX, judgmentY, "MISS!", "#FF3366");

      if (s.hp <= 0) {
        s.isDead = true;
        soundManager.playGameOver();
        onGameOver(s.score, s.maxCombo);
      }
    }
  }, [laneColors, onScoreUpdate, onShardsCollected, onGameOver]);

  // Keyboard controls listener (D, F, J, K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const idx = laneKeys.indexOf(key);
      if (idx >= 0) {
        e.preventDefault();
        handleHitLane(idx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleHitLane]);

  // Resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2.0);
      const width = Math.floor(rect.width);
      const height = 520;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      stateRef.current.width = width;
      stateRef.current.height = height;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Main Rhythm Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    stateRef.current.startTime = performance.now() * 0.001;
    stateRef.current.nextSpawnTime = (performance.now() * 0.001) - stateRef.current.startTime + 1.2;

    const rhythmLoop = () => {
      const s = stateRef.current;
      const width = s.width;
      const height = s.height;
      const laneWidth = width / 4;
      const judgmentY = height - 70;
      const currentAudioTime = (performance.now() * 0.001) - s.startTime;
      const effectiveTime = currentAudioTime - (s.latencyOffsetMs / 1000);

      if (!s.isDead) {
        // Deterministic BPM Note Scheduler
        while (s.nextSpawnTime < effectiveTime + s.approachTime + 0.8) {
          const randomLane = Math.floor(Math.random() * 4);
          s.notes.push({
            id: `note_${Date.now()}_${Math.random()}`,
            lane: randomLane,
            targetTime: s.nextSpawnTime,
            hit: false,
            missed: false,
          });

          // 20% chance for dual chord note on another lane
          if (Math.random() < 0.2) {
            let chordLane = (randomLane + Math.floor(Math.random() * 3) + 1) % 4;
            s.notes.push({
              id: `chord_${Date.now()}_${Math.random()}`,
              lane: chordLane,
              targetTime: s.nextSpawnTime,
              hit: false,
              missed: false,
            });
          }

          // Advance to next beat subdivision
          const isEighthNote = Math.random() < 0.35;
          s.nextSpawnTime += s.beatInterval * (isEighthNote ? 0.5 : 1.0);
        }

        // Update Notes position locked directly to Audio Clock
        for (let i = s.notes.length - 1; i >= 0; i--) {
          const n = s.notes[i];
          const timeToHit = n.targetTime - effectiveTime;
          const y = judgmentY - (timeToHit / s.approachTime) * judgmentY;

          // Note missed threshold (~150ms after target time)
          if (timeToHit < -0.15 && !n.hit && !n.missed) {
            n.missed = true;
            s.combo = 0;
            s.hp = Math.max(0, s.hp - 10);
            particleSystem.current.emitFloatingText(
              n.lane * laneWidth + laneWidth * 0.5,
              judgmentY,
              "MISS!",
              "#FF3366"
            );

            if (s.hp <= 0) {
              s.isDead = true;
              soundManager.playGameOver();
              onGameOver(s.score, s.maxCombo);
            }
          }

          if (y > height + 40 || timeToHit < -0.5) {
            s.notes.splice(i, 1);
          }
        }

        particleSystem.current.update();
      }

      // Render Frame
      ctx.save();
      const shake = particleSystem.current.getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Background
      ctx.fillStyle = "#040714";
      ctx.fillRect(0, 0, width, height);

      // 4 Neon Lanes Dividers
      for (let i = 0; i < 4; i++) {
        const lx = i * laneWidth;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();

        // Lane Key labels at bottom
        ctx.fillStyle = laneColors[i];
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`[${laneKeys[i]}]`, lx + laneWidth * 0.5, height - 20);
      }

      // Judgment Strike Bar
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, judgmentY);
      ctx.lineTo(width, judgmentY);
      ctx.stroke();

      // Render Falling Notes
      s.notes.forEach((n) => {
        if (n.hit) return;
        const timeToHit = n.targetTime - effectiveTime;
        const noteY = judgmentY - (timeToHit / s.approachTime) * judgmentY;
        const nx = n.lane * laneWidth + laneWidth * 0.15;
        const nw = laneWidth * 0.7;
        const color = laneColors[n.lane];

        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(nx, noteY - 8, nw, 16, 6);
        ctx.fill();
        ctx.restore();
      });

      // Render Particles
      particleSystem.current.render(ctx);

      ctx.restore();
      animFrameId.current = requestAnimationFrame(rhythmLoop);
    };

    animFrameId.current = requestAnimationFrame(rhythmLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [laneColors, onGameOver]);

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.gameCanvas} />

      {/* Latency Calibration Bar */}
      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "0.4rem", zIndex: 10, background: "rgba(15,23,42,0.85)", padding: "0.25rem 0.5rem", borderRadius: "6px", border: "1px solid rgba(0,240,255,0.3)" }}>
        <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>OFFSET: {latencyOffsetMs > 0 ? `+${latencyOffsetMs}` : latencyOffsetMs}ms</span>
        <button
          onClick={() => {
            const next = Math.max(-150, latencyOffsetMs - 10);
            setLatencyOffsetMs(next);
            stateRef.current.latencyOffsetMs = next;
          }}
          className={styles.deckNavBtn}
          style={{ padding: "0.15rem 0.4rem", fontSize: "0.68rem" }}
        >
          -10ms
        </button>
        <button
          onClick={() => {
            const next = Math.min(150, latencyOffsetMs + 10);
            setLatencyOffsetMs(next);
            stateRef.current.latencyOffsetMs = next;
          }}
          className={styles.deckNavBtn}
          style={{ padding: "0.15rem 0.4rem", fontSize: "0.68rem" }}
        >
          +10ms
        </button>
      </div>

      {/* Mobile Touch Pads */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", position: "absolute", bottom: "10px", left: "10px", right: "10px", pointerEvents: "auto" }}>
        {laneKeys.map((key, idx) => (
          <button
            key={key}
            onClick={() => handleHitLane(idx)}
            className={styles.deckNavBtn}
            style={{ padding: "0.75rem", fontSize: "0.9rem", color: laneColors[idx], borderColor: laneColors[idx] }}
          >
            [{key}]
          </button>
        ))}
      </div>
    </div>
  );
}
