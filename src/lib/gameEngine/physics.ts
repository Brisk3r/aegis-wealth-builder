// High-Precision Real-Time Physics & Trajectory Math Engine
// Pure 7-bit ASCII compliant.
// Features:
// - Semi-Implicit Euler & Symplectic Velocity Verlet Integrators
// - Adaptive Sub-Stepping Continuous Collision Detection (CCD) to eliminate boundary tunneling
// - Multi-Bounce Lookahead Trajectory Raycaster (75-150 steps)
// - Inverse-Square Newtonian Gravity Wells with Singularity Softening
// - Geometric Solvers: Circle-Circle Restitution, Ray-to-Segment Lasers, AABB Hurdles
// - Uniform Grid Hashing Spatial Partitioning Helper
// - Strict Float Precision Stabilization

import { BossEntity, Bumper, GravityWell, LaserBeam, PlayerOrb, ShardPickup, Vector2D } from "./types";
import { SectorWeather } from "./weather";

export interface TrajectoryPoint {
  x: number;
  y: number;
  isBounce?: boolean;
  bounceType?: "WALL" | "BUMPER" | "OBSTACLE" | "NONE";
  normal?: Vector2D;
  speed?: number;
  stepIndex?: number;
}

export interface AABBHurdle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  restitution?: number;
  color?: string;
}

export interface CollisionResult {
  hit: boolean;
  normal: Vector2D;
  impulse: number;
  penetration?: number;
  contactPoint?: Vector2D;
}

export interface BossCollisionResult {
  hitCore: boolean;
  hitDroneIndex: number;
  normal: Vector2D;
  impulse?: number;
}

export interface ShardUpdateResult {
  collectedCount: number;
  totalValue: number;
}

export type IntegratorType = "SEMI_IMPLICIT_EULER" | "VELOCITY_VERLET";

/**
 * Uniform Grid Hashing Spatial Partitioning Structure for ultra-fast multi-entity queries.
 */
export class UniformGridHash<T extends { x: number; y: number; radius?: number }> {
  private cellSize: number;
  private grid: Map<string, T[]>;
  private itemIds: Map<T, string>;

  constructor(cellSize: number = 64) {
    this.cellSize = Math.max(16, cellSize);
    this.grid = new Map();
    this.itemIds = new Map();
  }

  private getCellCoords(x: number, y: number): { cx: number; cy: number } {
    return {
      cx: Math.floor(x / this.cellSize),
      cy: Math.floor(y / this.cellSize),
    };
  }

  private getCellKey(cx: number, cy: number): string {
    return `${cx}:${cy}`;
  }

  public clear(): void {
    this.grid.clear();
    this.itemIds.clear();
  }

  public insert(item: T, id?: string): void {
    const itemKey = id || `${item.x.toFixed(2)}_${item.y.toFixed(2)}_${Math.random()}`;
    this.itemIds.set(item, itemKey);

    const radius = item.radius || 0;
    const minX = item.x - radius;
    const maxX = item.x + radius;
    const minY = item.y - radius;
    const maxY = item.y + radius;

    const minC = this.getCellCoords(minX, minY);
    const maxC = this.getCellCoords(maxX, maxY);

    for (let cx = minC.cx; cx <= maxC.cx; cx++) {
      for (let cy = minC.cy; cy <= maxC.cy; cy++) {
        const key = this.getCellKey(cx, cy);
        let list = this.grid.get(key);
        if (!list) {
          list = [];
          this.grid.set(key, list);
        }
        list.push(item);
      }
    }
  }

  public insertAll(items: T[]): void {
    for (let i = 0; i < items.length; i++) {
      this.insert(items[i]);
    }
  }

  public queryRadius(x: number, y: number, radius: number): T[] {
    const minC = this.getCellCoords(x - radius, y - radius);
    const maxC = this.getCellCoords(x + radius, y + radius);
    const resultSet = new Set<T>();
    const radiusSq = radius * radius;

    for (let cx = minC.cx; cx <= maxC.cx; cx++) {
      for (let cy = minC.cy; cy <= maxC.cy; cy++) {
        const key = this.getCellKey(cx, cy);
        const list = this.grid.get(key);
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const itemRadius = item.radius || 0;
            const totalRadius = radius + itemRadius;
            const dx = item.x - x;
            const dy = item.y - y;
            if (dx * dx + dy * dy <= totalRadius * totalRadius) {
              resultSet.add(item);
            }
          }
        }
      }
    }

    return Array.from(resultSet);
  }

  public queryAABB(minX: number, minY: number, maxX: number, maxY: number): T[] {
    const minC = this.getCellCoords(minX, minY);
    const maxC = this.getCellCoords(maxX, maxY);
    const resultSet = new Set<T>();

    for (let cx = minC.cx; cx <= maxC.cx; cx++) {
      for (let cy = minC.cy; cy <= maxC.cy; cy++) {
        const key = this.getCellKey(cx, cy);
        const list = this.grid.get(key);
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const r = item.radius || 0;
            if (
              item.x + r >= minX &&
              item.x - r <= maxX &&
              item.y + r >= minY &&
              item.y - r <= maxY
            ) {
              resultSet.add(item);
            }
          }
        }
      }
    }

    return Array.from(resultSet);
  }

  public getOccupiedCellCount(): number {
    return this.grid.size;
  }
}

/**
 * Core Physics Engine for Aegis Arcade Hub.
 */
export class PhysicsEngine {
  public static readonly MAX_VELOCITY: number = 120.0;
  public static readonly MIN_MASS: number = 0.2;
  public static readonly EPSILON: number = 1e-6;
  public static readonly DEFAULT_SOFTENING: number = 900.0; // Singularity softening factor (px^2)

  // =========================================================================
  // Math & Vector Utilities
  // =========================================================================

  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  public static clampNearZero(val: number, eps: number = PhysicsEngine.EPSILON): number {
    return Math.abs(val) < eps ? 0 : val;
  }

  public static dot(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  public static magnitude(v: Vector2D): number {
    return Math.hypot(v.x, v.y);
  }

  public static normalize(v: Vector2D): Vector2D {
    const mag = Math.hypot(v.x, v.y);
    if (mag < PhysicsEngine.EPSILON) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  }

  public static reflectVector(
    velocity: Vector2D,
    normal: Vector2D,
    restitution: number = 1.0
  ): Vector2D {
    const norm = PhysicsEngine.normalize(normal);
    const dotVal = PhysicsEngine.dot(velocity, norm);
    return {
      x: (velocity.x - 2 * dotVal * norm.x) * restitution,
      y: (velocity.y - 2 * dotVal * norm.y) * restitution,
    };
  }

  // =========================================================================
  // Gravity Well Dynamic Acceleration
  // =========================================================================

  /**
   * Calculates Newtonian inverse-square acceleration from all active gravity wells,
   * incorporating singularity softening and mass scaling.
   */
  public static computeGravityAcceleration(
    x: number,
    y: number,
    mass: number,
    gravityWells: GravityWell[],
    softening: number = PhysicsEngine.DEFAULT_SOFTENING
  ): Vector2D {
    let accX = 0;
    let accY = 0;
    const effectiveMass = Math.max(PhysicsEngine.MIN_MASS, mass);

    for (let i = 0; i < gravityWells.length; i++) {
      const gw = gravityWells[i];
      const dx = gw.x - x;
      const dy = gw.y - y;
      const distSq = dx * dx + dy * dy;

      if (distSq > gw.radius * gw.radius) continue;

      const dist = Math.sqrt(distSq);
      if (dist < PhysicsEngine.EPSILON) continue;

      if (dist <= gw.innerRadius) {
        // Inner core zone: linear softening prevents singularity pinning
        const ratio = dist / Math.max(1.0, gw.innerRadius);
        const innerForce = (gw.strength * 0.45 * ratio) / effectiveMass;
        accX += (dx / dist) * innerForce;
        accY += (dy / dist) * innerForce;
      } else {
        // Inverse-square field with singularity softening
        const softenedDistSq = Math.max(distSq, softening);
        const force = (gw.strength * 450.0) / (softenedDistSq * effectiveMass);
        accX += (dx / dist) * force;
        accY += (dy / dist) * force;
      }
    }

    return { x: accX, y: accY };
  }

  // =========================================================================
  // Integrators: Semi-Implicit Euler & Symplectic Velocity Verlet
  // =========================================================================

  /**
   * Step a body using Semi-Implicit Euler (Symplectic Euler).
   * Velocity is updated first, then position is integrated with new velocity.
   */
  public static integrateSemiImplicitEuler(
    orb: { x: number; y: number; vx: number; vy: number },
    acceleration: Vector2D,
    dt: number
  ): void {
    orb.vx += acceleration.x * dt;
    orb.vy += acceleration.y * dt;
    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;
  }

  /**
   * Step a body using Symplectic Velocity Verlet solver.
   * Position advances by half-step velocity, then full acceleration update, then velocity update.
   */
  public static integrateVelocityVerlet(
    orb: { x: number; y: number; vx: number; vy: number; mass: number },
    gravityWells: GravityWell[],
    dt: number,
    dragFactor: number = 1.0
  ): void {
    const halfDt = 0.5 * dt;
    const a1 = PhysicsEngine.computeGravityAcceleration(orb.x, orb.y, orb.mass, gravityWells);

    // Half-step position update
    orb.x += orb.vx * halfDt + 0.5 * a1.x * halfDt * halfDt;
    orb.y += orb.vy * halfDt + 0.5 * a1.y * halfDt * halfDt;

    // Compute new acceleration at updated position
    const a2 = PhysicsEngine.computeGravityAcceleration(orb.x, orb.y, orb.mass, gravityWells);

    // Velocity update combining both acceleration estimates
    orb.vx = (orb.vx + 0.5 * (a1.x + a2.x) * dt) * dragFactor;
    orb.vy = (orb.vy + 0.5 * (a1.y + a2.y) * dt) * dragFactor;

    // Second half-step position
    orb.x += orb.vx * halfDt;
    orb.y += orb.vy * halfDt;
  }

  /**
   * Separating Axis Theorem (SAT) / Exact Geometry Triangle-Circle Collision Solver.
   * Tests whether a circle intersects a 2D triangle defined by 3 vertices (p1, p2, p3).
   * Eliminates phantom corner collisions caused by rectangular bounding boxes.
   */
  public static checkTriangleCircleCollision(
    p1: Vector2D,
    p2: Vector2D,
    p3: Vector2D,
    circle: { x: number; y: number; radius: number }
  ): boolean {
    // 1. Check if circle center is inside the triangle using cross-product orientation test
    const d1 = (circle.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (circle.y - p2.y);
    const d2 = (circle.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (circle.y - p3.y);
    const d3 = (circle.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (circle.y - p1.y);

    const hasNeg = d1 < -PhysicsEngine.EPSILON || d2 < -PhysicsEngine.EPSILON || d3 < -PhysicsEngine.EPSILON;
    const hasPos = d1 > PhysicsEngine.EPSILON || d2 > PhysicsEngine.EPSILON || d3 > PhysicsEngine.EPSILON;

    if (!(hasNeg && hasPos)) {
      return true; // Circle center is strictly inside triangle
    }

    // 2. Check distance from circle center to each of the 3 triangle edge segments
    const r = circle.radius;
    const seg1 = PhysicsEngine.distancePointToSegment(circle.x, circle.y, p1.x, p1.y, p2.x, p2.y);
    if (seg1.distance <= r) return true;

    const seg2 = PhysicsEngine.distancePointToSegment(circle.x, circle.y, p2.x, p2.y, p3.x, p3.y);
    if (seg2.distance <= r) return true;

    const seg3 = PhysicsEngine.distancePointToSegment(circle.x, circle.y, p3.x, p3.y, p1.x, p1.y);
    if (seg3.distance <= r) return true;

    return false;
  }

  /**
   * Predictive Bank-Shot Trajectory Solver for Neon Duel AI.
   * Accurately simulates the future path of the ball bouncing off top and bottom arena walls
   * until it reaches targetX (the paddle defense line).
   */
  public static predictBallTrajectory(
    ball: { x: number; y: number; vx: number; vy: number; radius: number },
    targetX: number,
    arenaHeight: number,
    maxSteps: number = 300
  ): { targetY: number; bounces: number; timeToTarget: number } {
    let simX = ball.x;
    let simY = ball.y;
    let simVx = ball.vx;
    let simVy = ball.vy;
    const r = ball.radius;
    const topLimit = r;
    const bottomLimit = arenaHeight - r;
    let bounces = 0;
    let timeToTarget = 0;

    if (Math.abs(simVx) < PhysicsEngine.EPSILON) {
      return { targetY: simY, bounces: 0, timeToTarget: 0 };
    }

    // Moving away from target
    if ((targetX > simX && simVx <= 0) || (targetX < simX && simVx >= 0)) {
      return { targetY: arenaHeight * 0.5, bounces: 0, timeToTarget: 0 };
    }

    for (let step = 0; step < maxSteps; step++) {
      // Check if reaching or crossing targetX
      const willCross = (simVx > 0 && simX + simVx >= targetX) || (simVx < 0 && simX + simVx <= targetX);
      if (willCross) {
        const fraction = (targetX - simX) / simVx;
        const finalY = simY + simVy * fraction;
        timeToTarget += fraction;
        return {
          targetY: PhysicsEngine.clamp(finalY, topLimit, bottomLimit),
          bounces,
          timeToTarget,
        };
      }

      simX += simVx;
      simY += simVy;
      timeToTarget += 1.0;

      // Bounce off top wall
      if (simY <= topLimit) {
        simY = topLimit;
        simVy = Math.abs(simVy);
        bounces++;
      } else if (simY >= bottomLimit) {
        simY = bottomLimit;
        simVy = -Math.abs(simVy);
        bounces++;
      }
    }

    return { targetY: PhysicsEngine.clamp(simY, topLimit, bottomLimit), bounces, timeToTarget };
  }

  // =========================================================================
  // Trajectory Lookahead Solver (Multi-Bounce Raycaster)
  // =========================================================================

  /**
   * Simulates multi-bounce lookahead trajectory factoring in gravity wells,
   * boundaries, and bumpers with continuous collision lookahead and sub-stepping.
   */
  public static simulateTrajectory(
    startX: number,
    startY: number,
    velocity: Vector2D,
    gravityWells: GravityWell[],
    bumpers: Bumper[],
    width: number,
    height: number,
    steps: number = 75,
    options?: {
      simRadius?: number;
      hurdles?: AABBHurdle[];
      timeScale?: number;
    }
  ): TrajectoryPoint[] {
    const points: TrajectoryPoint[] = [{ x: startX, y: startY, stepIndex: 0 }];
    let simX = startX;
    let simY = startY;
    let simVx = velocity.x;
    let simVy = velocity.y;
    const simRadius = options?.simRadius || 12;
    const totalDt = options?.timeScale || 1.0;
    const maxSteps = Math.max(10, Math.min(250, steps));

    for (let step = 1; step <= maxSteps; step++) {
      const currentSpeed = Math.hypot(simVx, simVy);
      const subSteps = Math.max(1, Math.min(4, Math.ceil(currentSpeed / 18.0)));
      const dt = totalDt / subSteps;

      let bouncedInStep = false;
      let stepBounceType: "WALL" | "BUMPER" | "OBSTACLE" | "NONE" = "NONE";
      let stepBounceNormal: Vector2D = { x: 0, y: 0 };

      for (let s = 0; s < subSteps; s++) {
        // 1. Calculate gravity well acceleration
        const acc = PhysicsEngine.computeGravityAcceleration(simX, simY, 1.0, gravityWells);
        simVx += acc.x * dt;
        simVy += acc.y * dt;

        // 2. Drag damping
        simVx *= Math.pow(0.998, dt);
        simVy *= Math.pow(0.998, dt);

        // Clamp max simulation velocity
        const speed = Math.hypot(simVx, simVy);
        if (speed > PhysicsEngine.MAX_VELOCITY) {
          const factor = PhysicsEngine.MAX_VELOCITY / speed;
          simVx *= factor;
          simVy *= factor;
        }

        // Step position
        simX += simVx * dt;
        simY += simVy * dt;

        // 3. Wall reflections
        if (simX <= simRadius) {
          simX = simRadius;
          simVx = Math.abs(simVx) * 0.95;
          bouncedInStep = true;
          stepBounceType = "WALL";
          stepBounceNormal = { x: 1, y: 0 };
        } else if (simX >= width - simRadius) {
          simX = width - simRadius;
          simVx = -Math.abs(simVx) * 0.95;
          bouncedInStep = true;
          stepBounceType = "WALL";
          stepBounceNormal = { x: -1, y: 0 };
        }

        if (simY <= simRadius) {
          simY = simRadius;
          simVy = Math.abs(simVy) * 0.95;
          bouncedInStep = true;
          stepBounceType = "WALL";
          stepBounceNormal = { x: 0, y: 1 };
        }

        // 4. Bumper collision checks in simulation
        for (let bIdx = 0; bIdx < bumpers.length; bIdx++) {
          const b = bumpers[bIdx];
          if (b.isDestroyed) continue;

          const dx = simX - b.x;
          const dy = simY - b.y;
          const dist = Math.hypot(dx, dy);
          const minDist = simRadius + b.radius;

          if (dist < minDist && dist > PhysicsEngine.EPSILON) {
            const nx = dx / dist;
            const ny = dy / dist;
            const normalVel = simVx * nx + simVy * ny;

            if (normalVel < 0) {
              let restitution = 1.15;
              if (b.type === "BOUNCE_SUPER") restitution = 1.45;
              else if (b.type === "GOLDEN_CORE") restitution = 1.30;
              else if (b.type === "EXPLOSIVE") restitution = 1.25;

              const impulse = -(1 + restitution) * normalVel;
              simVx += impulse * nx;
              simVy += impulse * ny;

              // Anti-penetration offset
              simX = b.x + nx * (minDist + 0.5);
              simY = b.y + ny * (minDist + 0.5);

              bouncedInStep = true;
              stepBounceType = "BUMPER";
              stepBounceNormal = { x: nx, y: ny };
              break;
            }
          }
        }

        // 5. Optional AABB hurdle collision checks
        if (options?.hurdles && options.hurdles.length > 0) {
          for (let hIdx = 0; hIdx < options.hurdles.length; hIdx++) {
            const h = options.hurdles[hIdx];
            const closestX = PhysicsEngine.clamp(simX, h.x, h.x + h.width);
            const closestY = PhysicsEngine.clamp(simY, h.y, h.y + h.height);
            const hdx = simX - closestX;
            const hdy = simY - closestY;
            const hDist = Math.hypot(hdx, hdy);

            if (hDist < simRadius && hDist > PhysicsEngine.EPSILON) {
              const hnx = hdx / hDist;
              const hny = hdy / hDist;
              const hNormVel = simVx * hnx + simVy * hny;
              if (hNormVel < 0) {
                const hRestitution = h.restitution || 1.0;
                const hImpulse = -(1 + hRestitution) * hNormVel;
                simVx += hImpulse * hnx;
                simVy += hImpulse * hny;
                simX = closestX + hnx * (simRadius + 0.5);
                simY = closestY + hny * (simRadius + 0.5);
                bouncedInStep = true;
                stepBounceType = "OBSTACLE";
                stepBounceNormal = { x: hnx, y: hny };
                break;
              }
            }
          }
        }
      }

      points.push({
        x: simX,
        y: simY,
        isBounce: bouncedInStep,
        bounceType: stepBounceType,
        normal: bouncedInStep ? stepBounceNormal : undefined,
        speed: Math.hypot(simVx, simVy),
        stepIndex: step,
      });

      // Bottom boundary exit terminates trajectory lookahead
      if (simY > height + 25) {
        break;
      }
    }

    return points;
  }

  // =========================================================================
  // Main Orb State Updater with Adaptive Sub-Stepping CCD
  // =========================================================================

  /**
   * Updates player orb position, velocity, trail history, and boundary collisions
   * with adaptive sub-stepping to guarantee zero tunneling even at extreme velocities.
   */
  public static updateOrb(
    orb: PlayerOrb,
    gravityWells: GravityWell[],
    width: number,
    height: number,
    timeScale: number = 1.0,
    weather?: SectorWeather
  ): { hitBottom: boolean } {
    const currentSpeed = Math.hypot(orb.vx, orb.vy);
    const maxSubStepDist = 14.0; // Sub-step threshold distance (px)
    const subSteps = Math.max(1, Math.min(16, Math.ceil((currentSpeed * timeScale) / maxSubStepDist)));
    const dt = timeScale / subSteps;
    let hitBottom = false;

    // Atmospheric drag factor per sub-step
    const dragMultiplier = weather ? weather.dragMultiplier : 1.0;
    const baseDrag = 0.998;
    const effectiveDrag = 1.0 - (1.0 - baseDrag) * dragMultiplier;
    const dragFactor = Math.pow(Math.max(0.0, Math.min(1.0, effectiveDrag)), dt);

    for (let s = 0; s < subSteps; s++) {
      // 1. Calculate Gravity Acceleration
      const acc = PhysicsEngine.computeGravityAcceleration(
        orb.x,
        orb.y,
        orb.mass,
        gravityWells
      );

      // 2. Symplectic Euler Integration Step
      orb.vx = (orb.vx + acc.x * dt) * dragFactor;
      orb.vy = (orb.vy + acc.y * dt) * dragFactor;

      // Velocity Safety Cap
      const stepSpeed = Math.hypot(orb.vx, orb.vy);
      if (stepSpeed > PhysicsEngine.MAX_VELOCITY) {
        const scale = PhysicsEngine.MAX_VELOCITY / stepSpeed;
        orb.vx *= scale;
        orb.vy *= scale;
      }

      // Position update
      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;

      // 3. Boundary Collisions with Anti-Penetration Resolution
      if (orb.x <= orb.radius) {
        orb.x = orb.radius;
        orb.vx = Math.abs(orb.vx) * 0.95;
      } else if (orb.x >= width - orb.radius) {
        orb.x = width - orb.radius;
        orb.vx = -Math.abs(orb.vx) * 0.95;
      }

      if (orb.y <= orb.radius) {
        orb.y = orb.radius;
        orb.vy = Math.abs(orb.vy) * 0.95;
      } else if (orb.y >= height + orb.radius * 2) {
        hitBottom = true;
      }
    }

    // 4. Overdrive Timer Countdown
    if (orb.isOverdrive) {
      orb.overdriveTimer -= timeScale;
      if (orb.overdriveTimer <= 0) {
        orb.isOverdrive = false;
        orb.overdriveTimer = 0;
      }
    }

    // 5. Trail History Maintenance
    orb.trailHistory.unshift({ x: orb.x, y: orb.y, alpha: 1.0 });
    if (orb.trailHistory.length > 24) {
      orb.trailHistory.pop();
    }
    const historyLen = orb.trailHistory.length;
    for (let i = 0; i < historyLen; i++) {
      orb.trailHistory[i].alpha = 1.0 - i / historyLen;
    }

    return { hitBottom };
  }

  // =========================================================================
  // Geometric Collision Solvers
  // =========================================================================

  /**
   * Circle-Circle Restitution Solver with Anti-Penetration Separation.
   * Handles bumpers and returns impulse, normal, and collision flag.
   */
  public static checkBumperCollision(
    orb: PlayerOrb,
    bumper: Bumper,
    kineticBonus: number = 1.0
  ): CollisionResult {
    if (bumper.isDestroyed) {
      return { hit: false, normal: { x: 0, y: 0 }, impulse: 0 };
    }

    const dx = orb.x - bumper.x;
    const dy = orb.y - bumper.y;
    const distSq = dx * dx + dy * dy;
    const minDist = orb.radius + bumper.radius;

    if (distSq < minDist * minDist && distSq > PhysicsEngine.EPSILON) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Relative velocity along collision normal
      const normalVelocity = orb.vx * nx + orb.vy * ny;

      if (normalVelocity < 0) {
        // Restitution bounce determination
        let baseRestitution = 1.15;
        if (bumper.type === "BOUNCE_SUPER") baseRestitution = 1.45;
        else if (bumper.type === "GOLDEN_CORE") baseRestitution = 1.30;
        else if (bumper.type === "EXPLOSIVE") baseRestitution = 1.25;
        else if (bumper.type === "TESLA_NODE" || bumper.type === "PRISM_LASER") baseRestitution = 1.10;

        const restitution = baseRestitution * kineticBonus;
        const impulse = -(1 + restitution) * normalVelocity;

        orb.vx += impulse * nx;
        orb.vy += impulse * ny;

        // Anti-penetration separation: push orb to exact tangent contact
        orb.x = bumper.x + nx * minDist;
        orb.y = bumper.y + ny * minDist;

        return {
          hit: true,
          normal: { x: nx, y: ny },
          impulse: Math.abs(impulse),
          penetration: minDist - dist,
          contactPoint: { x: bumper.x + nx * bumper.radius, y: bumper.y + ny * bumper.radius },
        };
      }
    }

    return { hit: false, normal: { x: 0, y: 0 }, impulse: 0 };
  }

  /**
   * Boss AI Collision Solver: resolves both orbiting shield drones and central core.
   */
  public static checkBossCollisions(
    orb: PlayerOrb,
    boss: BossEntity
  ): BossCollisionResult {
    // 1. Check Orbiting Shield Drones
    for (let i = 0; i < boss.drones.length; i++) {
      const drone = boss.drones[i];
      if (drone.hp <= 0) continue;

      const dx = orb.x - drone.x;
      const dy = orb.y - drone.y;
      const dist = Math.hypot(dx, dy);
      const minDist = orb.radius + drone.radius;

      if (dist < minDist && dist > PhysicsEngine.EPSILON) {
        const nx = dx / dist;
        const ny = dy / dist;
        const dotVal = orb.vx * nx + orb.vy * ny;

        if (dotVal < 0) {
          const impulse = -(1 + 1.15) * dotVal;
          orb.vx += impulse * nx;
          orb.vy += impulse * ny;
          orb.x = drone.x + nx * minDist;
          orb.y = drone.y + ny * minDist;
          return { hitCore: false, hitDroneIndex: i, normal: { x: nx, y: ny }, impulse };
        }
      }
    }

    // 2. Check Boss Central Core
    const dx = orb.x - boss.x;
    const dy = orb.y - boss.y;
    const dist = Math.hypot(dx, dy);
    const minDist = orb.radius + boss.radius;

    if (dist < minDist && dist > PhysicsEngine.EPSILON) {
      const nx = dx / dist;
      const ny = dy / dist;
      const dotVal = orb.vx * nx + orb.vy * ny;

      if (dotVal < 0) {
        const impulse = -(1 + 1.25) * dotVal;
        orb.vx += impulse * nx;
        orb.vy += impulse * ny;
        orb.x = boss.x + nx * minDist;
        orb.y = boss.y + ny * minDist;
        return { hitCore: true, hitDroneIndex: -1, normal: { x: nx, y: ny }, impulse };
      }
    }

    return { hitCore: false, hitDroneIndex: -1, normal: { x: 0, y: 0 }, impulse: 0 };
  }

  /**
   * Ray-to-Segment and Rotating Laser Hazard Collision Solver.
   * Computes perpendicular distance from orb center to laser line segment.
   */
  public static checkLaserCollision(
    orb: PlayerOrb,
    laser: LaserBeam,
    beamRadius: number = 6.0
  ): boolean {
    if (!laser.isActive) return false;

    const px = laser.startX;
    const py = laser.startY;
    const qx = laser.endX;
    const qy = laser.endY;

    const dx = qx - px;
    const dy = qy - py;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < PhysicsEngine.EPSILON) {
      return Math.hypot(orb.x - px, orb.y - py) < orb.radius + beamRadius;
    }

    // Normalized scalar projection t clamped to [0, 1]
    const t = PhysicsEngine.clamp(
      ((orb.x - px) * dx + (orb.y - py) * dy) / lenSq,
      0.0,
      1.0
    );

    const projX = px + t * dx;
    const projY = py + t * dy;

    const dist = Math.hypot(orb.x - projX, orb.y - projY);
    return dist < orb.radius + beamRadius;
  }

  /**
   * Distance from point to line segment utility.
   */
  public static distancePointToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): { distance: number; closestX: number; closestY: number; t: number } {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < PhysicsEngine.EPSILON) {
      return {
        distance: Math.hypot(px - x1, py - y1),
        closestX: x1,
        closestY: y1,
        t: 0,
      };
    }

    const t = PhysicsEngine.clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0.0, 1.0);
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    const distance = Math.hypot(px - closestX, py - closestY);

    return { distance, closestX, closestY, t };
  }

  /**
   * Circle vs AABB (Axis-Aligned Bounding Box) Hurdle Solver.
   */
  public static checkAABBCollision(
    orb: PlayerOrb,
    box: AABBHurdle
  ): CollisionResult {
    const closestX = PhysicsEngine.clamp(orb.x, box.x, box.x + box.width);
    const closestY = PhysicsEngine.clamp(orb.y, box.y, box.y + box.height);

    const dx = orb.x - closestX;
    const dy = orb.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < orb.radius * orb.radius && distSq > PhysicsEngine.EPSILON) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const normVel = orb.vx * nx + orb.vy * ny;

      if (normVel < 0) {
        const restitution = box.restitution || 1.05;
        const impulse = -(1 + restitution) * normVel;
        orb.vx += impulse * nx;
        orb.vy += impulse * ny;

        orb.x = closestX + nx * orb.radius;
        orb.y = closestY + ny * orb.radius;

        return {
          hit: true,
          normal: { x: nx, y: ny },
          impulse: Math.abs(impulse),
          penetration: orb.radius - dist,
          contactPoint: { x: closestX, y: closestY },
        };
      }
    }

    return { hit: false, normal: { x: 0, y: 0 }, impulse: 0 };
  }

  // =========================================================================
  // Neon Duel Continuous Collision Detection (CCD) Paddle Solver
  // =========================================================================

  /**
   * Continuous Collision Detection (CCD) solver for Neon Duel paddles.
   * Prevents tunneling under extreme ball accelerations (up to 120 px/step).
   * Calculates swept collision time, exact contact point, angle deflection, and rebounded velocity.
   */
  public static checkPaddleCCD(
    disk: { x: number; y: number; vx: number; vy: number; radius: number },
    prevX: number,
    prevY: number,
    paddle: { x: number; y: number; width: number; height: number; speed?: number; vy?: number },
    isLeftPaddle: boolean
  ): {
    hit: boolean;
    hitOffset: number;
    contactX: number;
    contactY: number;
    newVx: number;
    newVy: number;
  } {
    const radius = disk.radius;
    const paddleHalfHeight = paddle.height * 0.5;
    const paddleCenterY = paddle.y + paddleHalfHeight;
    const paddleVy = paddle.vy || 0;
    const spinDeflection = paddleVy * 0.25;

    if (isLeftPaddle) {
      // Left paddle: ball moving towards left (vx < 0)
      const faceX = paddle.x + paddle.width + radius;

      // 1. Swept collision check across front face plane
      if (prevX >= faceX - 0.001 && disk.x <= faceX + 0.001 && disk.vx < 0) {
        const dx = disk.x - prevX;
        const t = Math.abs(dx) > PhysicsEngine.EPSILON ? (faceX - prevX) / dx : 0;
        const clampedT = PhysicsEngine.clamp(t, 0.0, 1.0);
        const contactY = prevY + clampedT * (disk.y - prevY);

        // Check if contactY is within paddle vertical bounds with full radius tolerance
        if (
          contactY >= paddle.y - radius &&
          contactY <= paddle.y + paddle.height + radius
        ) {
          const hitOffset = PhysicsEngine.clamp(
            (contactY - paddleCenterY) / paddleHalfHeight,
            -1.0,
            1.0
          );
          const newVx = Math.abs(disk.vx) * 1.05;
          const newVy = hitOffset * Math.max(6.5, Math.abs(newVx) * 0.55) + spinDeflection;

          return {
            hit: true,
            hitOffset,
            contactX: faceX + 0.1,
            contactY,
            newVx: PhysicsEngine.clamp(newVx, 5.0, PhysicsEngine.MAX_VELOCITY),
            newVy: PhysicsEngine.clamp(newVy, -PhysicsEngine.MAX_VELOCITY, PhysicsEngine.MAX_VELOCITY),
          };
        }
      }

      // 2. Discrete penetration or interior overlap fallback
      if (
        disk.x - radius <= paddle.x + paddle.width &&
        disk.x + radius >= paddle.x &&
        disk.y >= paddle.y - radius &&
        disk.y <= paddle.y + paddle.height + radius &&
        disk.vx < 0
      ) {
        const hitOffset = PhysicsEngine.clamp(
          (disk.y - paddleCenterY) / paddleHalfHeight,
          -1.0,
          1.0
        );
        const newVx = Math.abs(disk.vx) * 1.05;
        const newVy = hitOffset * Math.max(6.5, Math.abs(newVx) * 0.55) + spinDeflection;

        return {
          hit: true,
          hitOffset,
          contactX: faceX + 0.1,
          contactY: disk.y,
          newVx: PhysicsEngine.clamp(newVx, 5.0, PhysicsEngine.MAX_VELOCITY),
          newVy: PhysicsEngine.clamp(newVy, -PhysicsEngine.MAX_VELOCITY, PhysicsEngine.MAX_VELOCITY),
        };
      }
    } else {
      // Right paddle: ball moving towards right (vx > 0)
      const faceX = paddle.x - radius;

      // 1. Swept collision check across front face plane
      if (prevX <= faceX + 0.001 && disk.x >= faceX - 0.001 && disk.vx > 0) {
        const dx = disk.x - prevX;
        const t = Math.abs(dx) > PhysicsEngine.EPSILON ? (faceX - prevX) / dx : 0;
        const clampedT = PhysicsEngine.clamp(t, 0.0, 1.0);
        const contactY = prevY + clampedT * (disk.y - prevY);

        // Check if contactY is within paddle vertical bounds with full radius tolerance
        if (
          contactY >= paddle.y - radius &&
          contactY <= paddle.y + paddle.height + radius
        ) {
          const hitOffset = PhysicsEngine.clamp(
            (contactY - paddleCenterY) / paddleHalfHeight,
            -1.0,
            1.0
          );
          const newVx = -Math.abs(disk.vx) * 1.05;
          const newVy = hitOffset * Math.max(6.5, Math.abs(newVx) * 0.55) + spinDeflection;

          return {
            hit: true,
            hitOffset,
            contactX: faceX - 0.1,
            contactY,
            newVx: PhysicsEngine.clamp(newVx, -PhysicsEngine.MAX_VELOCITY, -5.0),
            newVy: PhysicsEngine.clamp(newVy, -PhysicsEngine.MAX_VELOCITY, PhysicsEngine.MAX_VELOCITY),
          };
        }
      }

      // 2. Discrete penetration or interior overlap fallback
      if (
        disk.x + radius >= paddle.x &&
        disk.x - radius <= paddle.x + paddle.width &&
        disk.y >= paddle.y - radius &&
        disk.y <= paddle.y + paddle.height + radius &&
        disk.vx > 0
      ) {
        const hitOffset = PhysicsEngine.clamp(
          (disk.y - paddleCenterY) / paddleHalfHeight,
          -1.0,
          1.0
        );
        const newVx = -Math.abs(disk.vx) * 1.05;
        const newVy = hitOffset * Math.max(6.5, Math.abs(newVx) * 0.55) + spinDeflection;

        return {
          hit: true,
          hitOffset,
          contactX: faceX - 0.1,
          contactY: disk.y,
          newVx: PhysicsEngine.clamp(newVx, -PhysicsEngine.MAX_VELOCITY, -5.0),
          newVy: PhysicsEngine.clamp(newVy, -PhysicsEngine.MAX_VELOCITY, PhysicsEngine.MAX_VELOCITY),
        };
      }
    }

    return {
      hit: false,
      hitOffset: 0,
      contactX: disk.x,
      contactY: disk.y,
      newVx: disk.vx,
      newVy: disk.vy,
    };
  }

  // =========================================================================
  // Shard Vacuum Magnet & Particle Solver
  // =========================================================================

  /**
   * Updates Quantum Shard pickups with vacuum magnet gravitation, drag decay,
   * lifetime tracking, and orb collection radius tests.
   */
  public static updateShards(
    shards: ShardPickup[],
    orb: PlayerOrb,
    magnetRadiusBonus: number = 0,
    dt: number = 1.0
  ): ShardUpdateResult {
    let collectedCount = 0;
    let totalValue = 0;
    const effectiveMagnet = 90.0 + magnetRadiusBonus;
    const magnetSq = effectiveMagnet * effectiveMagnet;

    for (let i = shards.length - 1; i >= 0; i--) {
      const s = shards[i];
      const dx = orb.x - s.x;
      const dy = orb.y - s.y;
      const distSq = dx * dx + dy * dy;

      // Vacuum magnet acceleration
      if (distSq < magnetSq && distSq > PhysicsEngine.EPSILON) {
        const dist = Math.sqrt(distSq);
        const pull = 9.5 * (1.0 - dist / effectiveMagnet) + 3.0;
        s.vx += (dx / dist) * pull * dt;
        s.vy += (dy / dist) * pull * dt;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.pow(0.94, dt);
      s.vy *= Math.pow(0.94, dt);
      s.life -= dt;

      const collDist = orb.radius + s.radius;
      if (distSq < collDist * collDist || s.life <= 0) {
        if (distSq < collDist * collDist) {
          collectedCount++;
          totalValue += s.value;
        }
        shards.splice(i, 1);
      }
    }

    return { collectedCount, totalValue };
  }
}
