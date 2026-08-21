"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import { ParticleSystem } from "@/lib/gameEngine/particles";
import { PhysicsEngine } from "@/lib/gameEngine/physics";
import styles from "./KineticGame.module.css";

interface GravityRunnerProps {
  onScoreUpdate: (score: number) => void;
  onShardsCollected: (shards: number) => void;
  onGameOver: (finalScore: number, distanceMeters: number) => void;
  shipColor?: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "SPIKE_FLOOR" | "SPIKE_CEILING" | "LASER_MID" | "BOOST_GATE" | "SHARD";
  collected?: boolean;
}

export default function GravityRunnerCanvas({
  onScoreUpdate,
  onShardsCollected,
  onGameOver,
  shipColor = "#00F0FF",
}: GravityRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem());

  const stateRef = useRef<{
    width: number;
    height: number;
    playerX: number;
    playerY: number;
    vy: number;
    gravity: number;
    isGrounded: boolean;
    squashX: number;
    squashY: number;
    baseSpeed: number;
    speed: number;
    boostTimer: number;
    boostSpeed: number;
    distance: number;
    score: number;
    shardsCount: number;
    obstacles: Obstacle[];
    nextSpawnDist: number;
    isDead: boolean;
    trail: { x: number; y: number; alpha: number }[];
    warpStreaks: { x: number; y: number; length: number; speed: number; alpha: number }[];
  }>({
    width: 600,
    height: 480,
    playerX: 100,
    playerY: 400,
    vy: 0,
    gravity: 0.85,
    isGrounded: true,
    squashX: 1.0,
    squashY: 1.0,
    baseSpeed: 5.5,
    speed: 5.5,
    boostTimer: 0,
    boostSpeed: 0,
    distance: 0,
    score: 0,
    shardsCount: 0,
    obstacles: [],
    nextSpawnDist: 300,
    isDead: false,
    trail: [],
    warpStreaks: [],
  });

  const handleFlipGravity = useCallback(() => {
    const s = stateRef.current;
    if (s.isDead) return;

    s.gravity = -s.gravity;
    s.vy = s.gravity * 3.5;
    s.squashX = 0.8;
    s.squashY = 1.3;
    soundManager.playLaunch(0.6);
    particleSystem.current.emitSparks(s.playerX, s.playerY, shipColor, 10, 3);
  }, [shipColor]);

  // Pointer / Touch and Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        handleFlipGravity();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlipGravity]);

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
      const height = 480;

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

  // Main Runner Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const runnerLoop = () => {
      const s = stateRef.current;
      const width = s.width;
      const height = s.height;
      const railTop = 40;
      const railBottom = height - 40;
      const playerRadius = 14;

      if (!s.isDead) {
        // Boost timer & decay calculation
        if (s.boostTimer > 0) {
          s.boostTimer--;
          s.boostSpeed = (s.boostTimer / 180) * 5.0;
          if (Math.random() < 0.6) {
            s.warpStreaks.push({
              x: width + 30,
              y: Math.random() * (height - 80) + 40,
              length: Math.random() * 60 + 30,
              speed: (s.baseSpeed + s.boostSpeed) * 2.2,
              alpha: 0.85,
            });
          }
        } else {
          s.boostSpeed = 0;
        }

        // Base speed ramp with distance
        s.baseSpeed = Math.min(12, 5.5 + s.distance * 0.001);
        s.speed = s.baseSpeed + s.boostSpeed;

        // Physics update
        s.vy += s.gravity;
        s.playerY += s.vy;
        s.distance += Math.floor(s.speed * 0.15);
        s.score = Math.floor(s.distance * 1.5) + s.shardsCount * 50;
        onScoreUpdate(s.score);

        // Boundary Clamping (Rails) with Smooth Spring Snapping
        const wasGrounded = s.isGrounded;
        if (s.playerY >= railBottom - playerRadius) {
          s.playerY = railBottom - playerRadius;
          s.vy = 0;
          s.isGrounded = true;
          if (!wasGrounded) {
            s.squashX = 1.35;
            s.squashY = 0.72;
            particleSystem.current.emitSparks(s.playerX, railBottom, shipColor, 8, 3);
          }
        } else if (s.playerY <= railTop + playerRadius) {
          s.playerY = railTop + playerRadius;
          s.vy = 0;
          s.isGrounded = true;
          if (!wasGrounded) {
            s.squashX = 1.35;
            s.squashY = 0.72;
            particleSystem.current.emitSparks(s.playerX, railTop, shipColor, 8, 3);
          }
        } else {
          s.isGrounded = false;
        }

        // Smooth spring recovery
        s.squashX += (1.0 - s.squashX) * 0.2;
        s.squashY += (1.0 - s.squashY) * 0.2;

        // Trail Record
        s.trail.unshift({ x: s.playerX, y: s.playerY, alpha: 1 });
        if (s.trail.length > 15) s.trail.pop();
        for (let i = 0; i < s.trail.length; i++) {
          s.trail[i].alpha = 1 - i / s.trail.length;
          s.trail[i].x -= s.speed;
        }

        // Obstacle Spawner
        if (s.obstacles.length === 0 || s.obstacles[s.obstacles.length - 1].x < width + 100) {
          const types: ("SPIKE_FLOOR" | "SPIKE_CEILING" | "LASER_MID" | "BOOST_GATE" | "SHARD")[] = [
            "SPIKE_FLOOR",
            "SPIKE_CEILING",
            "LASER_MID",
            "SHARD",
            "SHARD",
            "BOOST_GATE",
          ];
          const chosen = types[Math.floor(Math.random() * types.length)];
          const spawnX = width + Math.random() * 150 + 100;

          if (chosen === "SPIKE_FLOOR") {
            s.obstacles.push({ x: spawnX, y: railBottom - 35, width: 28, height: 35, type: chosen });
          } else if (chosen === "SPIKE_CEILING") {
            s.obstacles.push({ x: spawnX, y: railTop, width: 28, height: 35, type: chosen });
          } else if (chosen === "LASER_MID") {
            s.obstacles.push({ x: spawnX, y: height * 0.45, width: 14, height: 50, type: chosen });
          } else if (chosen === "BOOST_GATE") {
            s.obstacles.push({ x: spawnX, y: height * 0.4, width: 22, height: 80, type: chosen });
          } else if (chosen === "SHARD") {
            const shardY = Math.random() > 0.5 ? railBottom - 25 : railTop + 25;
            s.obstacles.push({ x: spawnX, y: shardY, width: 18, height: 18, type: chosen });
          }
        }

        // Obstacle movement and Separating Axis Theorem (SAT) collision check
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          if (obs.x < -60) {
            s.obstacles.splice(i, 1);
            continue;
          }

          let isColliding = false;

          if (obs.type === "SPIKE_FLOOR") {
            // SAT Triangle-Circle collision for floor spikes
            const p1 = { x: obs.x, y: obs.y + obs.height };
            const p2 = { x: obs.x + obs.width * 0.5, y: obs.y };
            const p3 = { x: obs.x + obs.width, y: obs.y + obs.height };
            isColliding = PhysicsEngine.checkTriangleCircleCollision(p1, p2, p3, {
              x: s.playerX,
              y: s.playerY,
              radius: playerRadius,
            });
          } else if (obs.type === "SPIKE_CEILING") {
            // SAT Triangle-Circle collision for ceiling spikes
            const p1 = { x: obs.x, y: obs.y };
            const p2 = { x: obs.x + obs.width * 0.5, y: obs.y + obs.height };
            const p3 = { x: obs.x + obs.width, y: obs.y };
            isColliding = PhysicsEngine.checkTriangleCircleCollision(p1, p2, p3, {
              x: s.playerX,
              y: s.playerY,
              radius: playerRadius,
            });
          } else if (obs.type === "SHARD") {
            const cx = obs.x + obs.width * 0.5;
            const cy = obs.y + obs.height * 0.5;
            const dist = Math.hypot(s.playerX - cx, s.playerY - cy);
            isColliding = dist < playerRadius + 9;
          } else {
            // AABB vs Circle for LASER_MID and BOOST_GATE
            const closestX = Math.max(obs.x, Math.min(s.playerX, obs.x + obs.width));
            const closestY = Math.max(obs.y, Math.min(s.playerY, obs.y + obs.height));
            const distX = s.playerX - closestX;
            const distY = s.playerY - closestY;
            isColliding = distX * distX + distY * distY < playerRadius * playerRadius;
          }

          if (isColliding) {
            if (obs.type === "SHARD" && !obs.collected) {
              obs.collected = true;
              s.shardsCount += 5;
              onShardsCollected(5);
              soundManager.playShardCollect();
              particleSystem.current.emitSparks(obs.x, obs.y, "#00F0FF", 8, 3);
              s.obstacles.splice(i, 1);
            } else if (obs.type === "BOOST_GATE") {
              s.boostTimer = 180; // 3.0 seconds supersonic warp boost
              s.boostSpeed = 5.0;
              soundManager.playOverdriveActivate();
              particleSystem.current.emitShockwave(s.playerX, s.playerY, "#39FF14", 100);
              particleSystem.current.emitFloatingText(s.playerX, s.playerY, "SUPERSONIC WARP!", "#39FF14");
              s.obstacles.splice(i, 1);
            } else if (obs.type.startsWith("SPIKE") || obs.type === "LASER_MID") {
              // Death!
              s.isDead = true;
              soundManager.playExplosion("MASSIVE");
              particleSystem.current.triggerScreenShake(20);
              particleSystem.current.emitShockwave(s.playerX, s.playerY, "#FF3366", 180);
              onGameOver(s.score, s.distance);
            }
          }
        }

        particleSystem.current.update();
      }

      // Render Frame
      ctx.save();
      const shake = particleSystem.current.getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Deep space background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Render Hyperspace Warp Streaks
      if (s.warpStreaks.length > 0) {
        ctx.save();
        for (let i = s.warpStreaks.length - 1; i >= 0; i--) {
          const streak = s.warpStreaks[i];
          streak.x -= streak.speed;
          streak.alpha -= 0.015;
          if (streak.x < -100 || streak.alpha <= 0) {
            s.warpStreaks.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(57, 255, 20, ${streak.alpha})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(streak.x, streak.y);
          ctx.lineTo(streak.x - streak.length, streak.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Neon Top & Bottom Glowing Rails
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, railTop);
      ctx.lineTo(width, railTop);
      ctx.moveTo(0, railBottom);
      ctx.lineTo(width, railBottom);
      ctx.stroke();

      // Render Obstacles
      s.obstacles.forEach((obs) => {
        if (obs.type === "SPIKE_FLOOR") {
          ctx.fillStyle = "#FF3366";
          ctx.shadowColor = "#FF3366";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width * 0.5, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === "SPIKE_CEILING") {
          ctx.fillStyle = "#FF3366";
          ctx.shadowColor = "#FF3366";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(obs.x + obs.width * 0.5, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width, obs.y);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === "LASER_MID") {
          ctx.fillStyle = "#BF00FF";
          ctx.shadowColor = "#BF00FF";
          ctx.shadowBlur = 14;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === "BOOST_GATE") {
          ctx.strokeStyle = "#39FF14";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 15;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === "SHARD") {
          ctx.fillStyle = "#00F0FF";
          ctx.shadowColor = "#00F0FF";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Trail
      if (s.trail.length > 1) {
        for (let i = 0; i < s.trail.length - 1; i++) {
          const p1 = s.trail[i];
          const p2 = s.trail[i + 1];
          ctx.strokeStyle = s.boostTimer > 0 ? "#39FF14" : shipColor;
          ctx.globalAlpha = p1.alpha * 0.5;
          ctx.lineWidth = 10 * (1 - i / s.trail.length);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Render Player Ship with Smooth Spring Squash
      if (!s.isDead) {
        ctx.save();
        ctx.translate(s.playerX, s.playerY);
        ctx.scale(s.squashX, s.squashY);

        ctx.fillStyle = shipColor;
        ctx.shadowColor = s.boostTimer > 0 ? "#39FF14" : shipColor;
        ctx.shadowBlur = s.boostTimer > 0 ? 25 : 16;
        ctx.beginPath();
        ctx.arc(0, 0, playerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core
        ctx.fillStyle = "#0A0E17";
        ctx.beginPath();
        ctx.arc(0, 0, playerRadius * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Particles
      particleSystem.current.render(ctx);

      ctx.restore();
      animFrameId.current = requestAnimationFrame(runnerLoop);
    };

    animFrameId.current = requestAnimationFrame(runnerLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [onScoreUpdate, onShardsCollected, onGameOver, shipColor]);

  return (
    <div className={styles.canvasContainer} onClick={handleFlipGravity}>
      <canvas ref={canvasRef} className={styles.gameCanvas} />
    </div>
  );
}
