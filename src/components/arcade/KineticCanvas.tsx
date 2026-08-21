"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  AugmentCard,
  BossEntity,
  Bumper,
  CustomLevelData,
  GameMode,
  GameStatus,
  GravityWell,
  HullVessel,
  LaserBeam,
  PlayerOrb,
  ShardPickup,
  TechUpgrade,
  Vector2D,
} from "@/lib/gameEngine/types";
import { PhysicsEngine, TrajectoryPoint } from "@/lib/gameEngine/physics";
import { ParticleSystem } from "@/lib/gameEngine/particles";
import { soundManager } from "@/lib/gameEngine/audio";
import {
  generateBoss,
  generateGravityWells,
  generateLaserBeams,
  generateSectorBumpers,
  SECTORS,
} from "@/lib/gameEngine/levels";
import { WeatherSystem } from "@/lib/gameEngine/weather";
import styles from "./KineticGame.module.css";

interface KineticCanvasProps {
  status: GameStatus;
  sector: number;
  gameMode?: GameMode;
  customLevelData?: CustomLevelData | null;
  activeVessel: HullVessel;
  activeTrailColor: string;
  techUpgrades: TechUpgrade[];
  augments: AugmentCard[];
  empFreezeActive?: boolean;
  microSingularityTrigger?: number;
  triCloneTrigger?: number;
  onScoreUpdate: (newScore: number, addedPoints: number) => void;
  onShardsCollected: (shardsCount: number) => void;
  onComboChange: (combo: number) => void;
  onLaunchesChange: (launchesLeft: number) => void;
  onOverdriveChargeChange: (charge: number) => void;
  onTriggerDraft: () => void;
  onGameOver: (finalScore: number, totalBounces: number, maxCombo: number) => void;
  onBossDefeated: () => void;
  onSectorComplete: () => void;
}

export default function KineticCanvas({
  status,
  sector,
  gameMode = "CAMPAIGN",
  customLevelData = null,
  activeVessel,
  activeTrailColor,
  techUpgrades,
  augments,
  empFreezeActive = false,
  microSingularityTrigger = 0,
  triCloneTrigger = 0,
  onScoreUpdate,
  onShardsCollected,
  onComboChange,
  onLaunchesChange,
  onOverdriveChargeChange,
  onTriggerDraft,
  onGameOver,
  onBossDefeated,
  onSectorComplete,
}: KineticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem());

  // Game state references for loop
  const gameStateRef = useRef<{
    width: number;
    height: number;
    orb: PlayerOrb;
    cloneOrbs: PlayerOrb[];
    bumpers: Bumper[];
    gravityWells: GravityWell[];
    laserBeams: LaserBeam[];
    boss: BossEntity | null;
    shards: ShardPickup[];
    isAiming: boolean;
    aimStart: Vector2D;
    aimCurrent: Vector2D;
    trajectory: TrajectoryPoint[];
    score: number;
    combo: number;
    maxCombo: number;
    totalBounces: number;
    overdriveCharge: number;
    sectorScore: number;
    stars: { x: number; y: number; size: number; alpha: number; speed: number }[];
  }>({
    width: 600,
    height: 750,
    orb: {
      x: 300,
      y: 650,
      vx: 0,
      vy: 0,
      radius: 12,
      baseRadius: 12,
      mass: 1.0,
      color: "#00F0FF",
      glowColor: "rgba(0, 240, 255, 0.6)",
      trailColor: "#00F0FF",
      hp: 100,
      maxHp: 100,
      shields: 1,
      maxShields: 1,
      energy: 100,
      maxEnergy: 100,
      overdriveCharge: 0,
      isOverdrive: false,
      overdriveTimer: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      piercing: 0,
      splitCount: 0,
      lightningArcs: 0,
      isGhost: false,
      trailHistory: [],
      launchesLeft: 5,
      maxLaunches: 5,
    },
    cloneOrbs: [],
    bumpers: [],
    gravityWells: [],
    laserBeams: [],
    boss: null,
    shards: [],
    isAiming: false,
    aimStart: { x: 300, y: 650 },
    aimCurrent: { x: 300, y: 650 },
    trajectory: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    totalBounces: 0,
    overdriveCharge: 0,
    sectorScore: 0,
    stars: [],
  });

  // Calculate Tech bonuses
  const getTechBonus = useCallback(
    (techId: string): number => {
      const t = techUpgrades.find((u) => u.id === techId);
      return t ? t.level * t.valuePerLevel : 0;
    },
    [techUpgrades]
  );

  // Initialize Sector Level
  const initSector = useCallback(
    (sectorNum: number, currentWidth: number, currentHeight: number) => {
      const state = gameStateRef.current;

      if (gameMode === "CUSTOM_SANDBOX" && customLevelData) {
        state.bumpers = customLevelData.bumpers.map((b) => ({ ...b, isDestroyed: false, hp: b.maxHp }));
        state.gravityWells = [...customLevelData.gravityWells];
        state.laserBeams = [...customLevelData.laserBeams];
        state.boss = customLevelData.hasBoss && customLevelData.bossType
          ? generateBoss(1, currentWidth, currentHeight)
          : null;
      } else if (gameMode === "BOSS_RUSH") {
        state.bumpers = generateSectorBumpers(sectorNum, currentWidth, currentHeight);
        state.gravityWells = generateGravityWells(sectorNum, currentWidth, currentHeight);
        state.laserBeams = generateLaserBeams(sectorNum, currentWidth, currentHeight);
        state.boss = generateBoss(sectorNum, currentWidth, currentHeight) || generateBoss(3, currentWidth, currentHeight);
      } else {
        state.bumpers = generateSectorBumpers(sectorNum, currentWidth, currentHeight);
        state.gravityWells = generateGravityWells(sectorNum, currentWidth, currentHeight);
        state.laserBeams = generateLaserBeams(sectorNum, currentWidth, currentHeight);
        state.boss = generateBoss(sectorNum, currentWidth, currentHeight);
      }

      state.sectorScore = 0;

      // Position launch pad
      state.orb.x = currentWidth * 0.5;
      state.orb.y = currentHeight * 0.88;
      state.orb.vx = 0;
      state.orb.vy = 0;
      state.orb.color = activeVessel.color;
      state.orb.trailColor = activeTrailColor;
      state.orb.mass = activeVessel.mass;
      state.orb.shields = activeVessel.shieldSlots + Math.floor(getTechBonus("TECH_SHIELD_CAPACITY"));
      state.orb.maxShields = state.orb.shields;

      // Initialize stars
      state.stars = Array.from({ length: 65 }, () => ({
        x: Math.random() * currentWidth,
        y: Math.random() * currentHeight,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.4 + 0.1,
      }));
    },
    [activeVessel, activeTrailColor, gameMode, customLevelData, getTechBonus]
  );

  // Handle Resize & Retina Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2.0);
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      gameStateRef.current.width = width;
      gameStateRef.current.height = height;
      initSector(sector, width, height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sector, initSector]);

  // Activate Overdrive
  const triggerSupernova = useCallback(() => {
    const state = gameStateRef.current;
    if (state.overdriveCharge < 100) return;

    state.overdriveCharge = 0;
    onOverdriveChargeChange(0);
    state.orb.isOverdrive = true;
    state.orb.overdriveTimer = 300; // 5 seconds at 60fps

    soundManager.playOverdriveActivate();
    soundManager.playExplosion("MASSIVE");
    particleSystem.current.triggerScreenShake(20);
    particleSystem.current.emitShockwave(state.orb.x, state.orb.y, "#FFE600", 250);
    particleSystem.current.emitFloatingText(state.orb.x, state.orb.y, "SUPERNOVA BLAST!", "#FFE600");

    // Detonate nearby bumpers and damage boss
    state.bumpers.forEach((b) => {
      if (!b.isDestroyed) {
        b.hp -= 3;
        if (b.hp <= 0) {
          b.isDestroyed = true;
          state.score += b.points * 2;
          onScoreUpdate(state.score, b.points * 2);
          state.shards.push({
            id: `shard_${Date.now()}_${Math.random()}`,
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            value: b.shards * 2,
            type: "OVERDRIVE_CELL",
            radius: 7,
            color: "#FFE600",
            life: 300,
          });
        }
      }
    });

    if (state.boss) {
      state.boss.hp -= 600;
      if (state.boss.hp <= 0) {
        state.boss.hp = 0;
        onBossDefeated();
      }
    }
  }, [onOverdriveChargeChange, onScoreUpdate, onBossDefeated]);

  // Keyboard shortcut listener for Overdrive (Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        triggerSupernova();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSupernova]);

  // Micro Singularity Tactical Ability Trigger
  useEffect(() => {
    if (!microSingularityTrigger) return;
    const state = gameStateRef.current;
    const x = state.orb.x || state.width * 0.5;
    const y = Math.min(state.height * 0.55, Math.max(state.height * 0.25, state.orb.y || state.height * 0.4));

    const well: GravityWell = {
      id: `micro_singularity_${Date.now()}`,
      x,
      y,
      radius: Math.min(state.width, state.height) * 0.35,
      innerRadius: 18,
      strength: 9500,
      pulseSpeed: 0.12,
      pulseOffset: 0,
      color: "#BF00FF",
    };

    state.gravityWells.push(well);
    particleSystem.current.triggerScreenShake(14);
    particleSystem.current.emitShockwave(x, y, "#BF00FF", 220);
    particleSystem.current.emitFloatingText(x, y, "MICRO SINGULARITY VORTEX!", "#BF00FF");

    const timer = setTimeout(() => {
      state.gravityWells = state.gravityWells.filter((w) => w.id !== well.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [microSingularityTrigger]);

  // Tri-Clone Tactical Ability Trigger
  useEffect(() => {
    if (!triCloneTrigger) return;
    const state = gameStateRef.current;
    const speed = Math.hypot(state.orb.vx, state.orb.vy);
    const effectiveSpeed = speed > 0.5 ? speed : 12;
    const currentAngle = speed > 0.5 ? Math.atan2(state.orb.vy, state.orb.vx) : -Math.PI / 2;
    const angleOffset = 0.52; // ~30 degrees

    const clone1: PlayerOrb = {
      ...state.orb,
      vx: Math.cos(currentAngle + angleOffset) * effectiveSpeed,
      vy: Math.sin(currentAngle + angleOffset) * effectiveSpeed,
      color: "#39FF14",
      glowColor: "rgba(57, 255, 20, 0.7)",
      trailColor: "#39FF14",
      radius: 9,
      isGhost: true,
      trailHistory: [],
    };

    const clone2: PlayerOrb = {
      ...state.orb,
      vx: Math.cos(currentAngle - angleOffset) * effectiveSpeed,
      vy: Math.sin(currentAngle - angleOffset) * effectiveSpeed,
      color: "#39FF14",
      glowColor: "rgba(57, 255, 20, 0.7)",
      trailColor: "#39FF14",
      radius: 9,
      isGhost: true,
      trailHistory: [],
    };

    state.cloneOrbs.push(clone1, clone2);
    particleSystem.current.emitSparks(state.orb.x, state.orb.y, "#39FF14", 24, 6);
    particleSystem.current.emitShockwave(state.orb.x, state.orb.y, "#39FF14", 100);
    particleSystem.current.emitFloatingText(state.orb.x, state.orb.y, "TRI-PHASE SPLIT!", "#39FF14");
  }, [triCloneTrigger]);

  // Slingshot Aim Handlers with High-DPI Viewport Scaling
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? gameStateRef.current.width / rect.width : 1;
    const scaleY = rect.height > 0 ? gameStateRef.current.height / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (status !== "IDLE" && status !== "FLYING") return;
    const { x, y } = getCanvasCoords(clientX, clientY);

    const state = gameStateRef.current;
    const distToOrb = Math.hypot(x - state.orb.x, y - state.orb.y);

    if (distToOrb < 90 || status === "IDLE") {
      state.isAiming = true;
      state.aimStart = { x: state.orb.x, y: state.orb.y };
      state.aimCurrent = { x, y };
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const state = gameStateRef.current;
    if (!state.isAiming) return;
    const { x, y } = getCanvasCoords(clientX, clientY);

    state.aimCurrent = { x, y };

    // Calculate pull vector (inverted for slingshot)
    const pullX = state.aimStart.x - x;
    const pullY = state.aimStart.y - y;
    const maxPull = 140;
    const pullDist = Math.hypot(pullX, pullY);
    const clampedDist = Math.min(pullDist, maxPull);

    const angle = Math.atan2(pullY, pullX);
    const launchSpeedBonus = 1 + getTechBonus("TECH_LAUNCH_VELOCITY") / 100;
    const speed = (clampedDist / 8.5) * activeVessel.speedMultiplier * launchSpeedBonus;

    const simVelocity: Vector2D = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    // Simulate real-time trajectory forecast with sub-stepped multi-bounce lookahead
    state.trajectory = PhysicsEngine.simulateTrajectory(
      state.orb.x,
      state.orb.y,
      simVelocity,
      state.gravityWells,
      state.bumpers,
      state.width,
      state.height,
      Math.floor(75 * (1 + getTechBonus("TECH_TRAJECTORY_CALCULATOR") / 100))
    );
  };

  const handlePointerUp = () => {
    const state = gameStateRef.current;
    if (!state.isAiming) return;

    state.isAiming = false;
    const pullX = state.aimStart.x - state.aimCurrent.x;
    const pullY = state.aimStart.y - state.aimCurrent.y;
    const pullDist = Math.hypot(pullX, pullY);

    if (pullDist > 15) {
      const maxPull = 140;
      const clampedDist = Math.min(pullDist, maxPull);
      const angle = Math.atan2(pullY, pullX);
      const launchSpeedBonus = 1 + getTechBonus("TECH_LAUNCH_VELOCITY") / 100;
      const speed = (clampedDist / 8.5) * activeVessel.speedMultiplier * launchSpeedBonus;

      state.orb.vx = Math.cos(angle) * speed;
      state.orb.vy = Math.sin(angle) * speed;
      state.trajectory = [];

      soundManager.playLaunch(clampedDist / maxPull);
      particleSystem.current.emitSparks(state.orb.x, state.orb.y, activeVessel.color, 16, 5);
    }
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    soundManager.startAmbiance();

    const gameLoop = () => {
      const state = gameStateRef.current;
      const width = state.width;
      const height = state.height;

      // 1. Update Physics
      if (status !== "PAUSED" && status !== "GAMEOVER") {
        // Starfield drift
        state.stars.forEach((s) => {
          s.y += s.speed;
          if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
          }
        });

        // Time dilation augment check
        const hasChrono = augments.some((a) => a.id === "CHRONOS_WARP");
        const timeScale = hasChrono ? 0.85 : 1.0;

        // Update player orb
        const { hitBottom } = PhysicsEngine.updateOrb(
          state.orb,
          state.gravityWells,
          width,
          height,
          timeScale
        );

        if (hitBottom) {
          state.orb.launchesLeft--;
          onLaunchesChange(state.orb.launchesLeft);
          state.combo = 0;
          onComboChange(0);

          if (state.orb.launchesLeft <= 0) {
            soundManager.playGameOver();
            onGameOver(state.score, state.totalBounces, state.maxCombo);
          } else {
            // Reset orb to launch pad
            state.orb.x = width * 0.5;
            state.orb.y = height * 0.88;
            state.orb.vx = 0;
            state.orb.vy = 0;
            state.orb.trailHistory = [];
          }
        }

        // Update Clone Orbs Physics & Collisions
        const kineticElasticityBonus = 1 + getTechBonus("TECH_BOUNCE_RESTITUTION") / 100;
        for (let cIdx = state.cloneOrbs.length - 1; cIdx >= 0; cIdx--) {
          const cloneOrb = state.cloneOrbs[cIdx];
          const { hitBottom: cloneHitBottom } = PhysicsEngine.updateOrb(
            cloneOrb,
            state.gravityWells,
            width,
            height,
            timeScale
          );

          if (cloneHitBottom) {
            particleSystem.current.emitSparks(cloneOrb.x, cloneOrb.y, cloneOrb.color, 8, 3);
            state.cloneOrbs.splice(cIdx, 1);
            continue;
          }

          // Check Bumper collisions for clone
          state.bumpers.forEach((b) => {
            if (b.isDestroyed) return;
            const col = PhysicsEngine.checkBumperCollision(cloneOrb, b, kineticElasticityBonus);
            if (col.hit) {
              state.totalBounces++;
              state.combo++;
              if (state.combo > state.maxCombo) state.maxCombo = state.combo;
              onComboChange(state.combo);

              const pts = Math.round(b.points * 1.5);
              state.score += pts;
              state.sectorScore += pts;
              onScoreUpdate(state.score, pts);

              soundManager.playBumperHit(state.combo, b.type);
              particleSystem.current.emitSparks(b.x, b.y, b.color, 10, 3);
              particleSystem.current.emitFloatingText(b.x, b.y, `+${pts} CLONE`, "#39FF14");

              b.hp--;
              if (b.hp <= 0) {
                b.isDestroyed = true;
                soundManager.playExplosion("SMALL");
              }
            }
          });

          // Check Boss collisions for clone
          if (state.boss && state.boss.hp > 0) {
            const bossCol = PhysicsEngine.checkBossCollisions(cloneOrb, state.boss);
            if (bossCol.hitDroneIndex >= 0) {
              state.boss.drones[bossCol.hitDroneIndex].hp -= 40;
              soundManager.playBumperHit(state.combo, "BOUNCE_SUPER");
              particleSystem.current.emitSparks(cloneOrb.x, cloneOrb.y, "#39FF14", 8, 3);
            } else if (bossCol.hitCore) {
              state.boss.hp -= 80;
              soundManager.playExplosion("MEDIUM");
              particleSystem.current.emitFloatingText(state.boss.x, state.boss.y, "-80 CLONE DMG", "#39FF14");
            }
          }
        }

        // Check Bumper Collisions for Main Orb
        state.bumpers.forEach((b) => {
          if (b.isDestroyed) return;
          b.pulsePhase += 0.04;

          const col = PhysicsEngine.checkBumperCollision(state.orb, b, kineticElasticityBonus);
          if (col.hit) {
            state.totalBounces++;
            state.combo++;
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            onComboChange(state.combo);

            // Points with combo multiplier
            const comboMultiplier = 1 + (state.combo - 1) * 0.25;
            const pts = Math.round(b.points * comboMultiplier);
            state.score += pts;
            state.sectorScore += pts;
            onScoreUpdate(state.score, pts);

            // Overdrive charge increment
            const chargeGain = 4 * (1 + getTechBonus("TECH_OVERDRIVE_REACTOR") / 100);
            state.overdriveCharge = Math.min(100, state.overdriveCharge + chargeGain);
            onOverdriveChargeChange(state.overdriveCharge);

            // Audio & Particle Juice
            soundManager.playBumperHit(state.combo, b.type);
            particleSystem.current.triggerScreenShake(Math.min(8, col.impulse * 0.4));
            particleSystem.current.emitSparks(b.x, b.y, b.color, 14, 4);
            particleSystem.current.emitShockwave(b.x, b.y, b.color, 45);
            particleSystem.current.emitFloatingText(
              b.x,
              b.y,
              `+${pts} (${state.combo}x)`,
              b.color
            );

            // Damage bumper
            b.hp--;
            if (b.hp <= 0) {
              b.isDestroyed = true;
              soundManager.playExplosion("SMALL");

              // Spawn Quantum Shards
              const shardYieldBonus = 1 + getTechBonus("TECH_SHARD_YIELD") / 100;
              const dropCount = Math.ceil(b.shards * shardYieldBonus);
              for (let i = 0; i < 3; i++) {
                state.shards.push({
                  id: `shard_${Date.now()}_${Math.random()}`,
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  value: Math.ceil(dropCount / 3),
                  type: "STANDARD",
                  radius: 5,
                  color: "#00F0FF",
                  life: 360,
                });
              }

              // Check Sector Target score or level drafting
              const sectorConf = SECTORS.find((s) => s.sectorNumber === sector) || SECTORS[0];
              if (state.sectorScore >= sectorConf.targetScore && !sectorConf.hasBoss) {
                onSectorComplete();
                onTriggerDraft();
              }
            }
          }
        });

        // Check Boss Collisions & AI
        if (state.boss && state.boss.hp > 0) {
          const boss = state.boss;
          if (!empFreezeActive) {
            boss.x += boss.vx;
            if (boss.x < width * 0.2 || boss.x > width * 0.8) boss.vx = -boss.vx;

            // Rotate drones - speed up significantly when enraged
            const droneSpeed = boss.enraged ? 0.075 : 0.03;
            boss.drones.forEach((d) => {
              d.angle += droneSpeed;
              d.x = boss.x + Math.cos(d.angle) * d.orbitRadius;
              d.y = boss.y + Math.sin(d.angle) * d.orbitRadius;
            });
          }

          const bossCol = PhysicsEngine.checkBossCollisions(state.orb, boss);
          if (bossCol.hitDroneIndex >= 0) {
            const drone = boss.drones[bossCol.hitDroneIndex];
            drone.hp -= 50;
            soundManager.playBumperHit(state.combo, "BOUNCE_SUPER");
            particleSystem.current.emitSparks(drone.x, drone.y, drone.color, 12, 4);
            particleSystem.current.emitFloatingText(drone.x, drone.y, "-50 DMG", "#00F0FF");
          } else if (bossCol.hitCore) {
            boss.hp -= 120;
            soundManager.playExplosion("MEDIUM");
            particleSystem.current.triggerScreenShake(12);
            particleSystem.current.emitSparks(boss.x, boss.y, boss.color, 20, 6);
            particleSystem.current.emitFloatingText(boss.x, boss.y, "-120 CORE DMG", "#FF3366");

            if (boss.hp <= boss.maxHp * 0.4 && !boss.enraged) {
              boss.enraged = true;
              boss.vx *= 1.8;
              soundManager.playOverdriveActivate();
              soundManager.playExplosion("MASSIVE");
              particleSystem.current.triggerScreenShake(24);
              particleSystem.current.emitShockwave(boss.x, boss.y, "#FF0055", 180);
              particleSystem.current.emitShockwave(boss.x, boss.y, "#FFE600", 240);
              particleSystem.current.emitSparks(boss.x, boss.y, "#FF0055", 35, 7);
              particleSystem.current.emitFloatingText(
                boss.x,
                boss.y,
                "[!] BOSS OVERDRIVE ENRAGED [!]",
                "#FF0055"
              );
            }

            if (boss.hp <= 0) {
              boss.hp = 0;
              soundManager.playExplosion("MASSIVE");
              particleSystem.current.triggerScreenShake(25);
              particleSystem.current.emitShockwave(boss.x, boss.y, boss.color, 200);
              onBossDefeated();
              onTriggerDraft();
            }
          }
        }

        // Check Laser Beam hazards
        state.laserBeams.forEach((laser) => {
          if (!empFreezeActive) {
            laser.angle += laser.angularVelocity;
          }
          laser.endX = laser.startX + Math.cos(laser.angle) * laser.length;
          laser.endY = laser.startY + Math.sin(laser.angle) * laser.length;

          if (!empFreezeActive && PhysicsEngine.checkLaserCollision(state.orb, laser)) {
            if (state.orb.shields > 0) {
              state.orb.shields--;
              soundManager.playShieldDeflect();
              particleSystem.current.triggerScreenShake(10);
              particleSystem.current.emitShockwave(state.orb.x, state.orb.y, "#00F0FF", 50);
              particleSystem.current.emitFloatingText(
                state.orb.x,
                state.orb.y,
                "SHIELD DEFLECTED!",
                "#00F0FF"
              );
            }
          }
        });

        // Update Shard pickups & Vacuum magnet
        const magnetBonus = getTechBonus("TECH_MAGNET_RADIUS");
        const shardResult = PhysicsEngine.updateShards(state.shards, state.orb, magnetBonus);
        if (shardResult.collectedCount > 0) {
          soundManager.playShardCollect();
          onShardsCollected(shardResult.totalValue);
          particleSystem.current.emitSparks(state.orb.x, state.orb.y, "#00F0FF", 6, 2);
        }

        // Update particles
        particleSystem.current.update();
      }

      // 2. Render Canvas Frame
      ctx.save();

      // Apply screen shake
      const shake = particleSystem.current.getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Background clear & deep space gradient
      const sectorConf = SECTORS.find((s) => s.sectorNumber === sector) || SECTORS[0];
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, sectorConf.ambientColor);
      bgGrad.addColorStop(1, "#020408");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render starfield
      state.stars.forEach((s) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Gravity Wells
      state.gravityWells.forEach((gw) => {
        ctx.save();
        const gwGrad = ctx.createRadialGradient(gw.x, gw.y, gw.innerRadius, gw.x, gw.y, gw.radius);
        gwGrad.addColorStop(0, "rgba(0, 240, 255, 0.25)");
        gwGrad.addColorStop(0.6, "rgba(0, 240, 255, 0.08)");
        gwGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = gwGrad;
        ctx.beginPath();
        ctx.arc(gw.x, gw.y, gw.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ring
        ctx.strokeStyle = gw.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(gw.x, gw.y, gw.innerRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Render Laser Beams
      state.laserBeams.forEach((laser) => {
        ctx.save();
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(laser.startX, laser.startY);
        ctx.lineTo(laser.endX, laser.endY);
        ctx.stroke();

        // Laser emitter node
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(laser.startX, laser.startY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Bumpers
      state.bumpers.forEach((b) => {
        if (b.isDestroyed) return;
        ctx.save();
        const pulseR = b.radius + Math.sin(b.pulsePhase) * 2;

        // Outer glow
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulseR, 0, Math.PI * 2);
        ctx.fill();

        // Inner dark core
        ctx.fillStyle = "#0A0E17";
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulseR * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Glyph symbol
        ctx.fillStyle = b.color;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const glyph = b.type === "BOUNCE_SUPER" ? "[^]" : b.type === "EXPLOSIVE" ? "[!]" : b.type === "GOLDEN_CORE" ? "[$]" : "[*]";
        ctx.fillText(glyph, b.x, b.y);
        ctx.restore();
      });

      // Render Boss
      if (state.boss && state.boss.hp > 0) {
        const boss = state.boss;
        ctx.save();

        // Enraged boss hazard halo and warning ring
        if (boss.enraged) {
          const pulse = Math.sin(Date.now() * 0.009) * 6;
          ctx.strokeStyle = "rgba(255, 0, 85, 0.85)";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(boss.x, boss.y, boss.radius + 16 + pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "rgba(255, 0, 85, 0.15)";
          ctx.beginPath();
          ctx.arc(boss.x, boss.y, boss.radius + 10 + pulse * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shield Drones
        boss.drones.forEach((d) => {
          if (d.hp > 0) {
            ctx.fillStyle = d.color;
            ctx.shadowColor = d.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Boss Core
        ctx.fillStyle = boss.color;
        ctx.shadowColor = boss.color;
        ctx.shadowBlur = boss.enraged ? 30 : 20;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        ctx.fill();

        // Boss Health Bar
        const barWidth = 140;
        const barHeight = 8;
        const hpRatio = boss.hp / boss.maxHp;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(boss.x - barWidth * 0.5, boss.y - boss.radius - 20, barWidth, barHeight);
        ctx.fillStyle = boss.enraged ? "#FF0055" : "#00F0FF";
        ctx.fillRect(
          boss.x - barWidth * 0.5,
          boss.y - boss.radius - 20,
          barWidth * hpRatio,
          barHeight
        );
        ctx.restore();
      }

      // Render Quantum Shards
      state.shards.forEach((s) => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Trajectory Forecast Line with Bounce Markers
      if (state.isAiming && state.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        state.trajectory.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Render bounce impact rings
        state.trajectory.forEach((pt) => {
          if (pt.isBounce) {
            ctx.strokeStyle = pt.bounceType === "BUMPER" ? "#FFE600" : "#00F0FF";
            ctx.fillStyle = pt.bounceType === "BUMPER" ? "rgba(255, 230, 0, 0.45)" : "rgba(0, 240, 255, 0.45)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
          }
        });

        // Slingshot pull line
        ctx.strokeStyle = "rgba(255, 51, 102, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.orb.x, state.orb.y);
        ctx.lineTo(state.aimCurrent.x, state.aimCurrent.y);
        ctx.stroke();
        ctx.restore();
      }

      // Render Player Orb Trail
      if (state.orb.trailHistory.length > 1) {
        ctx.save();
        for (let i = 0; i < state.orb.trailHistory.length - 1; i++) {
          const p1 = state.orb.trailHistory[i];
          const p2 = state.orb.trailHistory[i + 1];
          ctx.strokeStyle = state.orb.trailColor;
          ctx.globalAlpha = p1.alpha * 0.6;
          ctx.lineWidth = state.orb.radius * (1 - i / state.orb.trailHistory.length) * 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Player Orb
      ctx.save();
      ctx.fillStyle = state.orb.color;
      ctx.shadowColor = state.orb.color;
      ctx.shadowBlur = state.orb.isOverdrive ? 25 : 12;
      ctx.beginPath();
      ctx.arc(state.orb.x, state.orb.y, state.orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shield Bubble
      if (state.orb.shields > 0) {
        ctx.strokeStyle = "#00F0FF";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(state.orb.x, state.orb.y, state.orb.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Render Clone Orbs and Trails
      state.cloneOrbs.forEach((cOrb) => {
        if (cOrb.trailHistory.length > 1) {
          ctx.save();
          for (let i = 0; i < cOrb.trailHistory.length - 1; i++) {
            const p1 = cOrb.trailHistory[i];
            const p2 = cOrb.trailHistory[i + 1];
            ctx.strokeStyle = cOrb.trailColor;
            ctx.globalAlpha = p1.alpha * 0.45;
            ctx.lineWidth = cOrb.radius * (1 - i / cOrb.trailHistory.length);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = cOrb.color;
        ctx.shadowColor = cOrb.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cOrb.x, cOrb.y, cOrb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Particles
      particleSystem.current.render(ctx);

      ctx.restore();

      animFrameId.current = requestAnimationFrame(gameLoop);
    };

    animFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      soundManager.stopAmbiance();
    };
  }, [
    status,
    sector,
    activeVessel,
    activeTrailColor,
    augments,
    getTechBonus,
    onScoreUpdate,
    onShardsCollected,
    onComboChange,
    onLaunchesChange,
    onOverdriveChargeChange,
    onTriggerDraft,
    onGameOver,
    onBossDefeated,
    onSectorComplete,
  ]);

  const activeWeather = WeatherSystem.getWeatherForSector(sector);

  return (
    <div className={styles.canvasContainer}>
      {/* Dynamic Sector Cosmic Weather Overlay */}
      <div style={{ position: "absolute", top: "12px", left: "14px", display: "flex", alignItems: "center", gap: "0.5rem", pointerEvents: "none", zIndex: 5 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.25rem 0.55rem", borderRadius: "6px", background: "rgba(15, 23, 42, 0.85)", border: `1px solid ${activeWeather.color}`, color: activeWeather.color }}>
          {activeWeather.badge} {activeWeather.name}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className={styles.gameCanvas}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}
