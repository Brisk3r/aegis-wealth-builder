"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import { ParticleSystem } from "@/lib/gameEngine/particles";
import { PhysicsEngine } from "@/lib/gameEngine/physics";
import styles from "./KineticGame.module.css";

interface DuelArenaProps {
  onScoreUpdate: (p1Score: number, p2Score: number) => void;
  onMatchComplete: (winner: "PLAYER_1" | "PLAYER_2", p1Score: number, p2Score: number) => void;
}

interface DuelDisk {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  speed: number;
}

interface DuelPaddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  speed: number;
  color: string;
}

export default function DuelArenaCanvas({
  onScoreUpdate,
  onMatchComplete,
}: DuelArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleSystem = useRef<ParticleSystem>(new ParticleSystem());

  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [isAiOpponent, setIsAiOpponent] = useState<boolean>(true);

  const stateRef = useRef<{
    width: number;
    height: number;
    p1: DuelPaddle;
    p2: DuelPaddle;
    disks: DuelDisk[];
    p1Score: number;
    p2Score: number;
    targetScore: number;
    isOver: boolean;
    isAiOpponent: boolean;
    isServing: boolean;
    serveTimer: number;
    serveServer: "PLAYER_1" | "PLAYER_2";
    keys: { [key: string]: boolean };
  }>({
    width: 700,
    height: 480,
    p1: { x: 40, y: 200, width: 14, height: 80, vy: 0, speed: 6.5, color: "#00F0FF" },
    p2: { x: 646, y: 200, width: 14, height: 80, vy: 0, speed: 6.5, color: "#FF3366" },
    disks: [
      { x: 350, y: 240, vx: 5.5, vy: 3.5, radius: 10, color: "#FFE600", speed: 5.5 },
    ],
    p1Score: 0,
    p2Score: 0,
    targetScore: 5,
    isOver: false,
    isAiOpponent: true,
    isServing: false,
    serveTimer: 0,
    serveServer: "PLAYER_1",
    keys: {},
  });

  // Keyboard controls listener for P1 (W/S) and P2 (Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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

      const s = stateRef.current;
      s.width = width;
      s.height = height;
      s.p1.x = 35;
      s.p2.x = width - 49;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Main Duel Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const duelLoop = () => {
      const s = stateRef.current;
      const width = s.width;
      const height = s.height;

      if (!s.isOver) {
        // 1. Update P1 Paddle Movement (W/S) with velocity tracking
        const prevP1Y = s.p1.y;
        if (s.keys["w"] || s.keys["W"]) s.p1.y -= s.p1.speed;
        if (s.keys["s"] || s.keys["S"]) s.p1.y += s.p1.speed;
        s.p1.y = Math.max(10, Math.min(height - s.p1.height - 10, s.p1.y));
        s.p1.vy = s.p1.y - prevP1Y;

        // 2. Update P2 Paddle Movement (Predictive AI or Manual Arrow Keys)
        const prevP2Y = s.p2.y;
        if (s.isAiOpponent) {
          const disk = s.disks[0];
          if (disk && disk.vx > 0 && !s.isServing) {
            // Predictive Bank-Shot Trajectory Lookahead
            const prediction = PhysicsEngine.predictBallTrajectory(disk, s.p2.x, height);
            const targetY = prediction.targetY - s.p2.height * 0.5;
            const dy = targetY - s.p2.y;
            const stepMove = Math.min(s.p2.speed, Math.abs(dy));
            if (Math.abs(dy) > 4) {
              s.p2.y += dy > 0 ? stepMove : -stepMove;
            }
          } else {
            // Return to central defensive stance
            const centerY = height * 0.5 - s.p2.height * 0.5;
            s.p2.y += (centerY - s.p2.y) * 0.06;
          }
        } else {
          if (s.keys["ArrowUp"]) s.p2.y -= s.p2.speed;
          if (s.keys["ArrowDown"]) s.p2.y += s.p2.speed;
        }
        s.p2.y = Math.max(10, Math.min(height - s.p2.height - 10, s.p2.y));
        s.p2.vy = s.p2.y - prevP2Y;

        // 3. Serve Countdown Logic (1.5s post-goal delay)
        if (s.isServing) {
          s.serveTimer--;
          if (s.serveTimer === 60 || s.serveTimer === 30) {
            soundManager.playLaunch(0.2);
          }
          if (s.serveTimer <= 0) {
            s.isServing = false;
            const disk = s.disks[0];
            if (disk) {
              const dir = s.serveServer === "PLAYER_1" ? -1 : 1;
              disk.vx = dir * 5.8;
              disk.vy = (Math.random() - 0.5) * 5.0;
              soundManager.playLaunch(0.6);
              particleSystem.current.emitShockwave(disk.x, disk.y, "#FFE600", 60);
            }
          }
        }

        // 4. Update Disks with Continuous Collision Detection (CCD)
        if (!s.isServing) {
          s.disks.forEach((disk) => {
            const prevX = disk.x;
            const prevY = disk.y;

            disk.x += disk.vx;
            disk.y += disk.vy;

            // Top/Bottom bounce with clamp
            if (disk.y <= disk.radius) {
              disk.y = disk.radius;
              disk.vy = Math.abs(disk.vy);
              soundManager.playBumperHit(1, "STANDARD");
              particleSystem.current.emitSparks(disk.x, disk.y, disk.color, 8, 3);
            } else if (disk.y >= height - disk.radius) {
              disk.y = height - disk.radius;
              disk.vy = -Math.abs(disk.vy);
              soundManager.playBumperHit(1, "STANDARD");
              particleSystem.current.emitSparks(disk.x, disk.y, disk.color, 8, 3);
            }

            // P1 Paddle Continuous Collision Detection (Left)
            const p1Result = PhysicsEngine.checkPaddleCCD(disk, prevX, prevY, s.p1, true);
            if (p1Result.hit) {
              disk.x = p1Result.contactX;
              disk.y = p1Result.contactY;
              disk.vx = p1Result.newVx;
              disk.vy = p1Result.newVy;
              soundManager.playBumperHit(4, "BOUNCE_SUPER");
              particleSystem.current.emitSparks(disk.x, disk.y, s.p1.color, 12, 4);
              particleSystem.current.emitShockwave(disk.x, disk.y, s.p1.color, 45);
            }

            // P2 Paddle Continuous Collision Detection (Right)
            const p2Result = PhysicsEngine.checkPaddleCCD(disk, prevX, prevY, s.p2, false);
            if (p2Result.hit) {
              disk.x = p2Result.contactX;
              disk.y = p2Result.contactY;
              disk.vx = p2Result.newVx;
              disk.vy = p2Result.newVy;
              soundManager.playBumperHit(4, "BOUNCE_SUPER");
              particleSystem.current.emitSparks(disk.x, disk.y, s.p2.color, 12, 4);
              particleSystem.current.emitShockwave(disk.x, disk.y, s.p2.color, 45);
            }

            // P2 Goal Scored (P1 point)
            if (disk.x > width + 20) {
              s.p1Score++;
              setP1Score(s.p1Score);
              onScoreUpdate(s.p1Score, s.p2Score);
              soundManager.playExplosion("MASSIVE");
              particleSystem.current.triggerScreenShake(20);
              particleSystem.current.emitShockwave(width - 20, disk.y, s.p1.color, 150);

              // Enter Serve Countdown Mode
              s.isServing = true;
              s.serveTimer = 90; // 1.5s serve countdown
              s.serveServer = "PLAYER_2"; // Serve towards Player 2 who conceded
              disk.x = width * 0.5;
              disk.y = height * 0.5;
              disk.vx = 0;
              disk.vy = 0;

              if (s.p1Score >= s.targetScore) {
                s.isOver = true;
                s.isServing = false;
                onMatchComplete("PLAYER_1", s.p1Score, s.p2Score);
              }
            }

            // P1 Goal Scored (P2 point)
            if (disk.x < -20) {
              s.p2Score++;
              setP2Score(s.p2Score);
              onScoreUpdate(s.p1Score, s.p2Score);
              soundManager.playExplosion("MASSIVE");
              particleSystem.current.triggerScreenShake(20);
              particleSystem.current.emitShockwave(20, disk.y, s.p2.color, 150);

              // Enter Serve Countdown Mode
              s.isServing = true;
              s.serveTimer = 90; // 1.5s serve countdown
              s.serveServer = "PLAYER_1"; // Serve towards Player 1 who conceded
              disk.x = width * 0.5;
              disk.y = height * 0.5;
              disk.vx = 0;
              disk.vy = 0;

              if (s.p2Score >= s.targetScore) {
                s.isOver = true;
                s.isServing = false;
                onMatchComplete("PLAYER_2", s.p1Score, s.p2Score);
              }
            }
          });
        }

        particleSystem.current.update();
      }

      // Render Frame
      ctx.save();
      const shake = particleSystem.current.getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Arena background
      ctx.fillStyle = "#030612";
      ctx.fillRect(0, 0, width, height);

      // Center Divider Line & Circle
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(width * 0.5, 0);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, 50, 0, Math.PI * 2);
      ctx.stroke();

      // P1 Paddle (Cyan)
      ctx.fillStyle = s.p1.color;
      ctx.shadowColor = s.p1.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(s.p1.x, s.p1.y, s.p1.width, s.p1.height, 6);
      ctx.fill();

      // P2 Paddle (Magenta)
      ctx.fillStyle = s.p2.color;
      ctx.shadowColor = s.p2.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(s.p2.x, s.p2.y, s.p2.width, s.p2.height, 6);
      ctx.fill();

      // Energy Disks
      s.disks.forEach((disk) => {
        ctx.fillStyle = disk.color;
        ctx.shadowColor = disk.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(disk.x, disk.y, disk.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Serve Countdown Indicator
      if (s.isServing) {
        ctx.save();
        const countdownSeconds = Math.ceil(s.serveTimer / 30);
        const pulse = Math.sin(Date.now() * 0.015) * 8;

        ctx.strokeStyle = "#FFE600";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 30 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dotted serve direction preview line
        ctx.strokeStyle = "rgba(255, 230, 0, 0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.5);
        ctx.lineTo(s.serveServer === "PLAYER_1" ? 100 : width - 100, height * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#FFE600";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${countdownSeconds}`, width * 0.5, height * 0.5 - 45);
        ctx.restore();
      }

      // Render Particles
      particleSystem.current.render(ctx);

      ctx.restore();
      animFrameId.current = requestAnimationFrame(duelLoop);
    };

    animFrameId.current = requestAnimationFrame(duelLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [onScoreUpdate, onMatchComplete]);

  const handleTouch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? stateRef.current.width / rect.width : 1;
    const scaleY = rect.height > 0 ? stateRef.current.height / rect.height : 1;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const s = stateRef.current;

    if (x < s.width * 0.5) {
      // Left side: P1
      const prevY = s.p1.y;
      s.p1.y = Math.max(10, Math.min(s.height - s.p1.height - 10, y - s.p1.height * 0.5));
      s.p1.vy = s.p1.y - prevY;
    } else if (!s.isAiOpponent) {
      // Right side: P2 (if not AI)
      const prevY = s.p2.y;
      s.p2.y = Math.max(10, Math.min(s.height - s.p2.height - 10, y - s.p2.height * 0.5));
      s.p2.vy = s.p2.y - prevY;
    }
  };

  return (
    <div
      className={styles.canvasContainer}
      onTouchMove={(e) => {
        if (e.touches.length > 0) {
          for (let i = 0; i < e.touches.length; i++) {
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
        }
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          for (let i = 0; i < e.touches.length; i++) {
            handleTouch(e.touches[i].clientX, e.touches[i].clientY);
          }
        }
      }}
    >
      <canvas ref={canvasRef} className={styles.gameCanvas} />

      {/* Opponent Mode Selector */}
      <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "0.5rem", zIndex: 10 }}>
        <button
          onClick={() => {
            const next = !isAiOpponent;
            setIsAiOpponent(next);
            stateRef.current.isAiOpponent = next;
            soundManager.playDraftSelect();
          }}
          className={styles.deckNavBtn}
          style={{
            padding: "0.35rem 0.65rem",
            fontSize: "0.72rem",
            background: "rgba(15, 23, 42, 0.85)",
            color: isAiOpponent ? "#39FF14" : "#FF3366",
            borderColor: isAiOpponent ? "#39FF14" : "#FF3366",
          }}
        >
          {isAiOpponent ? "[OPPONENT: ADAPTIVE CPU BOT]" : "[OPPONENT: LOCAL 2-PLAYER]"}
        </button>
      </div>
    </div>
  );
}
