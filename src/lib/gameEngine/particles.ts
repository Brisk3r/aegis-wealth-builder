/**
 * Aegis Arcade Hub - Graphics, Particles & Canvas Rendering Engine
 * Swarm 2: Agents 9-16 Architecture
 *
 * Capabilities:
 * 1. Retina DPR Canvas Manager with dynamic hardware scaling & subpixel precision.
 * 2. Radial shockwaves & expanding orbital energy rings with inverse-alpha decay.
 * 3. Directional kinetic spark particle fountains with quadratic drag & glowing halos.
 * 4. Floating telemetry combat typography (damage, crits, combo streaks, ascending text).
 * 5. Exponential decay camera shake trauma model with directional & angular damping.
 * 6. Zero-lag native canvas neon glow compositing & multi-pass bloom effects.
 * 7. Multi-layered dynamic parallax space backdrop with sector-themed cosmic dust.
 *
 * Strict 7-bit ASCII compliant (Zero Unicode mojibake / ANSI-1252 safe).
 */

import { Particle, Vector2D } from "./types";

// ============================================================================
// 1. RETINA DPR CANVAS MANAGER & HARDWARE SCALING
// ============================================================================

export interface CanvasDprConfig {
  maxDpr?: number;
  crispText?: boolean;
  alpha?: boolean;
  desynchronized?: boolean;
}

export interface CanvasSetupResult {
  dpr: number;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D | null;
}

export class RetinaCanvasManager {
  private static currentDpr: number = 1;
  private static targetDpr: number = 1;
  private static frameCount: number = 0;
  private static lastFpsCheck: number = 0;
  private static fpsAccumulator: number = 60;

  /**
   * Configures canvas buffer resolution to match physical device pixels
   * while preserving CSS layout dimensions.
   */
  public static setupCanvas(
    canvas: HTMLCanvasElement,
    cssWidth: number,
    cssHeight: number,
    config: CanvasDprConfig = {}
  ): CanvasSetupResult {
    const rawDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const maxDpr = config.maxDpr ?? 2.0;
    const dpr = Math.min(Math.max(1, rawDpr), maxDpr);

    this.currentDpr = dpr;
    this.targetDpr = dpr;

    const pixelWidth = Math.round(cssWidth * dpr);
    const pixelHeight = Math.round(cssHeight * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    const ctx = canvas.getContext("2d", {
      alpha: config.alpha ?? true,
      desynchronized: config.desynchronized ?? false,
    });

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (config.crispText) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
    }

    return {
      dpr,
      width: cssWidth,
      height: cssHeight,
      ctx,
    };
  }

  /**
   * Dynamically modulates resolution scaling when performance drops below threshold.
   */
  public static monitorAdaptiveDpr(currentFps: number): number {
    this.frameCount++;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();

    if (now - this.lastFpsCheck > 1000) {
      this.fpsAccumulator = currentFps;
      this.lastFpsCheck = now;

      // Throttle DPR if FPS drops below 45 to protect 60 FPS gameplay
      if (this.fpsAccumulator < 45 && this.currentDpr > 1.0) {
        this.targetDpr = 1.0;
      } else if (this.fpsAccumulator >= 58 && this.currentDpr < 2.0) {
        const rawDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        this.targetDpr = Math.min(rawDpr, 2.0);
      }
      this.currentDpr = this.currentDpr * 0.9 + this.targetDpr * 0.1;
    }

    return this.currentDpr;
  }

  public static getDpr(): number {
    return this.currentDpr;
  }
}

// ============================================================================
// 2. EXPONENTIAL DECAY CAMERA SHAKE TRAUMA MODEL
// ============================================================================

export interface CameraShakeTransform {
  offsetX: number;
  offsetY: number;
  rotationAngle: number;
  shakeIntensity: number;
  trauma: number;
}

export class CameraTraumaModel {
  public trauma: number = 0; // Range: [0.0, 1.0]
  public traumaDecayRate: number = 1.6; // Units per second
  public maxTranslationX: number = 22; // Pixels
  public maxTranslationY: number = 22; // Pixels
  public maxRotationAngle: number = 0.06; // Radians (~3.4 degrees)
  public frequency: number = 24.0; // Oscillation frequency (Hz)
  private timeAccumulator: number = 0;
  private impulseX: number = 0;
  private impulseY: number = 0;

  /**
   * Adds trauma with optional directional bias.
   */
  public addTrauma(amount: number, directionAngle?: number): void {
    this.trauma = Math.min(1.0, this.trauma + Math.max(0, amount));
    if (directionAngle !== undefined) {
      const impulseMag = amount * 12;
      this.impulseX += Math.cos(directionAngle) * impulseMag;
      this.impulseY += Math.sin(directionAngle) * impulseMag;
    }
  }

  /**
   * Updates trauma decay and oscillation timers.
   */
  public update(dtSeconds: number = 0.0166): void {
    this.timeAccumulator += dtSeconds;
    // Exponential / power decay
    this.trauma = Math.max(0, this.trauma - this.traumaDecayRate * dtSeconds);

    // Dampen directional impulses
    this.impulseX *= Math.pow(0.85, dtSeconds * 60);
    this.impulseY *= Math.pow(0.85, dtSeconds * 60);
    if (Math.abs(this.impulseX) < 0.05) this.impulseX = 0;
    if (Math.abs(this.impulseY) < 0.05) this.impulseY = 0;
  }

  /**
   * Calculates instantaneous screen offset and rotational matrix.
   * Shake intensity follows a quadratic trauma curve (shake = trauma^2).
   */
  public getTransform(): CameraShakeTransform {
    if (this.trauma <= 0.001 && Math.abs(this.impulseX) <= 0.01 && Math.abs(this.impulseY) <= 0.01) {
      this.trauma = 0;
      return {
        offsetX: 0,
        offsetY: 0,
        rotationAngle: 0,
        shakeIntensity: 0,
        trauma: 0,
      };
    }

    const shake = this.trauma * this.trauma; // Non-linear feel
    const t = this.timeAccumulator * this.frequency;

    // Harmonic multi-frequency pseudo-noise sampling
    const noiseX = Math.sin(t * 1.0) * 0.6 + Math.sin(t * 2.3) * 0.4;
    const noiseY = Math.cos(t * 1.1) * 0.6 + Math.cos(t * 2.7) * 0.4;
    const noiseRot = Math.sin(t * 0.9) * 0.7 + Math.sin(t * 1.9) * 0.3;

    const offsetX = noiseX * this.maxTranslationX * shake + this.impulseX * this.trauma;
    const offsetY = noiseY * this.maxTranslationY * shake + this.impulseY * this.trauma;
    const rotationAngle = noiseRot * this.maxRotationAngle * shake;

    return {
      offsetX,
      offsetY,
      rotationAngle,
      shakeIntensity: shake,
      trauma: this.trauma,
    };
  }

  /**
   * Applies camera translation and rotation to 2D context around viewport center.
   */
  public applyToContext(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    const transform = this.getTransform();
    if (transform.shakeIntensity > 0 || Math.abs(transform.offsetX) > 0 || Math.abs(transform.offsetY) > 0) {
      ctx.translate(centerX + transform.offsetX, centerY + transform.offsetY);
      if (Math.abs(transform.rotationAngle) > 0.0001) {
        ctx.rotate(transform.rotationAngle);
      }
      ctx.translate(-centerX, -centerY);
    }
  }

  public reset(): void {
    this.trauma = 0;
    this.impulseX = 0;
    this.impulseY = 0;
    this.timeAccumulator = 0;
  }
}

// ============================================================================
// 3. HIGH PERFORMANCE PARTICLE SYSTEM & EMITTERS
// ============================================================================

export type EnhancedParticleType =
  | "SPARK"
  | "SHOCKWAVE"
  | "SMOKE"
  | "TEXT"
  | "ORBITAL_RING"
  | "LASER_SPARK";

export interface ExtendedParticle extends Particle {
  type: EnhancedParticleType;
  maxRadius?: number;
  initialRadius?: number;
  lineWidth?: number;
  drag?: number;
  gravity?: number;
  scale?: number;
  maxScale?: number;
  isCritical?: boolean;
  glowColor?: string;
  rotation?: number;
  angularVelocity?: number;
  ringCount?: number;
  phase?: number;
}

export class ParticleSystem {
  public particles: ExtendedParticle[] = [];
  public screenShake: number = 0; // Legacy compatibility scalar
  public shakeDecay: number = 0.92;
  public cameraTrauma: CameraTraumaModel = new CameraTraumaModel();

  // Object pool to eliminate garbage collection pauses during heavy combat
  private particlePool: ExtendedParticle[] = [];
  private maxPoolSize: number = 1000;

  constructor(poolSize: number = 200) {
    this.initPool(poolSize);
  }

  private initPool(poolSize: number = 200): void {
    for (let i = 0; i < poolSize; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 1,
        color: "#00F0FF",
        alpha: 1,
        life: 0,
        maxLife: 30,
        type: "SPARK",
      });
    }
  }

  private acquireParticle(): ExtendedParticle {
    if (this.particlePool.length > 0) {
      const p = this.particlePool.pop()!;
      p.alpha = 1;
      p.life = 0;
      p.rotation = 0;
      p.angularVelocity = 0;
      p.scale = 1;
      p.isCritical = false;
      p.text = undefined;
      return p;
    }
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 1,
      color: "#00F0FF",
      alpha: 1,
      life: 0,
      maxLife: 30,
      type: "SPARK",
    };
  }

  private releaseParticle(p: ExtendedParticle): void {
    if (this.particlePool.length < this.maxPoolSize) {
      this.particlePool.push(p);
    }
  }

  public getParticles(): ExtendedParticle[] {
    return this.particles.filter((p) => p.type !== "SHOCKWAVE");
  }

  public getShockwaves(): ExtendedParticle[] {
    return this.particles.filter((p) => p.type === "SHOCKWAVE");
  }

  /**
   * Triggers screen shake across both legacy and exponential trauma channels.
   */
  public triggerScreenShake(amount: number, directionAngle?: number): void {
    this.screenShake = Math.min(25, this.screenShake + amount);
    this.cameraTrauma.addTrauma(Math.min(1.0, amount / 20), directionAngle);
  }

  /**
   * Retrieves screen shake offset vector (Maintains backward compatibility).
   */
  public getShakeOffset(): Vector2D {
    const traumaTransform = this.cameraTrauma.getTransform();

    if (this.screenShake < 0.1 && traumaTransform.shakeIntensity === 0) {
      this.screenShake = 0;
      return { x: 0, y: 0 };
    }

    const legacyX = (Math.random() * 2 - 1) * this.screenShake;
    const legacyY = (Math.random() * 2 - 1) * this.screenShake;
    this.screenShake *= this.shakeDecay;

    return {
      x: traumaTransform.offsetX + legacyX * 0.4,
      y: traumaTransform.offsetY + legacyY * 0.4,
    };
  }

  /**
   * Emits kinetic spark particle fountain with quadratic drag and velocity dispersion.
   */
  public emitSparks(
    x: number,
    y: number,
    color: string,
    count: number = 14,
    speed: number = 4.5,
    directionAngle?: number,
    spreadAngle: number = Math.PI * 2
  ): void {
    for (let i = 0; i < count; i++) {
      const angle =
        directionAngle !== undefined
          ? directionAngle + (Math.random() - 0.5) * spreadAngle
          : Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.75 + 0.25) * speed;
      const p = this.acquireParticle();

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * velocity;
      p.vy = Math.sin(angle) * velocity;
      p.radius = Math.random() * 2.4 + 1.2;
      p.color = color;
      p.glowColor = color;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = Math.random() * 20 + 25;
      p.drag = 0.95 + Math.random() * 0.02;
      p.type = "SPARK";

      this.particles.push(p);
    }
  }

  /**
   * Directional spark fountain with gravity acceleration and ablation friction.
   */
  public emitDirectionalFountain(
    x: number,
    y: number,
    color: string,
    directionAngle: number,
    count: number = 18,
    speed: number = 6.0,
    spread: number = 0.5,
    gravity: number = 0.08
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = directionAngle + (Math.random() - 0.5) * spread;
      const vel = (Math.random() * 0.8 + 0.3) * speed;
      const p = this.acquireParticle();

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * vel;
      p.vy = Math.sin(angle) * vel;
      p.radius = Math.random() * 2.8 + 1.2;
      p.color = color;
      p.glowColor = color;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = Math.random() * 25 + 30;
      p.drag = 0.96;
      p.gravity = gravity;
      p.type = "LASER_SPARK";

      this.particles.push(p);
    }
  }

  /**
   * Emits expanding radial shockwave with inverse-alpha line thickness decay.
   */
  public emitShockwave(
    x: number,
    y: number,
    color: string,
    maxRadius: number = 60,
    duration: number = 24,
    lineWidth: number = 4
  ): void {
    const p = this.acquireParticle();
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.radius = 4;
    p.initialRadius = 4;
    p.maxRadius = maxRadius;
    p.lineWidth = lineWidth;
    p.color = color;
    p.glowColor = color;
    p.alpha = 1.0;
    p.life = 0;
    p.maxLife = Math.max(16, duration);
    p.type = "SHOCKWAVE";

    this.particles.push(p);
  }

  /**
   * Concentric expanding orbital energy rings with staggered expansion.
   */
  public emitOrbitalRings(
    x: number,
    y: number,
    color: string,
    ringCount: number = 3,
    spacing: number = 10,
    baseRadius: number = 6
  ): void {
    for (let i = 0; i < ringCount; i++) {
      const p = this.acquireParticle();
      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
      p.radius = baseRadius + i * spacing;
      p.initialRadius = baseRadius + i * spacing;
      p.maxRadius = (baseRadius + i * spacing) * 4.5;
      p.color = color;
      p.glowColor = color;
      p.alpha = 0.95;
      p.life = 0;
      p.maxLife = 22 + i * 6;
      p.ringCount = ringCount;
      p.phase = i * (Math.PI / 4);
      p.type = "ORBITAL_RING";

      this.particles.push(p);
    }
  }

  /**
   * Supernova multi-chromatic blast wave with dual rings and dense spark cloud.
   */
  public emitSupernovaWave(
    x: number,
    y: number,
    primaryColor: string = "#FFE600",
    secondaryColor: string = "#FF0055",
    maxRadius: number = 220
  ): void {
    this.emitShockwave(x, y, primaryColor, maxRadius, 32, 6);
    this.emitShockwave(x, y, secondaryColor, maxRadius * 0.75, 24, 4);
    this.emitOrbitalRings(x, y, primaryColor, 4, 12, 8);
    this.emitSparks(x, y, primaryColor, 28, 7.5);
    this.emitSparks(x, y, secondaryColor, 20, 5.0);
    this.triggerScreenShake(22);
  }

  /**
   * Emits floating combat telemetry typography (damage, crits, combo streaks).
   */
  public emitFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = "#00F0FF",
    fontSize: number = 14,
    isCritical: boolean = false,
    vy: number = -1.9
  ): void {
    const p = this.acquireParticle();
    p.x = x;
    p.y = y - 8;
    p.vx = (Math.random() - 0.5) * 0.9;
    p.vy = vy;
    p.radius = fontSize;
    p.color = color;
    p.glowColor = color;
    p.alpha = 1.0;
    p.life = 0;
    p.maxLife = isCritical ? 55 : 45;
    p.type = "TEXT";
    p.text = text;
    p.isCritical = isCritical;
    p.scale = isCritical ? 1.6 : 1.0;
    p.maxScale = isCritical ? 1.6 : 1.0;

    this.particles.push(p);
  }

  /**
   * Emits combat numbers with automated color grading and badge formatting.
   */
  public emitCombatNumber(
    x: number,
    y: number,
    amount: number,
    type: "DAMAGE" | "CRIT" | "COMBO" | "SCORE" | "SHARDS" | "HEAL" | "SHIELD" = "DAMAGE",
    prefix: string = "",
    suffix: string = ""
  ): void {
    let color = "#00F0FF";
    let isCrit = false;
    let text = `${prefix}${amount}${suffix}`;

    switch (type) {
      case "CRIT":
        color = "#FF0055";
        isCrit = true;
        text = `CRIT! ${prefix}${amount}${suffix}`;
        break;
      case "DAMAGE":
        color = "#FF3366";
        text = `-${amount} DMG`;
        break;
      case "COMBO":
        color = "#FFE600";
        isCrit = true;
        text = `${amount}X COMBO!`;
        break;
      case "SCORE":
        color = "#39FF14";
        text = `+${amount} PTS`;
        break;
      case "SHARDS":
        color = "#00F0FF";
        text = `+${amount} SHARDS`;
        break;
      case "HEAL":
        color = "#00FF88";
        text = `+${amount} HP`;
        break;
      case "SHIELD":
        color = "#00E5FF";
        text = `+${amount} SHIELD`;
        break;
    }

    this.emitFloatingText(x, y, text, color, isCrit ? 16 : 13, isCrit, isCrit ? -2.4 : -1.8);
  }

  /**
   * Emits floating cosmic dust motes with organic Brownian drift.
   */
  public emitCosmicDust(x: number, y: number, color: string, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const p = this.acquireParticle();
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = (Math.random() - 0.5) * 0.4;
      p.radius = Math.random() * 1.5 + 0.8;
      p.color = color;
      p.glowColor = color;
      p.alpha = 0.7;
      p.life = 0;
      p.maxLife = Math.random() * 40 + 40;
      p.type = "SMOKE";

      this.particles.push(p);
    }
  }

  /**
   * Advances physical simulation of active particles and decays camera trauma.
   */
  public update(dtSeconds: number = 0.0166): void {
    this.cameraTrauma.update(dtSeconds);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        this.releaseParticle(p);
        continue;
      }

      const progress = p.life / p.maxLife;

      // Inverse alpha decay curves
      p.alpha = Math.max(0, 1 - Math.pow(progress, 1.4));

      if (p.type === "SPARK" || p.type === "LASER_SPARK") {
        // Quadratic drag & kinetic deceleration
        const drag = p.drag ?? 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= drag;
        p.vy *= drag;
        if (p.gravity) {
          p.vy += p.gravity;
        }
        p.radius = Math.max(0.4, p.radius * 0.975);
      } else if (p.type === "SHOCKWAVE") {
        const initial = p.initialRadius ?? 4;
        const maxR = p.maxRadius ?? 60;
        // Cubic ease-out expansion: r(t) = initial + (maxR - initial) * (1 - (1 - t)^3)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        p.radius = initial + (maxR - initial) * easeOut;
      } else if (p.type === "ORBITAL_RING") {
        const initial = p.initialRadius ?? 8;
        const maxR = p.maxRadius ?? 40;
        const easeOut = 1 - Math.pow(1 - progress, 2.5);
        p.radius = initial + (maxR - initial) * easeOut;
      } else if (p.type === "TEXT") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.95; // Gentle decelerating rise

        // Elastic scale ease down for critical hits
        if (p.isCritical && p.scale && p.scale > 1.0) {
          p.scale = 1.0 + (p.maxScale! - 1.0) * Math.max(0, 1 - progress * 3);
        }
      } else if (p.type === "SMOKE") {
        p.x += p.vx + Math.sin(p.life * 0.1) * 0.15;
        p.y += p.vy + Math.cos(p.life * 0.1) * 0.15;
      }
    }
  }

  /**
   * Zero-lag native canvas neon glow compositing and bloom rendering.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();

    // 1. Render Shockwaves & Orbital Rings
    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;

      if (p.type === "SHOCKWAVE") {
        const progress = p.life / p.maxLife;
        const baseWidth = p.lineWidth ?? 4;
        const currentWidth = Math.max(0.8, baseWidth * (1 - progress));

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha * 0.9);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = currentWidth;
        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === "ORBITAL_RING") {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha * 0.85);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Render Kinetic Sparks & Laser Debris (Optimized batch)
    ctx.save();
    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;

      if (p.type === "SPARK" || p.type === "LASER_SPARK") {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = 10;

        // Velocity orientation stretch for realistic motion blur
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 2.5) {
          const angle = Math.atan2(p.vy, p.vx);
          const stretch = Math.min(3.5, 1 + speed * 0.3);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * stretch, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === "SMOKE") {
        ctx.globalAlpha = Math.max(0, p.alpha * 0.6);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 3. Render Floating Combat Telemetry Typography
    for (const p of this.particles) {
      if (p.type === "TEXT" && p.text && p.alpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        const currentScale = p.scale ?? 1.0;
        const baseFontSize = p.radius || 14;
        const fontPx = Math.round(baseFontSize * currentScale);

        ctx.font = `${p.isCritical ? "900" : "700"} ${fontPx}px "Outfit", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Multi-pass neon bloom text shadow
        ctx.shadowColor = p.glowColor || p.color;
        ctx.shadowBlur = p.isCritical ? 16 : 8;
        ctx.fillStyle = p.color;

        ctx.fillText(p.text, p.x, p.y);

        // Crisp white core for critical text
        if (p.isCritical) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(p.text, p.x, p.y);
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  public clear(): void {
    for (const p of this.particles) {
      this.releaseParticle(p);
    }
    this.particles = [];
    this.screenShake = 0;
    this.cameraTrauma.reset();
  }
}

// ============================================================================
// 4. ZERO-LAG NATIVE CANVAS NEON GLOW COMPOSITING & BLOOM HELPERS
// ============================================================================

export class NeonBloomRenderer {
  /**
   * Renders glowing circle with dual core & halo passes.
   */
  public static drawNeonCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    glowRadius: number = 12,
    intensity: number = 1.0,
    fillCore: boolean = true
  ): void {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius * intensity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
    if (fillCore) {
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders high-voltage laser / neon beam with glowing core.
   */
  public static drawNeonBeam(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    coreWidth: number = 3,
    glowWidth: number = 14
  ): void {
    ctx.save();
    // Outer bloom stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = glowWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = glowWidth;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Inner core stroke
    ctx.lineWidth = coreWidth;
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = glowWidth * 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders radial bloom flash (Nova burst).
   */
  public static drawRadialBloom(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    innerRadius: number,
    outerRadius: number,
    color: string,
    maxAlpha: number = 0.5
  ): void {
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.globalAlpha = maxAlpha;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// 5. MULTI-LAYERED DYNAMIC PARALLAX SPACE BACKDROP & STARFIELD
// ============================================================================

export interface ParallaxStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  layer: 0 | 1 | 2; // 0 = Far, 1 = Mid, 2 = Near
  color: string;
}

export interface CosmicDustCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  driftVx: number;
  driftVy: number;
}

export class ParallaxSpaceBackdrop {
  public stars: ParallaxStar[] = [];
  public dustClouds: CosmicDustCloud[] = [];
  private width: number = 800;
  private height: number = 800;
  private time: number = 0;

  // Sector themed color gradients
  private static sectorColors: Record<number, { ambient: string; dust: string }> = {
    1: { ambient: "#001824", dust: "rgba(0, 240, 255, 0.08)" },
    2: { ambient: "#1A0924", dust: "rgba(180, 0, 255, 0.08)" },
    3: { ambient: "#241000", dust: "rgba(255, 140, 0, 0.09)" },
    4: { ambient: "#24000D", dust: "rgba(255, 0, 85, 0.08)" },
    5: { ambient: "#022415", dust: "rgba(0, 255, 136, 0.08)" },
  };

  constructor(width: number = 800, height: number = 800, starCount: number = 100) {
    this.resize(width, height, starCount);
  }

  public resize(width: number, height: number, starCount: number = 100): void {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.dustClouds = [];

    const starPalettes = ["#FFFFFF", "#00F0FF", "#FFE600", "#FF3366", "#A855F7"];

    for (let i = 0; i < starCount; i++) {
      const layer = (Math.random() < 0.6 ? 0 : Math.random() < 0.85 ? 1 : 2) as 0 | 1 | 2;
      const size = layer === 0 ? Math.random() * 0.9 + 0.5 : layer === 1 ? Math.random() * 1.4 + 1.0 : Math.random() * 2.0 + 1.8;
      const color = starPalettes[Math.floor(Math.random() * starPalettes.length)];

      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha: layer === 0 ? 0.35 + Math.random() * 0.3 : layer === 1 ? 0.6 + Math.random() * 0.3 : 0.85 + Math.random() * 0.15,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2.5 + 1.0,
        layer,
        color,
      });
    }

    // Initialize cosmic dust clouds
    for (let j = 0; j < 5; j++) {
      this.dustClouds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 180 + 100,
        color: "rgba(0, 240, 255, 0.06)",
        alpha: 0.06,
        driftVx: (Math.random() - 0.5) * 0.12,
        driftVy: (Math.random() - 0.5) * 0.12,
      });
    }
  }

  public update(scrollVx: number = 0, scrollVy: number = 0.5, dtSeconds: number = 0.0166): void {
    this.time += dtSeconds;

    // Parallax layer multipliers: layer 0 = 0.15x, layer 1 = 0.45x, layer 2 = 0.85x
    const layerSpeed = [0.15, 0.45, 0.85];

    for (const star of this.stars) {
      const mult = layerSpeed[star.layer];
      star.x += scrollVx * mult;
      star.y += scrollVy * mult;

      // Screen wrapping
      if (star.x < 0) star.x += this.width;
      if (star.x > this.width) star.x -= this.width;
      if (star.y < 0) star.y += this.height;
      if (star.y > this.height) star.y -= this.height;
    }

    // Cosmic dust drift
    for (const cloud of this.dustClouds) {
      cloud.x += cloud.driftVx + scrollVx * 0.08;
      cloud.y += cloud.driftVy + scrollVy * 0.08;

      if (cloud.x < -cloud.radius) cloud.x = this.width + cloud.radius;
      if (cloud.x > this.width + cloud.radius) cloud.x = -cloud.radius;
      if (cloud.y < -cloud.radius) cloud.y = this.height + cloud.radius;
      if (cloud.y > this.height + cloud.radius) cloud.y = -cloud.radius;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    sectorNumber: number = 1,
    sectorAmbientOverride?: string
  ): void {
    ctx.save();

    // 1. Deep Space Atmospheric Sector Gradient
    const theme = ParallaxSpaceBackdrop.sectorColors[sectorNumber] || ParallaxSpaceBackdrop.sectorColors[1];
    const ambientTop = sectorAmbientOverride || theme.ambient;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, ambientTop);
    bgGrad.addColorStop(1, "#020408");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic Nebula Dust Clouds
    for (const cloud of this.dustClouds) {
      const dustGrad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      dustGrad.addColorStop(0, theme.dust);
      dustGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Multi-Layered Twinkling Starfield
    for (const star of this.stars) {
      const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.1, star.baseAlpha + twinkle * 0.25);

      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;

      if (star.layer === 2 && star.size >= 2.0) {
        // Foremost bright stars with subtle cross flare glow
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
