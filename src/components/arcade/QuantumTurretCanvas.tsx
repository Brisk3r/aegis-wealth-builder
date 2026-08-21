"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import { ParticleSystem } from "@/lib/gameEngine/particles";
import styles from "./KineticGame.module.css";

interface QuantumTurretProps {
  onScoreUpdate: (score: number) => void;
  onShardsCollected: (shards: number) => void;
  onGameOver: (finalScore: number, waveReached: number) => void;
  shipColor?: string;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  life: number;
  type: "VULCAN" | "LASER_PIERCE" | "FLAK_BURST";
}

interface TurretEnemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  points: number;
  shards: number;
  color: string;
  type: "SWARM_DRONE" | "PLASMA_BRUTE" | "PULSAR_CRUISER" | "LEVIATHAN_BOSS";
}

export default function QuantumTurretCanvas({
  onScoreUpdate,
  onShardsCollected,
  onGameOver,
  shipColor = "#00F0FF",
}: QuantumTurretProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem());

  const stateRef = useRef<{
    width: number;
    height: number;
    turretX: number;
    turretY: number;
    turretAngle: number;
    targetAngle: number;
    recoil: number;
    turretHp: number;
    turretMaxHp: number;
    turretShields: number;
    activeWeapon: "VULCAN" | "LASER_PIERCE" | "FLAK_BURST";
    projectiles: Projectile[];
    enemies: TurretEnemy[];
    fireTimer: number;
    fireRate: number;
    isFiring: boolean;
    targetAim: { x: number; y: number };
    wave: number;
    waveTimer: number;
    score: number;
    shardsCount: number;
    isDead: boolean;
    stars: { x: number; y: number; size: number; alpha: number }[];
  }>({
    width: 600,
    height: 560,
    turretX: 300,
    turretY: 280,
    turretAngle: 0,
    targetAngle: 0,
    recoil: 0,
    turretHp: 100,
    turretMaxHp: 100,
    turretShields: 3,
    activeWeapon: "VULCAN",
    projectiles: [],
    enemies: [],
    fireTimer: 0,
    fireRate: 4, // default Vulcan fire rate
    isFiring: false,
    targetAim: { x: 300, y: 100 },
    wave: 1,
    waveTimer: 0,
    score: 0,
    shardsCount: 0,
    isDead: false,
    stars: [],
  });

  // High-DPI Pointer Aim & Fire Handlers
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? stateRef.current.width / rect.width : 1;
    const scaleY = rect.height > 0 ? stateRef.current.height / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const s = stateRef.current;
    s.targetAim = { x, y };
    s.targetAngle = Math.atan2(y - s.turretY, x - s.turretX);
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    handlePointerMove(clientX, clientY);
    stateRef.current.isFiring = true;
  };

  const handlePointerUp = () => {
    stateRef.current.isFiring = false;
  };

  const [activeWeapon, setActiveWeapon] = useState<"VULCAN" | "LASER_PIERCE" | "FLAK_BURST">("VULCAN");

  const setWeapon = useCallback((w: "VULCAN" | "LASER_PIERCE" | "FLAK_BURST") => {
    const s = stateRef.current;
    s.activeWeapon = w;
    // Differentiate weapon fire rates
    if (w === "VULCAN") s.fireRate = 4; // Rapid 15 shots/sec
    else if (w === "LASER_PIERCE") s.fireRate = 18; // Slower cadence 3.3 shots/sec
    else if (w === "FLAK_BURST") s.fireRate = 12; // Medium burst cadence 5 shots/sec

    setActiveWeapon(w);
    soundManager.playDraftSelect();
  }, []);

  // Keyboard weapon selector listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") setWeapon("VULCAN");
      if (e.key === "2") setWeapon("LASER_PIERCE");
      if (e.key === "3") setWeapon("FLAK_BURST");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setWeapon]);

  // Resize Handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2.0);
      const width = Math.floor(rect.width);
      const height = 560;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      const s = stateRef.current;
      s.width = width;
      s.height = height;
      s.turretX = width * 0.5;
      s.turretY = height * 0.5;

      s.stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Main 60 FPS Turret Defense Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const turretLoop = () => {
      const s = stateRef.current;
      const width = s.width;
      const height = s.height;

      if (!s.isDead) {
        // Smooth 360 angular interpolation with shortest-arc wrapping
        let diff = s.targetAngle - s.turretAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        s.turretAngle += diff * 0.38;

        // Recoil recovery
        s.recoil *= 0.82;

        // 1. Auto-firing logic with distinct weapon profiles & recoil
        s.fireTimer++;
        if (s.isFiring && s.fireTimer >= s.fireRate) {
          s.fireTimer = 0;

          if (s.activeWeapon === "FLAK_BURST") {
            // Cluster Flak: 5-pellet wide spread with heavy recoil
            const speed = 9.5;
            s.recoil = 8.5;
            for (let i = -2; i <= 2; i++) {
              const spreadAngle = s.turretAngle + i * 0.12;
              s.projectiles.push({
                x: s.turretX + Math.cos(spreadAngle) * 25,
                y: s.turretY + Math.sin(spreadAngle) * 25,
                vx: Math.cos(spreadAngle) * (speed + (Math.random() - 0.5) * 1.5),
                vy: Math.sin(spreadAngle) * (speed + (Math.random() - 0.5) * 1.5),
                radius: 5,
                color: "#FF9900",
                damage: 28,
                life: 50,
                type: "FLAK_BURST",
              });
            }
            soundManager.playExplosion("SMALL");
            particleSystem.current.triggerScreenShake(3);
          } else if (s.activeWeapon === "LASER_PIERCE") {
            // Tesla Piercer: High damage, high velocity piercing rod with medium recoil
            const speed = 18.0;
            s.recoil = 6.0;
            s.projectiles.push({
              x: s.turretX + Math.cos(s.turretAngle) * 28,
              y: s.turretY + Math.sin(s.turretAngle) * 28,
              vx: Math.cos(s.turretAngle) * speed,
              vy: Math.sin(s.turretAngle) * speed,
              radius: 6,
              color: "#BF00FF",
              damage: 110,
              life: 45,
              type: "LASER_PIERCE",
            });
            soundManager.playLaserDeflection(2200);
            particleSystem.current.triggerScreenShake(2);
          } else {
            // Vulcan: Rapid single-target with light recoil
            const speed = 13.5;
            s.recoil = 2.5;
            s.projectiles.push({
              x: s.turretX + Math.cos(s.turretAngle) * 25,
              y: s.turretY + Math.sin(s.turretAngle) * 25,
              vx: Math.cos(s.turretAngle) * speed,
              vy: Math.sin(s.turretAngle) * speed,
              radius: 4,
              color: "#00F0FF",
              damage: 25,
              life: 58,
              type: "VULCAN",
            });
            soundManager.playLaunch(0.3);
          }

          particleSystem.current.emitSparks(
            s.turretX + Math.cos(s.turretAngle) * 28,
            s.turretY + Math.sin(s.turretAngle) * 28,
            s.activeWeapon === "FLAK_BURST" ? "#FF9900" : s.activeWeapon === "LASER_PIERCE" ? "#BF00FF" : "#00F0FF",
            6,
            3
          );
        }

        // 2. Update Projectiles
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const p = s.projectiles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;

          if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            s.projectiles.splice(i, 1);
          }
        }

        // 3. Enemy Spawner (Wave System)
        s.waveTimer++;
        if (s.waveTimer > 120 && s.enemies.length < 8 + s.wave * 2) {
          s.waveTimer = 0;
          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnDist = Math.max(width, height) * 0.65;
          const ex = s.turretX + Math.cos(spawnAngle) * spawnDist;
          const ey = s.turretY + Math.sin(spawnAngle) * spawnDist;

          const rand = Math.random();
          let enemyType: "SWARM_DRONE" | "PLASMA_BRUTE" | "PULSAR_CRUISER" | "LEVIATHAN_BOSS" = "SWARM_DRONE";
          let hp = 40 + s.wave * 15;
          let speed = 2.2 + s.wave * 0.1;
          let radius = 12;
          let color = "#39FF14";
          let points = 100;
          let shards = 5;

          if (rand > 0.85 && s.wave >= 3) {
            enemyType = "LEVIATHAN_BOSS";
            hp = 600 + s.wave * 150;
            speed = 0.8;
            radius = 32;
            color = "#FF0055";
            points = 1500;
            shards = 40;
          } else if (rand > 0.6) {
            enemyType = "PLASMA_BRUTE";
            hp = 120 + s.wave * 30;
            speed = 1.4;
            radius = 18;
            color = "#FF9900";
            points = 250;
            shards = 12;
          }

          s.enemies.push({
            id: `enemy_${Date.now()}_${Math.random()}`,
            x: ex,
            y: ey,
            vx: 0,
            vy: 0,
            radius,
            hp,
            maxHp: hp,
            speed,
            points,
            shards,
            color,
            type: enemyType,
          });
        }

        // 4. Update Enemies with Soft Boids Swarm Separation & Collision
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];

          // Compute Boids soft separation force
          let sepX = 0;
          let sepY = 0;
          for (let k = 0; k < s.enemies.length; k++) {
            if (k === i) continue;
            const other = s.enemies[k];
            const ndx = e.x - other.x;
            const ndy = e.y - other.y;
            const distSq = ndx * ndx + ndy * ndy;
            const minDist = e.radius + other.radius + 8;

            if (distSq < minDist * minDist && distSq > 0.001) {
              const dist = Math.sqrt(distSq);
              const pushFactor = (minDist - dist) / minDist;
              sepX += (ndx / dist) * pushFactor * 1.6;
              sepY += (ndy / dist) * pushFactor * 1.6;
            }
          }

          const angleToTurret = Math.atan2(s.turretY - e.y, s.turretX - e.x);
          e.x += Math.cos(angleToTurret) * e.speed + sepX;
          e.y += Math.sin(angleToTurret) * e.speed + sepY;

          // Check hit against player turret
          const distToTurret = Math.hypot(s.turretX - e.x, s.turretY - e.y);
          if (distToTurret < 30 + e.radius) {
            // Damage turret
            if (s.turretShields > 0) {
              s.turretShields--;
              soundManager.playShieldDeflect();
              particleSystem.current.triggerScreenShake(12);
              particleSystem.current.emitShockwave(s.turretX, s.turretY, "#00F0FF", 60);
            } else {
              s.turretHp -= 25;
              soundManager.playExplosion("MEDIUM");
              particleSystem.current.triggerScreenShake(18);
              particleSystem.current.emitShockwave(s.turretX, s.turretY, "#FF3366", 80);

              if (s.turretHp <= 0) {
                s.isDead = true;
                soundManager.playGameOver();
                soundManager.playExplosion("MASSIVE");
                particleSystem.current.triggerScreenShake(25);
                onGameOver(s.score, s.wave);
              }
            }
            s.enemies.splice(i, 1);
            continue;
          }

          // Check Projectile vs Enemy collisions
          for (let j = s.projectiles.length - 1; j >= 0; j--) {
            const p = s.projectiles[j];
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist < p.radius + e.radius) {
              e.hp -= p.damage;
              particleSystem.current.emitSparks(p.x, p.y, p.color, 6, 3);
              soundManager.playBumperHit(2, "STANDARD");

              if (p.type !== "LASER_PIERCE") {
                s.projectiles.splice(j, 1);
              }

              if (e.hp <= 0) {
                s.score += e.points;
                s.shardsCount += e.shards;
                onScoreUpdate(s.score);
                onShardsCollected(e.shards);
                soundManager.playExplosion("SMALL");
                particleSystem.current.emitShockwave(e.x, e.y, e.color, 40);
                particleSystem.current.emitFloatingText(e.x, e.y, `+${e.points}`, "#00F0FF");
                s.enemies.splice(i, 1);
                break;
              }
            }
          }
        }

        particleSystem.current.update();
      }

      // Render Frame
      ctx.save();
      const shake = particleSystem.current.getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Background
      ctx.fillStyle = "#030611";
      ctx.fillRect(0, 0, width, height);

      // Stars
      s.stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Range rings
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.turretX, s.turretY, 120, 0, Math.PI * 2);
      ctx.arc(s.turretX, s.turretY, 220, 0, Math.PI * 2);
      ctx.stroke();

      // Render Projectiles
      s.projectiles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Enemies
      s.enemies.forEach((e) => {
        ctx.save();
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Enemy HP bar
        const hpRatio = e.hp / e.maxHp;
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(e.x - 14, e.y - e.radius - 8, 28, 4);
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - 14, e.y - e.radius - 8, 28 * hpRatio, 4);
        ctx.restore();
      });

      // Render Player Turret Station with Recoil Kick
      ctx.save();
      const recoilX = -Math.cos(s.turretAngle) * s.recoil;
      const recoilY = -Math.sin(s.turretAngle) * s.recoil;
      ctx.translate(recoilX, recoilY);

      // Outer Shield Ring
      if (s.turretShields > 0) {
        ctx.strokeStyle = "#00F0FF";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#00F0FF";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(s.turretX, s.turretY, 34, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Base Platform
      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = shipColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = shipColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s.turretX, s.turretY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating Gun Barrel
      ctx.save();
      ctx.translate(s.turretX, s.turretY);
      ctx.rotate(s.turretAngle);
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(10 - s.recoil, -4, 22, 8);
      ctx.restore();

      // Central Energy Core
      ctx.fillStyle = shipColor;
      ctx.beginPath();
      ctx.arc(s.turretX, s.turretY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Particles
      particleSystem.current.render(ctx);

      ctx.restore();
      animFrameId.current = requestAnimationFrame(turretLoop);
    };

    animFrameId.current = requestAnimationFrame(turretLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [onScoreUpdate, onShardsCollected, onGameOver, shipColor]);

  return (
    <div
      className={styles.canvasContainer}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onTouchMove={(e) => {
        if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 0) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerUp}
    >
      <canvas ref={canvasRef} className={styles.gameCanvas} />
      
      {/* On-Screen Tactical Weapon Selector */}
      <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", pointerEvents: "auto", zIndex: 10 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setWeapon("VULCAN"); }}
          className={`${styles.deckNavBtn} ${activeWeapon === "VULCAN" ? styles.tabActive : ""}`}
          style={{ padding: "0.5rem 0.25rem", fontSize: "0.75rem", color: "#00F0FF", borderColor: activeWeapon === "VULCAN" ? "#00F0FF" : "rgba(0,240,255,0.3)", background: activeWeapon === "VULCAN" ? "rgba(0,240,255,0.2)" : "rgba(15,23,42,0.85)" }}
        >
          [1] Vulcan
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setWeapon("LASER_PIERCE"); }}
          className={`${styles.deckNavBtn} ${activeWeapon === "LASER_PIERCE" ? styles.tabActive : ""}`}
          style={{ padding: "0.5rem 0.25rem", fontSize: "0.75rem", color: "#BF00FF", borderColor: activeWeapon === "LASER_PIERCE" ? "#BF00FF" : "rgba(191,0,255,0.3)", background: activeWeapon === "LASER_PIERCE" ? "rgba(191,0,255,0.2)" : "rgba(15,23,42,0.85)" }}
        >
          [2] Tesla Piercer
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setWeapon("FLAK_BURST"); }}
          className={`${styles.deckNavBtn} ${activeWeapon === "FLAK_BURST" ? styles.tabActive : ""}`}
          style={{ padding: "0.5rem 0.25rem", fontSize: "0.75rem", color: "#FF9900", borderColor: activeWeapon === "FLAK_BURST" ? "#FF9900" : "rgba(255,153,0,0.3)", background: activeWeapon === "FLAK_BURST" ? "rgba(255,153,0,0.2)" : "rgba(15,23,42,0.85)" }}
        >
          [3] Cluster Flak
        </button>
      </div>
    </div>
  );
}
