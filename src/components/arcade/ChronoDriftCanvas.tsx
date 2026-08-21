"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  DriftCarState,
  GhostTelemetryFrame,
  TrackCircuit,
  CheckpointGate,
  BoostPad,
  BoostTier,
  SkidmarkSegment,
  TireParticle,
  ChronoDriftTelemetry,
  ChronoDriftCanvasProps,
  RaceStatus,
  ChronoGameState,
} from "@/lib/gameEngine/chronoDrift/types";
import {
  NEON_APEX_CIRCUIT,
  generateBenchmarkGhost,
} from "@/lib/gameEngine/chronoDrift/trackData";
import {
  stepDriftPhysics,
  ControlInputs,
  PhysicsStepResult,
} from "@/lib/gameEngine/chronoDrift/driftPhysics";
import { DriftAudioEngine } from "@/lib/gameEngine/chronoDrift/driftAudio";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import styles from "./KineticGame.module.css";

const STORAGE_BEST_LAP = "aegis_chrono_best_lap";
const STORAGE_BEST_RACE = "aegis_chrono_best_race";
const STORAGE_PEAK_DRIFT = "aegis_chrono_peak_drift";
const STORAGE_GHOST = "aegis_chrono_ghost_track_1";

export default function ChronoDriftCanvas({
  onScoreUpdate,
  onShardsCollected,
  onGameOver,
  onLapComplete,
  onRaceFinish,
  onShardsEarned,
  shipColor = "#00F0FF",
  carColor,
  trailColor = "#00F0FF",
  trackId = "neon_apex",
}: ChronoDriftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioEngine = useRef<DriftAudioEngine>(new DriftAudioEngine());

  // React state for HUD / Modals
  const [raceStatus, setRaceStatus] = useState<RaceStatus>("COUNTDOWN");
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [hudTelemetry, setHudTelemetry] = useState<{
    lap: number;
    totalLaps: number;
    lapTimeMs: number;
    bestLapMs: number;
    totalTimeMs: number;
    speedKmh: number;
    driftScore: number;
    boostTier: BoostTier;
    boostCharge: number;
    deltaTimeMs: number | null;
    shards: number;
  }>({
    lap: 1,
    totalLaps: 3,
    lapTimeMs: 0,
    bestLapMs: 0,
    totalTimeMs: 0,
    speedKmh: 0,
    driftScore: 0,
    boostTier: 0,
    boostCharge: 0,
    deltaTimeMs: null,
    shards: 0,
  });

  const [raceResult, setRaceResult] = useState<{
    totalTimeMs: number;
    bestLapMs: number;
    driftScore: number;
    shardsEarned: number;
    isNewRecord: boolean;
  } | null>(null);

  // Active vessel customization from ProgressionManager
  const vesselRef = useRef<{
    speedMult: number;
    mass: number;
    bounceMult: number;
    color: string;
    trailColor: string;
  }>({
    speedMult: 1.0,
    mass: 1.0,
    bounceMult: 1.0,
    color: carColor || shipColor || "#00F0FF",
    trailColor: trailColor || "#00F0FF",
  });

  // Touch control state
  const touchInputs = useRef<{
    steerLeft: boolean;
    steerRight: boolean;
    gas: boolean;
    brake: boolean;
    drift: boolean;
  }>({
    steerLeft: false,
    steerRight: false,
    gas: false,
    brake: false,
    drift: false,
  });

  // Mutable Game Loop State Ref (Zero React Thrashing at 60 FPS)
  const gameStateRef = useRef<ChronoGameState & { inputs: ControlInputs }>({
    width: 800,
    height: 600,
    cameraX: NEON_APEX_CIRCUIT.startX,
    cameraY: NEON_APEX_CIRCUIT.startY,
    cameraTargetX: NEON_APEX_CIRCUIT.startX,
    cameraTargetY: NEON_APEX_CIRCUIT.startY,
    cameraZoom: 1.0,
    car: {
      x: NEON_APEX_CIRCUIT.startX,
      y: NEON_APEX_CIRCUIT.startY,
      vx: 0,
      vy: 0,
      angle: NEON_APEX_CIRCUIT.startAngle,
      angularVelocity: 0,
      speed: 0,
      vLong: 0,
      vLat: 0,
      slipAngle: 0,
      isDrifting: false,
      driftCharge: 0,
      boostTier: 0,
      boostTimer: 0,
      boostMultiplier: 1.0,
      isOffRoad: false,
      color: carColor || shipColor || "#00F0FF",
      trailColor: trailColor || "#00F0FF",
    },
    inputs: {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: false,
      boostTrigger: false,
    },
    circuit: NEON_APEX_CIRCUIT,
    raceStatus: "COUNTDOWN",
    countdownTimer: 3.2,
    currentLap: 1,
    totalLaps: 3,
    lapStartTime: 0,
    raceStartTime: 0,
    currentLapElapsedMs: 0,
    totalRaceElapsedMs: 0,
    bestLapMs: 0,
    bestRaceMs: 0,
    expectedCheckpointIdx: 1,
    lastCheckpointTimeMs: 0,
    sectorSplitTimes: [],
    bestSectorSplits: [],
    lastDeltaTimeMs: null,
    driftScore: 0,
    driftCombo: 1.0,
    shardsEarned: 0,
    currentGhostBuffer: [],
    bestGhostBuffer: [],
    particles: [],
    skidmarks: [],
    screenShake: 0,
    lastFrameTime: 0,
  });

  // Load persistence records on mount
  useEffect(() => {
    try {
      const v = ProgressionManager.getActiveVessel();
      if (v) {
        vesselRef.current = {
          speedMult: v.speedMultiplier || 1.0,
          mass: v.mass || 1.0,
          bounceMult: v.bounceMultiplier || 1.0,
          color: carColor || v.color || shipColor || "#00F0FF",
          trailColor: trailColor || v.trailColor || "#00F0FF",
        };
        gameStateRef.current.car.color = vesselRef.current.color;
        gameStateRef.current.car.trailColor = vesselRef.current.trailColor;
      }
    } catch {}

    try {
      const savedBestLap = localStorage.getItem(STORAGE_BEST_LAP);
      if (savedBestLap) {
        gameStateRef.current.bestLapMs = parseInt(savedBestLap, 10) || 0;
      }
      const savedBestRace = localStorage.getItem(STORAGE_BEST_RACE);
      if (savedBestRace) {
        gameStateRef.current.bestRaceMs = parseInt(savedBestRace, 10) || 0;
      }
      const savedGhost = localStorage.getItem(STORAGE_GHOST);
      if (savedGhost) {
        gameStateRef.current.bestGhostBuffer = JSON.parse(savedGhost);
      } else {
        // Fallback to baseline benchmark ghost
        gameStateRef.current.bestGhostBuffer = generateBenchmarkGhost(NEON_APEX_CIRCUIT);
      }
    } catch {}

    audioEngine.current.init();

    return () => {
      audioEngine.current.destroy();
    };
  }, [carColor, shipColor, trailColor]);

  // Restart / Reset Race Handler
  const handleResetRace = useCallback(() => {
    const s = gameStateRef.current;
    const c = s.circuit;

    s.car = {
      x: c.startX,
      y: c.startY,
      vx: 0,
      vy: 0,
      angle: c.startAngle,
      angularVelocity: 0,
      speed: 0,
      vLong: 0,
      vLat: 0,
      slipAngle: 0,
      isDrifting: false,
      driftCharge: 0,
      boostTier: 0,
      boostTimer: 0,
      boostMultiplier: 1.0,
      isOffRoad: false,
      color: vesselRef.current.color,
      trailColor: vesselRef.current.trailColor,
    };

    s.cameraX = c.startX;
    s.cameraY = c.startY;
    s.cameraTargetX = c.startX;
    s.cameraTargetY = c.startY;
    s.raceStatus = "COUNTDOWN";
    s.countdownTimer = 3.2;
    s.currentLap = 1;
    s.lapStartTime = 0;
    s.raceStartTime = 0;
    s.currentLapElapsedMs = 0;
    s.totalRaceElapsedMs = 0;
    s.expectedCheckpointIdx = 1;
    s.lastCheckpointTimeMs = 0;
    s.sectorSplitTimes = [];
    s.lastDeltaTimeMs = null;
    s.driftScore = 0;
    s.driftCombo = 1.0;
    s.shardsEarned = 0;
    s.currentGhostBuffer = [];
    s.particles = [];
    s.skidmarks = [];
    s.screenShake = 0;

    setRaceResult(null);
    setRaceStatus("COUNTDOWN");
    setCountdownNum(3);
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const keysPressed: { [key: string]: boolean } = {};

    const updateInputsFromKeys = (keys: { [key: string]: boolean }) => {
      const s = gameStateRef.current;
      const t = touchInputs.current;

      const up = keys["ArrowUp"] || keys["KeyW"] || t.gas;
      const down = keys["ArrowDown"] || keys["KeyS"] || t.brake;
      const left = keys["ArrowLeft"] || keys["KeyA"] || t.steerLeft;
      const right = keys["ArrowRight"] || keys["KeyD"] || t.steerRight;
      const space = keys["Space"] || keys["KeyE"] || keys["ShiftLeft"] || t.drift;

      s.inputs.throttle = up ? 1.0 : 0.0;
      s.inputs.brake = down ? 1.0 : 0.0;
      s.inputs.steer = left ? -1.0 : right ? 1.0 : 0.0;
      s.inputs.handbrake = Boolean(space);
      s.inputs.boostTrigger = Boolean(space);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      audioEngine.current.resume();
      keysPressed[e.code] = true;

      if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        const s = gameStateRef.current;
        if (s.raceStatus === "RACING") {
          s.raceStatus = "PAUSED";
          setRaceStatus("PAUSED");
        } else if (s.raceStatus === "PAUSED") {
          s.raceStatus = "RACING";
          setRaceStatus("RACING");
        }
      }

      if (e.code === "KeyR") {
        e.preventDefault();
        handleResetRace();
      }

      if (e.code === "KeyM") {
        e.preventDefault();
        setIsAudioMuted((prev) => {
          const next = !prev;
          audioEngine.current.setMuted(next);
          return next;
        });
      }

      updateInputsFromKeys(keysPressed);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
      updateInputsFromKeys(keysPressed);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleResetRace]);

  // Dynamic Resize Handler with DPR Scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2.0);
      const width = Math.floor(rect.width) || 800;
      const height = Math.min(640, Math.max(480, Math.floor(window.innerHeight * 0.65)));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      gameStateRef.current.width = width;
      gameStateRef.current.height = height;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      const s = gameStateRef.current;
      if (!s.lastFrameTime) s.lastFrameTime = timestamp;
      const dt = Math.min((timestamp - s.lastFrameTime) / 1000, 0.05);
      s.lastFrameTime = timestamp;

      // 1. Race State & Countdown
      if (s.raceStatus === "COUNTDOWN") {
        s.countdownTimer -= dt;
        const currentCount = Math.ceil(s.countdownTimer);
        setCountdownNum(Math.max(0, currentCount));

        if (s.countdownTimer <= 0) {
          s.raceStatus = "RACING";
          s.raceStartTime = timestamp;
          s.lapStartTime = timestamp;
          setRaceStatus("RACING");
          audioEngine.current.playTurboDischarge(1);
        }
      }

      if (s.raceStatus === "RACING") {
        s.currentLapElapsedMs = Math.round(timestamp - s.lapStartTime);
        s.totalRaceElapsedMs = Math.round(timestamp - s.raceStartTime);

        // Record ghost telemetry frame
        s.currentGhostBuffer.push({
          t: s.currentLapElapsedMs,
          x: Math.round(s.car.x * 10) / 10,
          y: Math.round(s.car.y * 10) / 10,
          rot: Math.round(s.car.angle * 100) / 100,
          spd: Math.round(s.car.speed),
          drf: s.car.isDrifting,
          bst: s.car.boostTier,
        });

        if (s.currentGhostBuffer.length > 36000) {
          s.currentGhostBuffer.shift();
        }
      }

      // 2. Physics Step & Drift Dynamics
      if (s.raceStatus === "RACING" || s.raceStatus === "COUNTDOWN") {
        const stepInputs: ControlInputs =
          s.raceStatus === "COUNTDOWN"
            ? { throttle: 0, brake: 0, steer: 0, handbrake: false, boostTrigger: false }
            : s.inputs;

        const result: PhysicsStepResult = stepDriftPhysics(
          s.car,
          stepInputs,
          s.circuit,
          dt,
          vesselRef.current,
          s.expectedCheckpointIdx
        );

        s.car = result.car;

        // Audio & FX Updates
        audioEngine.current.updatePhysicsAudio(
          s.car.speed,
          480 * vesselRef.current.speedMult,
          s.inputs.throttle,
          s.car.slipAngle,
          s.car.isDrifting,
          s.car.boostTimer
        );

        if (result.boostDischargedTier > 0) {
          audioEngine.current.playTurboDischarge(result.boostDischargedTier);
          s.screenShake = Math.max(s.screenShake, 8);
        }

        if (result.boostPadTriggered) {
          audioEngine.current.playBoostPadWhoosh();
          s.screenShake = Math.max(s.screenShake, 12);
        }

        if (result.wallCollided) {
          audioEngine.current.playWallHit();
          s.screenShake = Math.max(s.screenShake, 16);
        }

        // Particle Emitter Updates
        if (result.particles.length > 0) {
          result.particles.forEach((p: { x: number; y: number; vx: number; vy: number; color: string; type: "SMOKE" | "SPARK" | "FIRE" | "PLASMA" }) => {
            s.particles.push({
              x: p.x,
              y: p.y,
              vx: p.vx,
              vy: p.vy,
              radius: p.type === "SMOKE" ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
              maxLife: p.type === "SMOKE" ? 0.6 : 0.35,
              life: p.type === "SMOKE" ? 0.6 : 0.35,
              color: p.color,
              alpha: 0.8,
              type: p.type,
            });
          });
        }

        // Skidmark Segment Generation
        if (result.skidEmitted) {
          const cosA = Math.cos(s.car.angle);
          const sinA = Math.sin(s.car.angle);
          const uFx = cosA;
          const uFy = sinA;
          const uRx = -sinA;
          const uRy = cosA;

          const rlX = s.car.x - uFx * 18 - uRx * 11;
          const rlY = s.car.y - uFy * 18 - uRy * 11;
          const rrX = s.car.x - uFx * 18 + uRx * 11;
          const rrY = s.car.y - uFy * 18 + uRy * 11;

          s.skidmarks.push({
            x1: rlX,
            y1: rlY,
            x2: rrX,
            y2: rrY,
            alpha: result.skidAlpha,
            color: s.car.boostTier === 3 ? "#BF00FF" : s.car.boostTier === 2 ? "#FF9900" : "#1E293B",
          });

          if (s.skidmarks.length > 1200) {
            s.skidmarks.splice(0, 100);
          }
        }

        // Drift Score & Shard Tally
        if (result.driftPointsGained > 0) {
          s.driftScore += result.driftPointsGained;
          s.driftCombo = Math.min(4.0, s.driftCombo + dt * 0.3);

          if (s.driftScore % 500 < result.driftPointsGained) {
            s.shardsEarned += 10;
            if (onShardsCollected) onShardsCollected(10);
            if (onShardsEarned) onShardsEarned(10);
          }

          if (onScoreUpdate) onScoreUpdate(s.driftScore);
        } else if (!s.car.isDrifting) {
          s.driftCombo = Math.max(1.0, s.driftCombo - dt * 0.8);
        }

        // 3. Checkpoint Gate & Lap Progression
        if (result.gateCrossed && s.raceStatus === "RACING") {
          const totalGates = s.circuit.checkpoints.length;
          const crossedIdx = result.gateCrossed.index;

          if (crossedIdx === s.expectedCheckpointIdx) {
            audioEngine.current.playCheckpointDing();

            const gateTime = s.currentLapElapsedMs;
            s.sectorSplitTimes.push(gateTime);

            if (s.bestSectorSplits[crossedIdx]) {
              s.lastDeltaTimeMs = gateTime - s.bestSectorSplits[crossedIdx];
            }

            s.expectedCheckpointIdx = (s.expectedCheckpointIdx + 1) % totalGates;

            // Finish Line Crossing
            if (crossedIdx === 0) {
              const lapTime = s.currentLapElapsedMs;
              const isBestLap = s.bestLapMs === 0 || lapTime < s.bestLapMs;

              if (isBestLap) {
                s.bestLapMs = lapTime;
                s.bestSectorSplits = [...s.sectorSplitTimes];
                s.bestGhostBuffer = [...s.currentGhostBuffer];
                try {
                  localStorage.setItem(STORAGE_BEST_LAP, lapTime.toString());
                  localStorage.setItem(STORAGE_GHOST, JSON.stringify(s.bestGhostBuffer));
                } catch {}
              }

              audioEngine.current.playLapFanfare();
              if (onLapComplete) onLapComplete(lapTime, isBestLap);

              if (s.currentLap >= s.totalLaps) {
                s.raceStatus = "FINISHED";
                setRaceStatus("FINISHED");
                audioEngine.current.playRaceVictoryFanfare();

                const totalTime = s.totalRaceElapsedMs;
                const isNewRaceRecord = s.bestRaceMs === 0 || totalTime < s.bestRaceMs;
                if (isNewRaceRecord) {
                  s.bestRaceMs = totalTime;
                  try {
                    localStorage.setItem(STORAGE_BEST_RACE, totalTime.toString());
                    localStorage.setItem(STORAGE_PEAK_DRIFT, s.driftScore.toString());
                  } catch {}
                }

                const bonusShards = 50 + Math.round(s.driftScore / 100);
                s.shardsEarned += bonusShards;
                ProgressionManager.addQuantumShards(bonusShards);
                ProgressionManager.addSeasonPassXp(250);

                if (onGameOver) onGameOver(totalTime, s.bestLapMs, s.shardsEarned);
                if (onRaceFinish) onRaceFinish(totalTime, s.bestLapMs, s.driftScore);

                setRaceResult({
                  totalTimeMs: totalTime,
                  bestLapMs: s.bestLapMs,
                  driftScore: s.driftScore,
                  shardsEarned: s.shardsEarned,
                  isNewRecord: isNewRaceRecord,
                });
              } else {
                s.currentLap += 1;
                s.lapStartTime = timestamp;
                s.currentGhostBuffer = [];
                s.sectorSplitTimes = [];
              }
            }
          }
        }
      }

      // 4. Camera Tracking & Screen Shake
      const lookaheadDist = Math.min(100, s.car.speed * 0.25);
      const targetCamX = s.car.x + Math.cos(s.car.angle) * lookaheadDist;
      const targetCamY = s.car.y + Math.sin(s.car.angle) * lookaheadDist;

      s.cameraX += (targetCamX - s.cameraX) * Math.min(1.0, dt * 8.0);
      s.cameraY += (targetCamY - s.cameraY) * Math.min(1.0, dt * 8.0);

      let shakeX = 0;
      let shakeY = 0;
      if (s.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * s.screenShake;
        shakeY = (Math.random() - 0.5) * s.screenShake;
        s.screenShake = Math.max(0, s.screenShake - dt * 25.0);
      }

      // 5. Canvas 2D Rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = s.width;
          const h = s.height;

          ctx.save();
          ctx.fillStyle = "#070B19";
          ctx.fillRect(0, 0, w, h);

          // World Transform
          ctx.save();
          ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
          ctx.translate(-s.cameraX, -s.cameraY);

          drawCyberGrid(ctx, s.circuit.bounds);
          drawTrackSurface(ctx, s.circuit);
          drawSkidmarks(ctx, s.skidmarks);
          drawBoostPads(ctx, s.circuit.boostPads, timestamp);
          drawCheckpoints(ctx, s.circuit.checkpoints, s.expectedCheckpointIdx, timestamp);

          if (s.bestGhostBuffer.length > 0 && s.raceStatus === "RACING") {
            drawGhostCar(ctx, s.bestGhostBuffer, s.currentLapElapsedMs);
          }

          drawPlayerCar(ctx, s.car, timestamp);
          drawParticles(ctx, s.particles, dt);

          ctx.restore(); // Restore Camera

          // Screen-space HUD
          drawHUD(ctx, w, h, s);

          ctx.restore();
        }
      }

      if (timestamp % 5 < 1) {
        setHudTelemetry({
          lap: s.currentLap,
          totalLaps: s.totalLaps,
          lapTimeMs: s.currentLapElapsedMs,
          bestLapMs: s.bestLapMs,
          totalTimeMs: s.totalRaceElapsedMs,
          speedKmh: Math.round(s.car.speed * 0.65),
          driftScore: s.driftScore,
          boostTier: s.car.boostTier,
          boostCharge: s.car.driftCharge,
          deltaTimeMs: s.lastDeltaTimeMs,
          shards: s.shardsEarned,
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onGameOver, onLapComplete, onRaceFinish, onScoreUpdate, onShardsCollected, onShardsEarned]);

  // Touch control trigger helpers
  const handleTouchSteer = (dir: "LEFT" | "RIGHT", active: boolean) => {
    audioEngine.current.resume();
    if (dir === "LEFT") touchInputs.current.steerLeft = active;
    if (dir === "RIGHT") touchInputs.current.steerRight = active;
    const t = touchInputs.current;
    gameStateRef.current.inputs.steer = t.steerLeft ? -1.0 : t.steerRight ? 1.0 : 0.0;
  };

  const handleTouchThrottle = (active: boolean) => {
    audioEngine.current.resume();
    touchInputs.current.gas = active;
    gameStateRef.current.inputs.throttle = active ? 1.0 : 0.0;
  };

  const handleTouchBrake = (active: boolean) => {
    audioEngine.current.resume();
    touchInputs.current.brake = active;
    gameStateRef.current.inputs.brake = active ? 1.0 : 0.0;
  };

  const handleTouchDrift = (active: boolean) => {
    audioEngine.current.resume();
    touchInputs.current.drift = active;
    gameStateRef.current.inputs.handbrake = active;
    gameStateRef.current.inputs.boostTrigger = active;
  };

  return (
    <div className={styles.gameSuiteContainer}>
      {/* Top HUD Telemetry Ribbon */}
      <div
        className={`${styles.hudRibbon} glass`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.75rem",
          padding: "0.75rem 1.25rem",
        }}
      >
        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>LAP PROGRESS</span>
          <span className={styles.hudValueSector}>
            [LAP {hudTelemetry.lap}/{hudTelemetry.totalLaps}]
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>LAP TIME</span>
          <span className={styles.hudValueScore}>
            {formatTime(hudTelemetry.lapTimeMs)}
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>BEST LAP</span>
          <span className={styles.hudValueRecord}>
            {hudTelemetry.bestLapMs > 0 ? formatTime(hudTelemetry.bestLapMs) : "--:--.---"}
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>SPLIT DELTA</span>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color:
                hudTelemetry.deltaTimeMs === null
                  ? "#94A3B8"
                  : hudTelemetry.deltaTimeMs <= 0
                  ? "#39FF14"
                  : "#FF3366",
            }}
          >
            {hudTelemetry.deltaTimeMs === null
              ? "--"
              : `${hudTelemetry.deltaTimeMs <= 0 ? "-" : "+"}${(
                  Math.abs(hudTelemetry.deltaTimeMs) / 1000
                ).toFixed(2)}s`}
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>DRIFT SCORE</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FF9900" }}>
            {hudTelemetry.driftScore.toLocaleString()} PTS
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>QUANTUM SHARDS</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#00F0FF" }}>
            +{hudTelemetry.shards}
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          boxShadow: "0 0 25px rgba(0, 240, 255, 0.15)",
          background: "#070B19",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "540px",
            touchAction: "none",
          }}
        />

        {/* Countdown Overlay */}
        {raceStatus === "COUNTDOWN" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: "4.5rem",
                fontWeight: 900,
                color: countdownNum === 0 ? "#39FF14" : "#00F0FF",
                textShadow: "0 0 30px currentColor",
                letterSpacing: "4px",
              }}
            >
              {countdownNum > 0 ? `[ ${countdownNum} ]` : "[ GO! ]"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#94A3B8", letterSpacing: "2px" }}>
              PREPARE FOR DRIFT INITIATION
            </div>
          </div>
        )}

        {/* Race Finished Overlay Modal */}
        {raceResult && (
          <div
            className="glass"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid #00F0FF",
              boxShadow: "0 0 40px rgba(0, 240, 255, 0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              minWidth: "340px",
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#39FF14" }}>
              [RACE COMPLETED]
            </div>

            {raceResult.isNewRecord && (
              <div
                style={{
                  background: "linear-gradient(90deg, #FF9900, #FF007F)",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  color: "#FFF",
                }}
              >
                [+] NEW SPEED RECORD!
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>TOTAL TIME</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F8FAFC" }}>
                  {formatTime(raceResult.totalTimeMs)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>BEST LAP</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#00F0FF" }}>
                  {formatTime(raceResult.bestLapMs)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>DRIFT POINTS</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FF9900" }}>
                  {raceResult.driftScore.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>SHARDS EARNED</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#39FF14" }}>
                  +{raceResult.shardsEarned}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetRace}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "linear-gradient(135deg, #00F0FF, #39FF14)",
                border: "none",
                borderRadius: "8px",
                color: "#070B19",
                fontWeight: 900,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)",
              }}
            >
              [RESTART TIME ATTACK]
            </button>
          </div>
        )}

        {/* Quick Pause / Audio Controls Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={() => {
              setIsAudioMuted((prev) => {
                const next = !prev;
                audioEngine.current.setMuted(next);
                return next;
              });
            }}
            style={{
              padding: "0.35rem 0.65rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              borderRadius: "6px",
              color: isAudioMuted ? "#FF3366" : "#00F0FF",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {isAudioMuted ? "[SFX: OFF]" : "[SFX: ON]"}
          </button>

          <button
            onClick={handleResetRace}
            style={{
              padding: "0.35rem 0.65rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "6px",
              color: "#F8FAFC",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            [RESTART]
          </button>
        </div>
      </div>

      {/* Touch / Mobile Controls Ribbon */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          width: "100%",
          padding: "0.5rem 0",
        }}
      >
        {/* Left Side: Steering */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouchSteer("LEFT", true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchSteer("LEFT", false); }}
            onMouseDown={() => handleTouchSteer("LEFT", true)}
            onMouseUp={() => handleTouchSteer("LEFT", false)}
            style={{
              padding: "1rem",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid #00F0FF",
              borderRadius: "10px",
              color: "#00F0FF",
              fontSize: "1.1rem",
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            [ &lt; STEER ]
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouchSteer("RIGHT", true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchSteer("RIGHT", false); }}
            onMouseDown={() => handleTouchSteer("RIGHT", true)}
            onMouseUp={() => handleTouchSteer("RIGHT", false)}
            style={{
              padding: "1rem",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid #00F0FF",
              borderRadius: "10px",
              color: "#00F0FF",
              fontSize: "1.1rem",
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            [ STEER &gt; ]
          </button>
        </div>

        {/* Right Side: Gas / Brake / Drift */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouchDrift(true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchDrift(false); }}
            onMouseDown={() => handleTouchDrift(true)}
            onMouseUp={() => handleTouchDrift(false)}
            style={{
              padding: "1rem 0.5rem",
              background: "rgba(255, 153, 0, 0.2)",
              border: "1px solid #FF9900",
              borderRadius: "10px",
              color: "#FF9900",
              fontSize: "0.85rem",
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            [DRIFT/BOOST]
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouchBrake(true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchBrake(false); }}
            onMouseDown={() => handleTouchBrake(true)}
            onMouseUp={() => handleTouchBrake(false)}
            style={{
              padding: "1rem 0.5rem",
              background: "rgba(255, 51, 102, 0.2)",
              border: "1px solid #FF3366",
              borderRadius: "10px",
              color: "#FF3366",
              fontSize: "0.85rem",
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            [BRAKE]
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); handleTouchThrottle(true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchThrottle(false); }}
            onMouseDown={() => handleTouchThrottle(true)}
            onMouseUp={() => handleTouchThrottle(false)}
            style={{
              padding: "1rem 0.5rem",
              background: "rgba(57, 255, 20, 0.2)",
              border: "1px solid #39FF14",
              borderRadius: "10px",
              color: "#39FF14",
              fontSize: "0.85rem",
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            [GAS]
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FORMATTERS & RENDERING FUNCTIONS
// ============================================================================

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis
    .toString()
    .padStart(3, "0")}`;
}

function drawCyberGrid(
  ctx: CanvasRenderingContext2D,
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
) {
  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
  ctx.lineWidth = 1;

  const gridSize = 120;
  for (let x = bounds.minX; x <= bounds.maxX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, bounds.minY);
    ctx.lineTo(x, bounds.maxY);
    ctx.stroke();
  }
  for (let y = bounds.minY; y <= bounds.maxY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(bounds.minX, y);
    ctx.lineTo(bounds.maxX, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrackSurface(ctx: CanvasRenderingContext2D, circuit: TrackCircuit) {
  const spline = circuit.interpolatedSpline;
  const n = spline.length;

  ctx.save();

  // 1. Run-off verge band (dark cyan perimeter)
  ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
  ctx.lineWidth = circuit.width + 50;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(spline[0].x, spline[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(spline[i].x, spline[i].y);
  }
  ctx.closePath();
  ctx.stroke();

  // 2. Asphalt Road Body
  ctx.strokeStyle = "#0B1222";
  ctx.lineWidth = circuit.width;
  ctx.beginPath();
  ctx.moveTo(spline[0].x, spline[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(spline[i].x, spline[i].y);
  }
  ctx.closePath();
  ctx.stroke();

  // 3. Left and Right Outer Neon Borders & Kerbs
  for (let side of [-1, 1]) {
    ctx.strokeStyle = side === -1 ? "#00F0FF" : "#BF00FF";
    ctx.lineWidth = 4;
    ctx.shadowColor = side === -1 ? "#00F0FF" : "#BF00FF";
    ctx.shadowBlur = 8;

    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = spline[i % n];
      const px = p.x + p.normalX * ((p.width / 2) * side);
      const py = p.y + p.normalY * ((p.width / 2) * side);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // 4. Center Dashed Guide Line
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 20]);
  ctx.beginPath();
  ctx.moveTo(spline[0].x, spline[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(spline[i].x, spline[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

function drawSkidmarks(ctx: CanvasRenderingContext2D, skidmarks: SkidmarkSegment[]) {
  if (skidmarks.length === 0) return;
  ctx.save();

  for (let i = 0; i < skidmarks.length; i++) {
    const s = skidmarks[i];
    ctx.strokeStyle = s.color;
    ctx.globalAlpha = s.alpha;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBoostPads(
  ctx: CanvasRenderingContext2D,
  boostPads: BoostPad[],
  timestamp: number
) {
  ctx.save();
  for (const pad of boostPads) {
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.rotate(pad.angle);

    // Glowing Boost Pad base
    ctx.fillStyle = "rgba(255, 0, 127, 0.25)";
    ctx.strokeStyle = "#FF007F";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#FF007F";
    ctx.shadowBlur = 12;

    ctx.fillRect(-pad.width / 2, -pad.height / 2, pad.width, pad.height);
    ctx.strokeRect(-pad.width / 2, -pad.height / 2, pad.width, pad.height);

    // Animated forward neon chevrons
    const pulseOffset = (timestamp * 0.003) % 1;
    ctx.fillStyle = "#00F0FF";
    ctx.shadowColor = "#00F0FF";

    for (let c = -1; c <= 1; c++) {
      const cx = (c * 20 + pulseOffset * 20) % 30;
      ctx.beginPath();
      ctx.moveTo(cx - 8, -12);
      ctx.lineTo(cx + 4, 0);
      ctx.lineTo(cx - 8, 12);
      ctx.lineTo(cx - 2, 12);
      ctx.lineTo(cx + 10, 0);
      ctx.lineTo(cx - 2, -12);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
  ctx.restore();
}

function drawCheckpoints(
  ctx: CanvasRenderingContext2D,
  checkpoints: CheckpointGate[],
  expectedGateIdx: number,
  timestamp: number
) {
  ctx.save();

  checkpoints.forEach((gate, idx) => {
    const isTarget = idx === expectedGateIdx;
    const isFinishLine = idx === 0;

    if (isFinishLine) {
      // Checkerboard finish line
      ctx.save();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(gate.p1.x, gate.p1.y);
      ctx.lineTo(gate.p2.x, gate.p2.y);
      ctx.stroke();
      ctx.restore();
    } else if (isTarget) {
      // Active Next Target Gate
      const glow = 0.5 + 0.5 * Math.sin(timestamp * 0.008);
      ctx.strokeStyle = `rgba(57, 255, 20, ${0.4 + glow * 0.5})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = "#39FF14";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(gate.p1.x, gate.p1.y);
      ctx.lineTo(gate.p2.x, gate.p2.y);
      ctx.stroke();

      // Gate post markers
      [gate.p1, gate.p2].forEach((p) => {
        ctx.fillStyle = "#39FF14";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });

  ctx.restore();
}

function drawGhostCar(
  ctx: CanvasRenderingContext2D,
  ghostBuffer: GhostTelemetryFrame[],
  currentLapElapsedMs: number
) {
  if (ghostBuffer.length < 2) return;

  let low = 0;
  let high = ghostBuffer.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (ghostBuffer[mid].t <= currentLapElapsedMs) low = mid;
    else high = mid;
  }

  const f1 = ghostBuffer[low];
  const f2 = ghostBuffer[high];
  const dt = f2.t - f1.t || 1;
  const alpha = Math.min(1.0, Math.max(0.0, (currentLapElapsedMs - f1.t) / dt));

  const gx = f1.x + (f2.x - f1.x) * alpha;
  const gy = f1.y + (f2.y - f1.y) * alpha;
  const gRot = f1.rot + (f2.rot - f1.rot) * alpha;

  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(gRot);

  // Holographic Ghost Wireframe
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#00F0FF";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00F0FF";
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(10, -9);
  ctx.lineTo(-14, -10);
  ctx.lineTo(-18, -6);
  ctx.lineTo(-18, 6);
  ctx.lineTo(-14, 10);
  ctx.lineTo(10, 9);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(0, -5);
  ctx.lineTo(-8, -5);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-8, 5);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawPlayerCar(
  ctx: CanvasRenderingContext2D,
  car: DriftCarState,
  timestamp: number
) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // 1. Headlight Cones
  ctx.save();
  const grad = ctx.createRadialGradient(20, 0, 2, 80, 0, 90);
  grad.addColorStop(0, "rgba(0, 240, 255, 0.45)");
  grad.addColorStop(1, "rgba(0, 240, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(16, -6);
  ctx.lineTo(90, -35);
  ctx.lineTo(90, 35);
  ctx.lineTo(16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. 3-Tier Drift Spark Auras on Rear Wheels
  if (car.boostTier > 0) {
    const tierColor =
      car.boostTier === 3 ? "#BF00FF" : car.boostTier === 2 ? "#FF9900" : "#00F0FF";
    ctx.shadowColor = tierColor;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 2;

    [-10, 10].forEach((wheelY) => {
      ctx.beginPath();
      ctx.arc(-14, wheelY, 7 + Math.sin(timestamp * 0.02) * 2, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  // 3. Supercar Body Chassis
  ctx.shadowColor = car.color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#0F172A";
  ctx.strokeStyle = car.color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(18, 0);       // Nose apex
  ctx.lineTo(10, -9);      // Front left bumper
  ctx.lineTo(-14, -11);    // Left side skirt
  ctx.lineTo(-18, -7);     // Rear wing left
  ctx.lineTo(-18, 7);      // Rear wing right
  ctx.lineTo(-14, 11);     // Right side skirt
  ctx.lineTo(10, 9);       // Front right bumper
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Cockpit Canopy Glass
  ctx.fillStyle = "#00F0FF";
  ctx.shadowColor = "#00F0FF";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(0, -5);
  ctx.lineTo(-8, -5);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-8, 5);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  // 5. Taillight Red LEDs
  ctx.fillStyle = "#FF1744";
  ctx.shadowColor = "#FF1744";
  ctx.shadowBlur = 8;
  ctx.fillRect(-18, -6, 2, 3);
  ctx.fillRect(-18, 3, 2, 3);

  ctx.restore();
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: TireParticle[],
  dt: number
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha = Math.max(0, p.life / p.maxLife);

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * (p.type === "SMOKE" ? 1.5 - p.alpha * 0.5 : 1.0), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: ChronoGameState
) {
  ctx.save();

  // 1. Bottom Right Speedometer Gauge
  const speedKmh = Math.round(state.car.speed * 0.65);
  const gaugeX = width - 90;
  const gaugeY = height - 80;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Speed arc
  const speedRatio = Math.min(1.0, speedKmh / 320);
  ctx.strokeStyle = state.car.boostTimer > 0 ? "#FF007F" : "#00F0FF";
  ctx.lineWidth = 5;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 44, Math.PI * 0.75, Math.PI * 0.75 + speedRatio * Math.PI * 1.5);
  ctx.stroke();

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "800 16px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${speedKmh}`, gaugeX, gaugeY - 2);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "700 9px monospace";
  ctx.fillText("KM/H", gaugeX, gaugeY + 12);

  // 2. 3-Tier Drift Turbo Charge Bar
  const barW = 140;
  const barH = 10;
  const barX = gaugeX - 70;
  const barY = gaugeY + 58;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.strokeRect(barX, barY, barW, barH);

  if (state.car.driftCharge > 0) {
    const chargeFill = Math.min(1.0, state.car.driftCharge / 3.8);
    const chargeColor =
      state.car.boostTier === 3 ? "#BF00FF" : state.car.boostTier === 2 ? "#FF9900" : "#00F0FF";

    ctx.fillStyle = chargeColor;
    ctx.shadowColor = chargeColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(barX, barY, barW * chargeFill, barH);
  }

  // 3. Top Left Mini-Map Radar
  const mapW = 100;
  const mapH = 100;
  const mapX = 16;
  const mapY = 16;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  // Scaled track spline on mini-map
  const b = state.circuit.bounds;
  const scaleX = (mapW - 16) / (b.maxX - b.minX);
  const scaleY = (mapH - 16) / (b.maxY - b.minY);

  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  state.circuit.interpolatedSpline.forEach((p: { x: number; y: number }, idx: number) => {
    const mx = mapX + 8 + (p.x - b.minX) * scaleX;
    const my = mapY + 8 + (p.y - b.minY) * scaleY;
    if (idx === 0) ctx.moveTo(mx, my);
    else ctx.lineTo(mx, my);
  });
  ctx.closePath();
  ctx.stroke();

  // Player blip
  const pmX = mapX + 8 + (state.car.x - b.minX) * scaleX;
  const pmY = mapY + 8 + (state.car.y - b.minY) * scaleY;
  ctx.fillStyle = "#39FF14";
  ctx.shadowColor = "#39FF14";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(pmX, pmY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
