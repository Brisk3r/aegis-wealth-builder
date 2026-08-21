"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  EnemyProjectile,
  FloatingDamageNumber,
  LightningArc,
  MissileEntity,
  VoidAugmentCard,
  VoidEnemyEntity,
  VoidPlayerState,
  VoidSurvivorsCanvasProps,
  XPGemEntity,
} from "@/lib/gameEngine/voidSurvivors/types";
import { UniformGridHash } from "@/lib/gameEngine/voidSurvivors/spatialHash";
import { voidSound } from "@/lib/gameEngine/voidSurvivors/audioSynth";
import { draftRandomAugments } from "@/lib/gameEngine/voidSurvivors/augmentsRegistry";
import { HordeWaveDirector } from "@/lib/gameEngine/voidSurvivors/enemySpawner";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import { TechUpgrade } from "@/lib/gameEngine/types";
import styles from "./KineticGame.module.css";

const ARENA_HALF_SIZE = 780; // Arena bounds: -780 to +780 px

interface TouchStickState {
  active: boolean;
  touchId: number | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  vectorX: number;
  vectorY: number;
}

export default function VoidSurvivorsCanvas({
  onScoreUpdate,
  onShardsCollected,
  onLevelUp,
  onGameOver,
  shipColor = "#00F0FF",
}: VoidSurvivorsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Engine systems
  const spatialHash = useRef<UniformGridHash>(new UniformGridHash(64));
  const waveDirector = useRef<HordeWaveDirector>(new HordeWaveDirector());

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mouseAim = useRef<{ x: number; y: number; isManual: boolean }>({
    x: 0,
    y: 0,
    isManual: false,
  });
  const touchStick = useRef<TouchStickState>({
    active: false,
    touchId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    vectorX: 0,
    vectorY: 0,
  });

  // UI States (for React overlays like Pause, Draft, and Game Over)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [draftCards, setDraftCards] = useState<VoidAugmentCard[]>([]);
  const [draftLevel, setDraftLevel] = useState<number>(1);
  const pendingLevelUps = useRef<number>(0);

  const [hudStats, setHudStats] = useState({
    hp: 100,
    maxHp: 100,
    shields: 2,
    maxShields: 2,
    level: 1,
    xp: 0,
    xpRequired: 100,
    score: 0,
    shards: 0,
    timeRemaining: 300,
    kills: 0,
    dashReady: true,
    dashCdRatio: 0,
    bossName: null as string | null,
    bossHpRatio: 0,
    isExtracting: false,
    extractionRatio: 0,
    weaponBlades: 1,
    weaponLightning: 0,
    weaponDrones: 0,
    weaponMissiles: 0,
  });

  // Internal mutable simulation state
  const simState = useRef<{
    width: number;
    height: number;
    camX: number;
    camY: number;
    screenShake: number;
    elapsedSeconds: number;
    survivalTimer: number; // 300.0s -> 0.0s
    isEndless: boolean;
    gameOverTriggered: boolean;
    autoAimEnabled: boolean;
    player: VoidPlayerState;
    enemies: VoidEnemyEntity[];
    enemyProjectiles: EnemyProjectile[];
    xpGems: XPGemEntity[];
    missiles: MissileEntity[];
    lightningArcs: LightningArc[];
    damageNumbers: FloatingDamageNumber[];
    ghostTrails: { x: number; y: number; heading: number; alpha: number; color: string }[];
    shockwaves: { x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number }[];
    stars: { x: number; y: number; size: number; alpha: number; layer: number }[];
    augmentLevels: Record<string, number>;
    droneAngle: number;
    bladeAngle: number;
    missileCooldownTimer: number;
    lightningCooldownTimer: number;
    extractionActive: boolean;
    extractionBeacon: { x: number; y: number; radius: number; progress: number; maxProgress: number };
  }>({
    width: 800,
    height: 600,
    camX: 0,
    camY: 0,
    screenShake: 0,
    elapsedSeconds: 0,
    survivalTimer: 300,
    isEndless: false,
    gameOverTriggered: false,
    autoAimEnabled: true,
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      heading: 0,
      hp: 100,
      maxHp: 100,
      shields: 2,
      maxShields: 2,
      level: 1,
      xp: 0,
      xpRequired: 100,
      speed: 220,
      magnetRadius: 90,
      dashTimer: 0,
      dashCooldownTimer: 0,
      dashVx: 0,
      dashVy: 0,
      isDashing: false,
      iframeTimer: 0,
      isExtracting: false,
      extractionProgress: 0,
      stats: {
        moveSpeedBonus: 1.0,
        damageBonus: 1.0,
        cooldownReduction: 0.0,
        magnetRadiusBonus: 1.0,
        critChance: 0.05,
        critMultiplier: 2.5,
        shieldSlots: 2,
        shieldRegenTimer: 0,
        shieldRegenRate: 14.0,
        dashCooldownMax: 1.8,
        dashDuration: 0.28,
      },
      weapons: {
        blades: {
          level: 1,
          cooldownTimer: 0,
          baseCooldown: 0,
          damage: 45,
          count: 2,
          radius: 75,
          isEvolved: false,
        },
        lightning: {
          level: 0,
          cooldownTimer: 0,
          baseCooldown: 1.2,
          damage: 55,
          count: 3,
          radius: 280,
          isEvolved: false,
        },
        drones: {
          level: 0,
          cooldownTimer: 0,
          baseCooldown: 0,
          damage: 18,
          count: 1,
          radius: 45,
          isEvolved: false,
        },
        missiles: {
          level: 0,
          cooldownTimer: 0,
          baseCooldown: 2.0,
          damage: 85,
          count: 2,
          radius: 65,
          isEvolved: false,
        },
      },
      totalKills: 0,
      totalDamageDealt: 0,
      shardsEarned: 0,
      score: 0,
    },
    enemies: [],
    enemyProjectiles: [],
    xpGems: [],
    missiles: [],
    lightningArcs: [],
    damageNumbers: [],
    ghostTrails: [],
    shockwaves: [],
    stars: [],
    augmentLevels: {
      AUG_WEAPON_BLADES: 1,
    },
    droneAngle: 0,
    bladeAngle: 0,
    missileCooldownTimer: 1.0,
    lightningCooldownTimer: 0.5,
    extractionActive: false,
    extractionBeacon: {
      x: 0,
      y: 0,
      radius: 75,
      progress: 0,
      maxProgress: 3.0,
    },
  });

  // Apply Active Fleet Vessel perks from Meta Progression on mount
  useEffect(() => {
    const vessel = ProgressionManager.getActiveVessel();
    const tech = ProgressionManager.getTechUpgrades();
    const magnetUpgrade = tech.find((t: TechUpgrade) => t.id === "TECH_MAGNET_RADIUS")?.level || 0;
    const shieldUpgrade = tech.find((t: TechUpgrade) => t.id === "TECH_SHIELD_CAPACITY")?.level || 0;

    const sim = simState.current;
    sim.player.stats.moveSpeedBonus = Math.max(0.8, vessel.speedMultiplier || 1.0);
    sim.player.shields = Math.min(6, (vessel.shieldSlots || 2) + Math.floor(shieldUpgrade / 2));
    sim.player.maxShields = sim.player.shields;
    sim.player.stats.shieldSlots = sim.player.shields;
    sim.player.stats.magnetRadiusBonus = 1.0 + magnetUpgrade * 0.25;
    sim.player.magnetRadius = 90 * sim.player.stats.magnetRadiusBonus;

    // Generate parallax stars
    const stars: { x: number; y: number; size: number; alpha: number; layer: number }[] = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 2400,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        layer: Math.floor(Math.random() * 3) + 1,
      });
    }
    sim.stars = stars;
  }, []);

  // Handle Trigger Dash
  const triggerDash = useCallback(() => {
    const sim = simState.current;
    const p = sim.player;
    if (p.dashCooldownTimer > 0 || p.isDashing || sim.gameOverTriggered) return;

    p.isDashing = true;
    p.dashTimer = p.stats.dashDuration;
    p.dashCooldownTimer = p.stats.dashCooldownMax;
    p.iframeTimer = p.stats.dashDuration + 0.15;

    // Determine dash vector
    let dirX = p.vx;
    let dirY = p.vy;
    const len = Math.sqrt(dirX * dirX + dirY * dirY);

    if (len > 10) {
      p.dashVx = (dirX / len) * 580;
      p.dashVy = (dirY / len) * 580;
    } else {
      p.dashVx = Math.cos(p.heading) * 580;
      p.dashVy = Math.sin(p.heading) * 580;
    }

    voidSound.playDashSwoosh();
    sim.screenShake = Math.max(sim.screenShake, 5);

    // Shockwave burst at dash origin
    sim.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 6,
      maxRadius: 45,
      color: shipColor || "#00F0FF",
      alpha: 1.0,
    });
  }, [shipColor]);

  // Open Draft Modal
  const triggerDraftModal = useCallback(() => {
    const sim = simState.current;
    const p = sim.player;
    const weaponLevels = {
      blades: p.weapons.blades.level,
      lightning: p.weapons.lightning.level,
      drones: p.weapons.drones.level,
      missiles: p.weapons.missiles.level,
    };

    const cards = draftRandomAugments(sim.augmentLevels, weaponLevels, 3);
    setDraftCards(cards);
    setDraftLevel(p.level);
    setIsDrafting(true);
  }, []);

  // Handle Select Augment Card
  const handleSelectAugment = (card: VoidAugmentCard) => {
    const sim = simState.current;
    const p = sim.player;

    // Apply upgrade
    sim.augmentLevels[card.id] = (sim.augmentLevels[card.id] || 0) + 1;

    // Weapon modifications
    if (card.weaponId === "BLADES") {
      p.weapons.blades.level += 1;
      p.weapons.blades.count = Math.min(6, 2 + p.weapons.blades.level);
      p.weapons.blades.damage += 15;
      if (card.category === "EVOLUTION") p.weapons.blades.isEvolved = true;
    } else if (card.weaponId === "LIGHTNING") {
      p.weapons.lightning.level = Math.max(1, p.weapons.lightning.level + 1);
      p.weapons.lightning.count = Math.min(10, 3 + p.weapons.lightning.level);
      p.weapons.lightning.damage += 20;
      p.weapons.lightning.baseCooldown = Math.max(0.5, 1.2 - p.weapons.lightning.level * 0.12);
      if (card.category === "EVOLUTION") p.weapons.lightning.isEvolved = true;
    } else if (card.weaponId === "DRONES") {
      p.weapons.drones.level = Math.max(1, p.weapons.drones.level + 1);
      p.weapons.drones.count = Math.min(4, p.weapons.drones.level);
      p.weapons.drones.damage += 12;
      if (card.category === "EVOLUTION") p.weapons.drones.isEvolved = true;
    } else if (card.weaponId === "MISSILES") {
      p.weapons.missiles.level = Math.max(1, p.weapons.missiles.level + 1);
      p.weapons.missiles.count = Math.min(8, 2 + p.weapons.missiles.level);
      p.weapons.missiles.damage += 25;
      p.weapons.missiles.radius += 10;
      if (card.category === "EVOLUTION") p.weapons.missiles.isEvolved = true;
    }

    // Stat modifications
    if (card.statBonus) {
      if (card.statBonus.moveSpeedBonus) p.stats.moveSpeedBonus += card.statBonus.moveSpeedBonus;
      if (card.statBonus.damageMult) p.stats.damageBonus += card.statBonus.damageMult;
      if (card.statBonus.cooldownReduction) p.stats.cooldownReduction += card.statBonus.cooldownReduction;
      if (card.statBonus.magnetRadiusBonus) {
        p.stats.magnetRadiusBonus += card.statBonus.magnetRadiusBonus;
        p.magnetRadius = 90 * p.stats.magnetRadiusBonus;
      }
      if (card.statBonus.maxHpBonus) {
        p.maxHp += card.statBonus.maxHpBonus;
        p.hp = Math.min(p.maxHp, p.hp + card.statBonus.maxHpBonus);
      }
      if (card.statBonus.healAmount) {
        p.hp = Math.min(p.maxHp, p.hp + card.statBonus.healAmount);
      }
      if (card.statBonus.shieldSlotsBonus) {
        p.maxShields += card.statBonus.shieldSlotsBonus;
        p.shields = p.maxShields;
      }
      if (card.statBonus.critChanceBonus) {
        p.stats.critChance += card.statBonus.critChanceBonus;
      }
    }

    setIsDrafting(false);

    // If more level-ups are queued in rapid XP collection, open next draft
    if (pendingLevelUps.current > 0) {
      pendingLevelUps.current -= 1;
      setTimeout(() => {
        triggerDraftModal();
      }, 100);
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === "Space" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        triggerDash();
      }

      if (e.code === "KeyP" || e.code === "Escape") {
        if (!isDrafting) {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerDash, isDrafting]);

  // Touch Virtual Joystick Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDrafting || isPaused) return;
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // If touch in left half, activate movement stick
    if (x < rect.width * 0.5) {
      touchStick.current = {
        active: true,
        touchId: touch.identifier,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        vectorX: 0,
        vectorY: 0,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStick.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchStick.current.touchId) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const dx = x - touchStick.current.startX;
        const dy = y - touchStick.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = 45;

        if (dist > 0) {
          const clampedDist = Math.min(dist, maxRadius);
          touchStick.current.currentX = touchStick.current.startX + (dx / dist) * clampedDist;
          touchStick.current.currentY = touchStick.current.startY + (dy / dist) * clampedDist;
          touchStick.current.vectorX = (dx / dist) * (clampedDist / maxRadius);
          touchStick.current.vectorY = (dy / dist) * (clampedDist / maxRadius);
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchStick.current.touchId) {
        touchStick.current.active = false;
        touchStick.current.touchId = null;
        touchStick.current.vectorX = 0;
        touchStick.current.vectorY = 0;
        break;
      }
    }
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      animFrameId.current = requestAnimationFrame(gameLoop);

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.1, Math.max(0.001, rawDt));

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sim = simState.current;
      const p = sim.player;

      // Handle Resize / DPR
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2.0);
      const width = rect.width || 800;
      const height = rect.height || 600;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      sim.width = width;
      sim.height = height;

      // ======================================================================
      // 1. UPDATE SIMULATION (IF NOT PAUSED / DRAFTING)
      // ======================================================================
      if (!isPaused && !isDrafting && !sim.gameOverTriggered) {
        sim.elapsedSeconds += dt;
        if (!sim.isEndless) {
          sim.survivalTimer = Math.max(0, sim.survivalTimer - dt);
        }

        // Check Extraction Protocol Activation at 0:00 (300.0s elapsed)
        if (sim.survivalTimer <= 0 && !sim.extractionActive) {
          sim.extractionActive = true;
          voidSound.playExtractionSiren();
        }

        // Extraction Beacon Charging
        if (sim.extractionActive) {
          const beacon = sim.extractionBeacon;
          const distToBeacon = Math.sqrt((p.x - beacon.x) ** 2 + (p.y - beacon.y) ** 2);

          if (distToBeacon <= beacon.radius) {
            p.isExtracting = true;
            beacon.progress += dt;
            p.extractionProgress = beacon.progress;

            if (beacon.progress >= beacon.maxProgress) {
              // Extraction Victory!
              sim.gameOverTriggered = true;
              voidSound.playExtractionVictory();
              p.shardsEarned += 500;
              p.score += 25000;
              onShardsCollected(p.shardsEarned);
              onScoreUpdate(p.score);
              onGameOver(Math.floor(sim.elapsedSeconds), p.score, true);
            }
          } else {
            p.isExtracting = false;
            // Decay progress when leaving beacon
            beacon.progress = Math.max(0, beacon.progress - dt * 1.5);
            p.extractionProgress = beacon.progress;
          }
        }

        // Process Player Movement Inputs (WASD + Arrows + Virtual Stick)
        let moveX = 0;
        let moveY = 0;
        const k = keysPressed.current;
        if (k["KeyW"] || k["ArrowUp"]) moveY -= 1;
        if (k["KeyS"] || k["ArrowDown"]) moveY += 1;
        if (k["KeyA"] || k["ArrowLeft"]) moveX -= 1;
        if (k["KeyD"] || k["ArrowRight"]) moveX += 1;

        if (touchStick.current.active) {
          moveX += touchStick.current.vectorX;
          moveY += touchStick.current.vectorY;
        }

        const inputMag = Math.sqrt(moveX * moveX + moveY * moveY);
        const normDirX = inputMag > 0 ? moveX / Math.max(1, inputMag) : 0;
        const normDirY = inputMag > 0 ? moveY / Math.max(1, inputMag) : 0;

        // Player Dash Physics
        if (p.isDashing) {
          p.dashTimer -= dt;
          p.x += p.dashVx * dt;
          p.y += p.dashVy * dt;

          // Emit ghost phantom trail
          if (Math.random() < 0.6) {
            sim.ghostTrails.push({
              x: p.x,
              y: p.y,
              heading: p.heading,
              alpha: 0.8,
              color: shipColor || "#00F0FF",
            });
          }

          if (p.dashTimer <= 0) {
            p.isDashing = false;
            p.vx = p.dashVx * 0.35;
            p.vy = p.dashVy * 0.35;
          }
        } else {
          // Standard Inertia Vector Kinematics
          const accel = 650 * p.stats.moveSpeedBonus;
          const friction = 7.5;
          p.vx += normDirX * accel * dt;
          p.vy += normDirY * accel * dt;
          p.vx *= 1 - friction * dt;
          p.vy *= 1 - friction * dt;

          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const topSpeed = p.speed * p.stats.moveSpeedBonus;
          if (currentSpeed > topSpeed) {
            p.vx = (p.vx / currentSpeed) * topSpeed;
            p.vy = (p.vy / currentSpeed) * topSpeed;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        // Dash cooldown timer
        if (p.dashCooldownTimer > 0) {
          p.dashCooldownTimer = Math.max(0, p.dashCooldownTimer - dt);
        }

        // Invulnerability frames timer
        if (p.iframeTimer > 0) {
          p.iframeTimer = Math.max(0, p.iframeTimer - dt);
        }

        // Shield passive regeneration
        if (p.shields < p.maxShields) {
          p.stats.shieldRegenTimer += dt;
          if (p.stats.shieldRegenTimer >= p.stats.shieldRegenRate) {
            p.stats.shieldRegenTimer = 0;
            p.shields = Math.min(p.maxShields, p.shields + 1);
            voidSound.playShieldDeflect();
          }
        }

        // Arena boundary clamping and shockwave bounce
        const limit = ARENA_HALF_SIZE - 20;
        if (Math.abs(p.x) > limit) {
          p.x = Math.sign(p.x) * limit;
          p.vx = -p.vx * 0.5;
          sim.shockwaves.push({
            x: p.x,
            y: p.y,
            radius: 8,
            maxRadius: 50,
            color: "#FF3366",
            alpha: 1.0,
          });
          sim.screenShake = Math.max(sim.screenShake, 4);
        }
        if (Math.abs(p.y) > limit) {
          p.y = Math.sign(p.y) * limit;
          p.vy = -p.vy * 0.5;
          sim.shockwaves.push({
            x: p.x,
            y: p.y,
            radius: 8,
            maxRadius: 50,
            color: "#FF3366",
            alpha: 1.0,
          });
          sim.screenShake = Math.max(sim.screenShake, 4);
        }

        // Calculate heading angle
        if (inputMag > 0.1) {
          p.heading = Math.atan2(normDirY, normDirX);
        }

        // Rebuild Spatial Hash Grid
        spatialHash.current.populate(sim.enemies);
        spatialHash.current.resolveSoftRepulsion(sim.enemies);

        // Update Horde Wave Director (Spawns, Boss events, Enemy AI, Enemy Projectiles)
        waveDirector.current.update(
          dt,
          sim.elapsedSeconds,
          p,
          sim.enemies,
          sim.enemyProjectiles,
          (bossName: string) => {
            sim.screenShake = 16;
            sim.damageNumbers.push({
              id: "dmg_boss_alert_" + Math.random(),
              x: p.x,
              y: p.y - 60,
              vx: 0,
              vy: -15,
              text: `[WARNING: ${bossName} DETECTED]`,
              color: "#FFE600",
              alpha: 1.0,
              scale: 1.4,
              life: 0,
              maxLife: 2.5,
              isCrit: true,
            });
          }
        );

        // ====================================================================
        // WEAPON SYSTEM 1: ORBITING PLASMA BLADES
        // ====================================================================
        const blades = p.weapons.blades;
        if (blades.level > 0) {
          const rotationSpeed = blades.isEvolved ? 5.5 : 3.5;
          sim.bladeAngle += rotationSpeed * dt;
          const bladeCount = blades.count;
          const orbitDist = blades.radius;

          for (let i = 0; i < bladeCount; i++) {
            const angle = sim.bladeAngle + (i * Math.PI * 2) / bladeCount;
            const bx = p.x + Math.cos(angle) * orbitDist;
            const by = p.y + Math.sin(angle) * orbitDist;

            // Query spatial hash for enemy collisions
            const hits = spatialHash.current.queryRadius(bx, by, 16);
            for (let h = 0; h < hits.length; h++) {
              const enemy = hits[h];
              if (enemy.iframeTimer <= 0) {
                enemy.iframeTimer = 0.25; // 250ms hit cooldown
                const isCrit = Math.random() < p.stats.critChance;
                const dmg = Math.round(
                  blades.damage * p.stats.damageBonus * (isCrit ? p.stats.critMultiplier : 1.0)
                );
                enemy.hp -= dmg;
                p.totalDamageDealt += dmg;
                p.score += dmg * 2;

                voidSound.playBladeSlice();
                sim.damageNumbers.push({
                  id: "dmg_" + Math.random(),
                  x: enemy.x,
                  y: enemy.y - 12,
                  vx: (Math.random() - 0.5) * 20,
                  vy: -30,
                  text: `${isCrit ? "[CRIT] " : ""}${dmg}`,
                  color: isCrit ? "#FFE600" : "#00F0FF",
                  alpha: 1.0,
                  scale: isCrit ? 1.3 : 1.0,
                  life: 0,
                  maxLife: 0.65,
                  isCrit,
                });
              }
            }
          }
        }

        // ====================================================================
        // WEAPON SYSTEM 2: FRACTAL CHAIN LIGHTNING
        // ====================================================================
        const lightning = p.weapons.lightning;
        if (lightning.level > 0) {
          sim.lightningCooldownTimer -= dt;
          const ltgCooldown = lightning.baseCooldown * (1 - p.stats.cooldownReduction);

          if (sim.lightningCooldownTimer <= 0) {
            sim.lightningCooldownTimer = ltgCooldown;

            // Find primary target within search radius
            const primary = spatialHash.current.getNearest(p.x, p.y, lightning.radius);
            if (primary) {
              voidSound.playChainLightningZap();
              const jumpTargets: VoidEnemyEntity[] = [primary.enemy];
              const seenTargetIds = new Set<string>([primary.enemy.id]);

              const maxJumps = lightning.count;
              let currentTarget = primary.enemy;

              for (let j = 1; j < maxJumps; j++) {
                const next = spatialHash.current.getNearest(
                  currentTarget.x,
                  currentTarget.y,
                  170,
                  seenTargetIds
                );
                if (!next) break;
                seenTargetIds.add(next.enemy.id);
                jumpTargets.push(next.enemy);
                currentTarget = next.enemy;
              }

              // Apply damage and construct fractal lightning arcs
              const arcPoints: { x: number; y: number }[] = [{ x: p.x, y: p.y }];
              for (let t = 0; t < jumpTargets.length; t++) {
                const target = jumpTargets[t];
                const isCrit = Math.random() < p.stats.critChance;
                const dmg = Math.round(
                  lightning.damage * p.stats.damageBonus * (isCrit ? p.stats.critMultiplier : 1.0)
                );
                target.hp -= dmg;
                p.totalDamageDealt += dmg;
                p.score += dmg * 3;

                arcPoints.push({ x: target.x, y: target.y });
                sim.damageNumbers.push({
                  id: "dmg_ltg_" + Math.random(),
                  x: target.x,
                  y: target.y - 14,
                  vx: (Math.random() - 0.5) * 20,
                  vy: -35,
                  text: `${isCrit ? "[CRIT] " : ""}${dmg}`,
                  color: isCrit ? "#FFE600" : "#BF00FF",
                  alpha: 1.0,
                  scale: isCrit ? 1.3 : 1.0,
                  life: 0,
                  maxLife: 0.65,
                  isCrit,
                });
              }

              sim.lightningArcs.push({
                points: arcPoints,
                branches: [],
                life: 0,
                maxLife: 0.22,
                color: lightning.isEvolved ? "#FFE600" : "#00F0FF",
              });
            }
          }
        }

        // ====================================================================
        // WEAPON SYSTEM 3: AUTONOMOUS LASER DRONES
        // ====================================================================
        const drones = p.weapons.drones;
        if (drones.level > 0) {
          sim.droneAngle += 2.0 * dt;
          const droneCount = drones.count;

          for (let d = 0; d < droneCount; d++) {
            const dAngle = sim.droneAngle + (d * Math.PI * 2) / droneCount;
            const droneX = p.x + Math.cos(dAngle) * drones.radius;
            const droneY = p.y + Math.sin(dAngle) * drones.radius;

            const target = spatialHash.current.getNearest(droneX, droneY, 320);
            if (target) {
              // Apply DOT damage tick
              const isCrit = Math.random() < p.stats.critChance;
              const dmg = Math.round(
                drones.damage * p.stats.damageBonus * (isCrit ? p.stats.critMultiplier : 1.0) * dt * 8
              );
              if (dmg > 0) {
                target.enemy.hp -= dmg;
                p.totalDamageDealt += dmg;
                p.score += dmg;
                if (Math.random() < 0.2) {
                  voidSound.playDroneLaserPulse();
                }
              }
            }
          }
        }

        // ====================================================================
        // WEAPON SYSTEM 4: HOMING MISSILE CLUSTERS
        // ====================================================================
        const missiles = p.weapons.missiles;
        if (missiles.level > 0) {
          sim.missileCooldownTimer -= dt;
          const mslCooldown = missiles.baseCooldown * (1 - p.stats.cooldownReduction);

          if (sim.missileCooldownTimer <= 0) {
            sim.missileCooldownTimer = mslCooldown;
            const salvoCount = missiles.count;
            voidSound.playMissileLaunch();

            for (let m = 0; m < salvoCount; m++) {
              const spreadAngle = p.heading + (m - (salvoCount - 1) / 2) * 0.4;
              const initialSpeed = 160;
              sim.missiles.push({
                id: "msl_" + Math.random(),
                x: p.x,
                y: p.y,
                vx: Math.cos(spreadAngle) * initialSpeed,
                vy: Math.sin(spreadAngle) * initialSpeed,
                targetEnemyId: null,
                life: 0,
                maxLife: 2.8,
                damage: missiles.damage,
                aoeRadius: missiles.radius,
                speed: 340,
                smokeTimer: 0,
              });
            }
          }
        }

        // Update Missiles
        for (let i = sim.missiles.length - 1; i >= 0; i--) {
          const m = sim.missiles[i];
          m.life += dt;

          // Find nearest enemy for Proportional Navigation homing
          const nearest = spatialHash.current.getNearest(m.x, m.y, 350);
          if (nearest) {
            const dx = nearest.enemy.x - m.x;
            const dy = nearest.enemy.y - m.y;
            const targetAngle = Math.atan2(dy, dx);
            const currentAngle = Math.atan2(m.vy, m.vx);
            let diff = targetAngle - currentAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            const turnSpeed = 6.0;
            const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed * dt);
            m.vx = Math.cos(newAngle) * m.speed;
            m.vy = Math.sin(newAngle) * m.speed;
          }

          m.x += m.vx * dt;
          m.y += m.vy * dt;

          // Check direct proximity or expiry detonation
          let shouldDetonate = m.life >= m.maxLife;
          if (!shouldDetonate) {
            const hitEnemy = spatialHash.current.queryRadius(m.x, m.y, 14);
            if (hitEnemy.length > 0) shouldDetonate = true;
          }

          if (shouldDetonate) {
            sim.missiles.splice(i, 1);
            voidSound.playMissileExplosion();
            sim.screenShake = Math.max(sim.screenShake, 8);

            // AOE Damage query
            const aoeHits = spatialHash.current.queryRadius(m.x, m.y, m.aoeRadius);
            for (let h = 0; h < aoeHits.length; h++) {
              const enemy = aoeHits[h];
              const isCrit = Math.random() < p.stats.critChance;
              const dmg = Math.round(
                m.damage * p.stats.damageBonus * (isCrit ? p.stats.critMultiplier : 1.0)
              );
              enemy.hp -= dmg;
              p.totalDamageDealt += dmg;
              p.score += dmg * 2;

              sim.damageNumbers.push({
                id: "dmg_aoe_" + Math.random(),
                x: enemy.x,
                y: enemy.y - 12,
                vx: (Math.random() - 0.5) * 30,
                vy: -35,
                text: `${isCrit ? "[CRIT] " : ""}${dmg}`,
                color: isCrit ? "#FFE600" : "#FF3366",
                alpha: 1.0,
                scale: isCrit ? 1.4 : 1.1,
                life: 0,
                maxLife: 0.7,
                isCrit,
              });
            }

            // Explosion visual shockwave
            sim.shockwaves.push({
              x: m.x,
              y: m.y,
              radius: 8,
              maxRadius: m.aoeRadius,
              color: "#FF9900",
              alpha: 1.0,
            });
          }
        }

        // ====================================================================
        // ENEMY CASUALTIES & XP GEM REAPING
        // ====================================================================
        for (let i = sim.enemies.length - 1; i >= 0; i--) {
          const e = sim.enemies[i];
          if (e.hp <= 0) {
            p.totalKills += 1;
            p.score += e.xpValue * 10;
            if (e.shardsValue > 0) {
              p.shardsEarned += e.shardsValue;
              onShardsCollected(p.shardsEarned);
            }

            // Drop XP Gem
            waveDirector.current.dropGemForEnemy(e, sim.xpGems);
            sim.enemies.splice(i, 1);
          }
        }

        // Consolidate distant overflow gems to guarantee 60 FPS
        waveDirector.current.consolidateGems(p, sim.xpGems);

        // Update XP Gem Magnetics
        const effMagnetRadius = p.magnetRadius;
        for (let i = sim.xpGems.length - 1; i >= 0; i--) {
          const g = sim.xpGems[i];
          const dx = p.x - g.x;
          const dy = p.y - g.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= effMagnetRadius) {
            g.isAttracted = true;
          }

          if (g.isAttracted) {
            g.pursuitTimer += dt;
            const accel = 350 + 120 * g.pursuitTimer * g.pursuitTimer;
            const nx = dist > 0 ? dx / dist : 0;
            const ny = dist > 0 ? dy / dist : 0;
            g.vx += nx * accel * dt;
            g.vy += ny * accel * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;

            // Harvest gem
            if (dist <= 18) {
              p.xp += g.value;
              p.score += g.value * 5;
              voidSound.playXPGemChime();
              sim.xpGems.splice(i, 1);

              // Level up check
              if (p.xp >= p.xpRequired) {
                p.xp -= p.xpRequired;
                p.level += 1;
                p.xpRequired = Math.floor(60 * Math.pow(p.level, 1.45) + 40);
                voidSound.playLevelUpFanfare();
                if (onLevelUp) onLevelUp(p.level);

                if (!isDrafting) {
                  triggerDraftModal();
                } else {
                  pendingLevelUps.current += 1;
                }
              }
            }
          } else {
            // Passive friction scatter
            g.vx *= 1 - 4.0 * dt;
            g.vy *= 1 - 4.0 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
          }
        }

        // ====================================================================
        // PLAYER DAMAGE & COLLISION DETECTION
        // ====================================================================
        if (p.iframeTimer <= 0) {
          // Check enemy physical contact
          const nearbyEnemies = spatialHash.current.queryRadius(p.x, p.y, 16);
          if (nearbyEnemies.length > 0) {
            const e = nearbyEnemies[0];
            if (p.shields > 0) {
              p.shields -= 1;
              p.iframeTimer = 0.65;
              voidSound.playShieldDeflect();
              sim.screenShake = Math.max(sim.screenShake, 8);
              sim.shockwaves.push({
                x: p.x,
                y: p.y,
                radius: 12,
                maxRadius: 60,
                color: "#00F0FF",
                alpha: 1.0,
              });
            } else {
              p.hp -= e.damage;
              p.iframeTimer = 0.5;
              voidSound.playPlayerHit();
              sim.screenShake = Math.max(sim.screenShake, 15);
              sim.shockwaves.push({
                x: p.x,
                y: p.y,
                radius: 10,
                maxRadius: 50,
                color: "#FF3366",
                alpha: 1.0,
              });

              if (p.hp <= 0) {
                p.hp = 0;
                sim.gameOverTriggered = true;
                onGameOver(Math.floor(sim.elapsedSeconds), p.score, false);
              }
            }
          }

          // Check enemy projectiles
          for (let i = sim.enemyProjectiles.length - 1; i >= 0; i--) {
            const ep = sim.enemyProjectiles[i];
            const dx = p.x - ep.x;
            const dy = p.y - ep.y;
            if (dx * dx + dy * dy <= (14 + ep.radius) ** 2) {
              sim.enemyProjectiles.splice(i, 1);
              if (p.shields > 0) {
                p.shields -= 1;
                p.iframeTimer = 0.55;
                voidSound.playShieldDeflect();
                sim.screenShake = Math.max(sim.screenShake, 7);
              } else {
                p.hp -= ep.damage;
                p.iframeTimer = 0.45;
                voidSound.playPlayerHit();
                sim.screenShake = Math.max(sim.screenShake, 14);
                if (p.hp <= 0) {
                  p.hp = 0;
                  sim.gameOverTriggered = true;
                  onGameOver(Math.floor(sim.elapsedSeconds), p.score, false);
                }
              }
              break;
            }
          }
        }

        // Camera smoothly tracks player
        const camEase = 6.5;
        sim.camX += (p.x - sim.camX) * camEase * dt;
        sim.camY += (p.y - sim.camY) * camEase * dt;

        // Screen shake decay
        sim.screenShake = Math.max(0, sim.screenShake * Math.pow(0.88, dt * 60));

        // Update Floating Damage Numbers
        for (let i = sim.damageNumbers.length - 1; i >= 0; i--) {
          const dn = sim.damageNumbers[i];
          dn.life += dt;
          dn.x += dn.vx * dt;
          dn.y += dn.vy * dt;
          dn.alpha = Math.max(0, 1.0 - dn.life / dn.maxLife);
          if (dn.life >= dn.maxLife) {
            sim.damageNumbers.splice(i, 1);
          }
        }

        // Update Shockwaves
        for (let i = sim.shockwaves.length - 1; i >= 0; i--) {
          const sw = sim.shockwaves[i];
          sw.radius += (sw.maxRadius - sw.radius) * 12 * dt;
          sw.alpha = Math.max(0, 1.0 - sw.radius / sw.maxRadius);
          if (sw.radius >= sw.maxRadius * 0.95) {
            sim.shockwaves.splice(i, 1);
          }
        }

        // Update Ghost Trails
        for (let i = sim.ghostTrails.length - 1; i >= 0; i--) {
          const gt = sim.ghostTrails[i];
          gt.alpha -= dt * 3.5;
          if (gt.alpha <= 0) {
            sim.ghostTrails.splice(i, 1);
          }
        }

        // Update Lightning Arcs
        for (let i = sim.lightningArcs.length - 1; i >= 0; i--) {
          const arc = sim.lightningArcs[i];
          arc.life += dt;
          if (arc.life >= arc.maxLife) {
            sim.lightningArcs.splice(i, 1);
          }
        }

        // Update Score & React HUD State periodically
        onScoreUpdate(p.score);
        setHudStats({
          hp: p.hp,
          maxHp: p.maxHp,
          shields: p.shields,
          maxShields: p.maxShields,
          level: p.level,
          xp: p.xp,
          xpRequired: p.xpRequired,
          score: p.score,
          shards: p.shardsEarned,
          timeRemaining: Math.max(0, Math.floor(sim.survivalTimer)),
          kills: p.totalKills,
          dashReady: p.dashCooldownTimer <= 0,
          dashCdRatio: p.dashCooldownTimer / p.stats.dashCooldownMax,
          bossName: waveDirector.current.activeBossName,
          bossHpRatio: waveDirector.current.activeBossHpRatio,
          isExtracting: p.isExtracting,
          extractionRatio: sim.extractionBeacon.progress / sim.extractionBeacon.maxProgress,
          weaponBlades: p.weapons.blades.level,
          weaponLightning: p.weapons.lightning.level,
          weaponDrones: p.weapons.drones.level,
          weaponMissiles: p.weapons.missiles.level,
        });
      }

      // ======================================================================
      // 2. RENDER PIPELINE (CANVAS 2D)
      // ======================================================================
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear Canvas Buffer
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Camera Offset + Screen Shake
      const shakeX = (Math.random() - 0.5) * sim.screenShake;
      const shakeY = (Math.random() - 0.5) * sim.screenShake;
      const originX = width * 0.5 - sim.camX + shakeX;
      const originY = height * 0.5 - sim.camY + shakeY;

      // 2.1 Parallax Starfield Backdrop
      for (let i = 0; i < sim.stars.length; i++) {
        const s = sim.stars[i];
        const parallaxFactor = s.layer * 0.15;
        const sx = ((s.x - sim.camX * parallaxFactor + 3000) % 2400) - 1200 + width * 0.5;
        const sy = ((s.y - sim.camY * parallaxFactor + 3000) % 2400) - 1200 + height * 0.5;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          ctx.fillStyle = s.layer === 3 ? "rgba(0, 240, 255, 0.8)" : `rgba(255, 255, 255, ${s.alpha})`;
          ctx.fillRect(sx, sy, s.size, s.size);
        }
      }

      // 2.2 Cyber Grid Floor
      const gridStep = 64;
      const startGridX = Math.floor((-ARENA_HALF_SIZE) / gridStep) * gridStep;
      const endGridX = Math.ceil(ARENA_HALF_SIZE / gridStep) * gridStep;
      const startGridY = Math.floor((-ARENA_HALF_SIZE) / gridStep) * gridStep;
      const endGridY = Math.ceil(ARENA_HALF_SIZE / gridStep) * gridStep;

      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = startGridX; gx <= endGridX; gx += gridStep) {
        ctx.moveTo(gx + originX, -ARENA_HALF_SIZE + originY);
        ctx.lineTo(gx + originX, ARENA_HALF_SIZE + originY);
      }
      for (let gy = startGridY; gy <= endGridY; gy += gridStep) {
        ctx.moveTo(-ARENA_HALF_SIZE + originX, gy + originY);
        ctx.lineTo(ARENA_HALF_SIZE + originX, gy + originY);
      }
      ctx.stroke();

      // 2.3 Arena Perimeter Shockwave Walls
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 12;
      ctx.strokeRect(
        -ARENA_HALF_SIZE + originX,
        -ARENA_HALF_SIZE + originY,
        ARENA_HALF_SIZE * 2,
        ARENA_HALF_SIZE * 2
      );
      ctx.shadowBlur = 0;

      // 2.4 Extraction Warp Beacon (If Active)
      if (sim.extractionActive) {
        const beacon = sim.extractionBeacon;
        const bx = beacon.x + originX;
        const by = beacon.y + originY;
        const pulse = 1.0 + Math.sin(sim.elapsedSeconds * 6) * 0.15;

        // Outer Beacon Ring
        ctx.strokeStyle = "#39FF14";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#39FF14";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(bx, by, beacon.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Extraction Charge Arc
        ctx.fillStyle = "rgba(57, 255, 20, 0.15)";
        ctx.beginPath();
        ctx.arc(bx, by, beacon.radius, 0, Math.PI * 2);
        ctx.fill();

        if (beacon.progress > 0) {
          const progressAngle = (beacon.progress / beacon.maxProgress) * Math.PI * 2;
          ctx.strokeStyle = "#FFE600";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(bx, by, beacon.radius + 6, -Math.PI / 2, -Math.PI / 2 + progressAngle);
          ctx.stroke();
        }

        ctx.fillStyle = "#39FF14";
        ctx.font = "800 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("[WARP BEACON]", bx, by - beacon.radius - 12);
        ctx.shadowBlur = 0;
      }

      // 2.5 XP Gems
      for (let i = 0; i < sim.xpGems.length; i++) {
        const g = sim.xpGems[i];
        const gx = g.x + originX;
        const gy = g.y + originY;

        if (gx < -20 || gx > width + 20 || gy < -20 || gy > height + 20) continue;

        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        // Diamond gem geometry
        ctx.moveTo(gx, gy - g.radius);
        ctx.lineTo(gx + g.radius, gy);
        ctx.lineTo(gx, gy + g.radius);
        ctx.lineTo(gx - g.radius, gy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2.6 Shockwave Rings
      for (let i = 0; i < sim.shockwaves.length; i++) {
        const sw = sim.shockwaves[i];
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x + originX, sw.y + originY, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 2.7 Enemy Entities
      for (let i = 0; i < sim.enemies.length; i++) {
        const e = sim.enemies[i];
        const ex = e.x + originX;
        const ey = e.y + originY;

        if (ex < -40 || ex > width + 40 || ey < -40 || ey > height + 40) continue;

        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(e.angle);

        // Flash white on hit
        if (e.iframeTimer > 0) {
          ctx.fillStyle = "#FFFFFF";
        } else {
          ctx.fillStyle = e.color;
        }

        ctx.shadowColor = e.color;
        ctx.shadowBlur = e.isBoss ? 16 : 8;

        if (e.type === "MITE") {
          // Sharp triangular swarm crawler
          ctx.beginPath();
          ctx.moveTo(e.radius * 1.2, 0);
          ctx.lineTo(-e.radius * 0.8, e.radius * 0.8);
          ctx.lineTo(-e.radius * 0.4, 0);
          ctx.lineTo(-e.radius * 0.8, -e.radius * 0.8);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === "STALKER") {
          // Diamond tracking hull
          ctx.beginPath();
          ctx.moveTo(e.radius * 1.3, 0);
          ctx.lineTo(0, e.radius * 0.9);
          ctx.lineTo(-e.radius * 1.1, 0);
          ctx.lineTo(0, -e.radius * 0.9);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === "SPITTER") {
          // Hexagonal turret ship
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const a = (s * Math.PI) / 3;
            const sx = Math.cos(a) * e.radius;
            const sy = Math.sin(a) * e.radius;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (e.type === "GOLIATH") {
          // Heavy octagonal armored fortress
          ctx.beginPath();
          for (let s = 0; s < 8; s++) {
            const a = (s * Math.PI) / 4;
            const sx = Math.cos(a) * e.radius;
            const sy = Math.sin(a) * e.radius;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (e.isBoss) {
          // Boss: Multi-layer menacing core with outer rotating rings
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // Boss Health Bar above entity
        if (e.isBoss && e.hp > 0) {
          const barW = e.radius * 2.2;
          const hpRatio = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          ctx.fillRect(ex - barW * 0.5, ey - e.radius - 14, barW, 5);
          ctx.fillStyle = "#FF3366";
          ctx.fillRect(ex - barW * 0.5, ey - e.radius - 14, barW * hpRatio, 5);
        }
      }

      // 2.8 Enemy Projectiles
      for (let i = 0; i < sim.enemyProjectiles.length; i++) {
        const ep = sim.enemyProjectiles[i];
        const epx = ep.x + originX;
        const epy = ep.y + originY;

        ctx.fillStyle = ep.color;
        ctx.shadowColor = ep.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(epx, epy, ep.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2.9 Homing Missiles
      for (let i = 0; i < sim.missiles.length; i++) {
        const m = sim.missiles[i];
        const mx = m.x + originX;
        const my = m.y + originY;
        const angle = Math.atan2(m.vy, m.vx);

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.fillStyle = "#FF9900";
        ctx.shadowColor = "#FF9900";
        ctx.shadowBlur = 8;
        ctx.fillRect(-8, -2.5, 16, 5);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(4, -1.5, 4, 3);
        ctx.restore();
      }

      // 2.10 Fractal Chain Lightning Arcs
      for (let i = 0; i < sim.lightningArcs.length; i++) {
        const arc = sim.lightningArcs[i];
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();

        for (let pIdx = 0; pIdx < arc.points.length; pIdx++) {
          const pt = arc.points[pIdx];
          const px = pt.x + originX;
          const py = pt.y + originY;

          if (pIdx === 0) {
            ctx.moveTo(px, py);
          } else {
            // Midpoint displacement zig-zag
            const prevPt = arc.points[pIdx - 1];
            const prevX = prevPt.x + originX;
            const prevY = prevPt.y + originY;
            const midX = (prevX + px) * 0.5 + (Math.random() - 0.5) * 18;
            const midY = (prevY + py) * 0.5 + (Math.random() - 0.5) * 18;
            ctx.lineTo(midX, midY);
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 2.11 Autonomous Laser Drones & Beams
      const drones = p.weapons.drones;
      if (drones.level > 0) {
        const droneCount = drones.count;
        for (let d = 0; d < droneCount; d++) {
          const dAngle = sim.droneAngle + (d * Math.PI * 2) / droneCount;
          const dx = p.x + Math.cos(dAngle) * drones.radius + originX;
          const dy = p.y + Math.sin(dAngle) * drones.radius + originY;

          // Drone satellite body
          ctx.fillStyle = "#00F0FF";
          ctx.shadowColor = "#00F0FF";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(dx, dy, 5, 0, Math.PI * 2);
          ctx.fill();

          // Continuous beam to nearest target
          const target = spatialHash.current.getNearest(
            p.x + Math.cos(dAngle) * drones.radius,
            p.y + Math.sin(dAngle) * drones.radius,
            320
          );
          if (target) {
            const tx = target.enemy.x + originX;
            const ty = target.enemy.y + originY;

            ctx.strokeStyle = drones.isEvolved ? "#FFE600" : "#00F0FF";
            ctx.lineWidth = drones.isEvolved ? 3.5 : 2.0;
            ctx.shadowColor = drones.isEvolved ? "#FFE600" : "#00F0FF";
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(dx, dy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
      }

      // 2.12 Player Ghost Echoes (Dash Trails)
      for (let i = 0; i < sim.ghostTrails.length; i++) {
        const gt = sim.ghostTrails[i];
        ctx.save();
        ctx.translate(gt.x + originX, gt.y + originY);
        ctx.rotate(gt.heading);
        ctx.globalAlpha = gt.alpha * 0.4;
        ctx.strokeStyle = gt.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // 2.13 Player Vessel
      const px = p.x + originX;
      const py = p.y + originY;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.heading);

      // Flashing invulnerability frames
      if (p.iframeTimer > 0 && Math.floor(sim.elapsedSeconds * 20) % 2 === 0) {
        ctx.fillStyle = "#FFFFFF";
      } else {
        ctx.fillStyle = shipColor || "#00F0FF";
      }

      ctx.shadowColor = shipColor || "#00F0FF";
      ctx.shadowBlur = 14;

      // High-precision delta wing vessel geometry
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-12, 11);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-12, -11);
      ctx.closePath();
      ctx.fill();

      // Energy shield aura
      if (p.shields > 0) {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 2.14 Orbiting Plasma Blades
      const blades = p.weapons.blades;
      if (blades.level > 0) {
        const bladeCount = blades.count;
        const orbitDist = blades.radius;

        for (let i = 0; i < bladeCount; i++) {
          const bAngle = sim.bladeAngle + (i * Math.PI * 2) / bladeCount;
          const bx = px + Math.cos(bAngle) * orbitDist;
          const by = py + Math.sin(bAngle) * orbitDist;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(bAngle + Math.PI / 2);

          ctx.fillStyle = blades.isEvolved ? "#FFE600" : "#00F0FF";
          ctx.shadowColor = blades.isEvolved ? "#FFE600" : "#00F0FF";
          ctx.shadowBlur = 14;

          // Curved scythe blade
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.quadraticCurveTo(0, 6, -14, 0);
          ctx.quadraticCurveTo(0, -6, 14, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      // 2.15 Floating Combat Typography
      for (let i = 0; i < sim.damageNumbers.length; i++) {
        const dn = sim.damageNumbers[i];
        ctx.save();
        ctx.globalAlpha = dn.alpha;
        ctx.fillStyle = dn.color;
        ctx.font = `${dn.isCrit ? "900" : "700"} ${Math.round(13 * dn.scale)}px monospace`;
        ctx.textAlign = "center";
        ctx.shadowColor = dn.color;
        ctx.shadowBlur = dn.isCrit ? 10 : 4;
        ctx.fillText(dn.text, dn.x + originX, dn.y + originY);
        ctx.restore();
      }

      ctx.restore();
    };

    animFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPaused, isDrafting, onGameOver, onLevelUp, onScoreUpdate, onShardsCollected, shipColor, triggerDraftModal]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.canvasWrapper} ref={containerRef}>
      {/* Top Floating HUD Overlay */}
      <div
        style={{
          position: "absolute",
          top: "0.75rem",
          left: "0.75rem",
          right: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pointerEvents: "none",
          zIndex: 10,
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {/* Top Left: Vessel Core Status */}
        <div
          className="glass"
          style={{
            padding: "0.5rem 0.85rem",
            borderRadius: "10px",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            background: "rgba(11, 15, 25, 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#39FF14" }}>
              [VESSEL LEVEL {hudStats.level}]
            </span>
            <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
              KILLS: {hudStats.kills}
            </span>
          </div>

          {/* HP Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#FF3366", width: "24px" }}>
              [HP]
            </span>
            <div
              style={{
                width: "120px",
                height: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(255, 51, 102, 0.3)",
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, (hudStats.hp / hudStats.maxHp) * 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #FF3366, #FF6699)",
                  transition: "width 0.15s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "0.65rem", color: "#F8FAFC", fontFamily: "monospace" }}>
              {hudStats.hp}/{hudStats.maxHp}
            </span>
          </div>

          {/* Shields Pips */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#00F0FF", width: "24px" }}>
              [SHD]
            </span>
            <div style={{ display: "flex", gap: "3px" }}>
              {Array.from({ length: hudStats.maxShields }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "14px",
                    height: "6px",
                    borderRadius: "2px",
                    background: i < hudStats.shields ? "#00F0FF" : "rgba(148, 163, 184, 0.2)",
                    boxShadow: i < hudStats.shields ? "0 0 6px #00F0FF" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Center: Survival Countdown Clock & Extraction Alert */}
        <div
          className="glass"
          style={{
            padding: "0.5rem 1.1rem",
            borderRadius: "10px",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(11, 15, 25, 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8" }}>
            [SURVIVAL PROTOCOL]
          </span>
          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              fontFamily: "monospace",
              color: hudStats.timeRemaining <= 30 ? "#FF3366" : "#00F0FF",
              textShadow: "0 0 12px rgba(0, 240, 255, 0.5)",
            }}
          >
            {formatTime(hudStats.timeRemaining)}
          </span>

          {hudStats.isExtracting && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginTop: "2px" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#39FF14" }}>
                [EXTRACTING: {Math.round(hudStats.extractionRatio * 100)}%]
              </span>
              <div
                style={{
                  width: "100px",
                  height: "4px",
                  background: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${hudStats.extractionRatio * 100}%`,
                    height: "100%",
                    background: "#39FF14",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Weapons Matrix & Telemetry */}
        <div
          className="glass"
          style={{
            padding: "0.5rem 0.85rem",
            borderRadius: "10px",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            background: "rgba(11, 15, 25, 0.85)",
            backdropFilter: "blur(12px)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#FFE600", fontFamily: "monospace" }}>
              SCORE: {hudStats.score.toLocaleString()}
            </span>
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                borderRadius: "4px",
                color: "#00F0FF",
                fontSize: "0.65rem",
                fontWeight: 800,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              {isPaused ? "[RESUME]" : "[PAUSE]"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.35rem", fontSize: "0.65rem", fontFamily: "monospace" }}>
            <span style={{ color: hudStats.weaponBlades > 0 ? "#00F0FF" : "#64748B" }}>
              [BLD L{hudStats.weaponBlades}]
            </span>
            <span style={{ color: hudStats.weaponLightning > 0 ? "#BF00FF" : "#64748B" }}>
              [LTG L{hudStats.weaponLightning}]
            </span>
            <span style={{ color: hudStats.weaponDrones > 0 ? "#39FF14" : "#64748B" }}>
              [DRN L{hudStats.weaponDrones}]
            </span>
            <span style={{ color: hudStats.weaponMissiles > 0 ? "#FF9900" : "#64748B" }}>
              [MSL L{hudStats.weaponMissiles}]
            </span>
          </div>
        </div>
      </div>

      {/* Boss Active Warning Bar */}
      {hudStats.bossName && (
        <div
          style={{
            position: "absolute",
            top: "4.8rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: "400px",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#FFE600", letterSpacing: "0.08em" }}>
            [BOSS DETECTED: {hudStats.bossName}]
          </span>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(15, 23, 42, 0.9)",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid #FFE600",
            }}
          >
            <div
              style={{
                width: `${hudStats.bossHpRatio * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #FF9900, #FFE600)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Floating XP Gauge */}
      <div
        style={{
          position: "absolute",
          bottom: "0.6rem",
          left: "0.75rem",
          right: "0.75rem",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: 700 }}>
          <span style={{ color: "#00F0FF" }}>
            [XP PROGRESS: {hudStats.xp} / {hudStats.xpRequired}]
          </span>
          <span style={{ color: hudStats.dashReady ? "#39FF14" : "#94A3B8" }}>
            {hudStats.dashReady ? "[DASH: READY - SPACE/SHIFT]" : `[DASH RECHARGING]`}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "rgba(15, 23, 42, 0.85)",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid rgba(0, 240, 255, 0.3)",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (hudStats.xp / hudStats.xpRequired) * 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00F0FF, #39FF14)",
              transition: "width 0.15s ease",
            }}
          />
        </div>
      </div>

      {/* Mobile Touch Action Button (Right Side) */}
      <div
        style={{
          position: "absolute",
          bottom: "2.8rem",
          right: "1.25rem",
          zIndex: 12,
          display: "flex",
          gap: "0.6rem",
        }}
      >
        <button
          onClick={triggerDash}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: hudStats.dashReady
              ? "radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)"
              : "rgba(15, 23, 42, 0.8)",
            border: hudStats.dashReady ? "2px solid #00F0FF" : "1px solid rgba(148, 163, 184, 0.3)",
            color: hudStats.dashReady ? "#00F0FF" : "#64748B",
            fontSize: "0.75rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: hudStats.dashReady ? "0 0 12px rgba(0, 240, 255, 0.4)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          [DASH]
        </button>
      </div>

      {/* Canvas Element */}
      <div
        className={styles.canvasContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className={styles.gameCanvas} />
      </div>

      {/* In-Run Level Up Augment Draft Modal */}
      {isDrafting && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.draftModalContainer} glass`}>
            <div className={styles.draftHeader}>
              <span className={styles.draftBadge}>[QUANTUM SYNAPSE ACTIVE]</span>
              <h2 className={styles.draftTitle}>[LEVEL UP // AUGMENT DRAFT {draftLevel}]</h2>
              <p className={styles.draftSubtitle}>
                Select 1 combat enhancement to overclock your vessel matrix for the survival run.
              </p>
            </div>

            <div className={styles.draftCardsGrid}>
              {draftCards.map((card) => {
                let rarityClass = styles.rarityCommon;
                if (card.rarity === "RARE") rarityClass = styles.rarityRare;
                else if (card.rarity === "EPIC") rarityClass = styles.rarityEpic;
                else if (card.rarity === "LEGENDARY") rarityClass = styles.rarityLegendary;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelectAugment(card)}
                    className={`${styles.draftCard} ${rarityClass}`}
                  >
                    <div className={styles.cardRarityRow}>
                      <span className={styles.cardCategory}>[{card.category}]</span>
                      <span className={styles.cardRarityTag}>[{card.rarity}]</span>
                    </div>

                    <div className={styles.cardIconBox}>
                      <span className={styles.cardIcon}>{card.icon}</span>
                    </div>

                    <h3 className={styles.cardName}>{card.name}</h3>
                    <p className={styles.cardTagline}>{card.tagline}</p>
                    <p className={styles.cardDesc}>{card.description}</p>

                    <button className={styles.cardSelectBtn}>[INSTALL AUGMENT]</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && !isDrafting && (
        <div className={styles.modalBackdrop}>
          <div
            className="glass"
            style={{
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              background: "#0B0F19",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h2 style={{ color: "#00F0FF", fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>
              [SIMULATION PAUSED]
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem", margin: 0 }}>
              Tactical pause engaged. Review weapons telemetry or resume run.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                onClick={() => setIsPaused(false)}
                className={styles.cardSelectBtn}
                style={{ padding: "0.75rem" }}
              >
                [RESUME SIMULATION]
              </button>
              <button
                onClick={() => {
                  const p = simState.current.player;
                  setIsPaused(false);
                  onGameOver(Math.floor(simState.current.elapsedSeconds), p.score, false);
                }}
                style={{
                  padding: "0.75rem",
                  background: "rgba(255, 51, 102, 0.15)",
                  border: "1px solid #FF3366",
                  color: "#FF3366",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                [ABORT RUN]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
