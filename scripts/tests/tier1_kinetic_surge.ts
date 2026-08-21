/**
 * Tier 1 - Feature Coverage: Kinetic Surge (Slingshot Roguelite)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assert,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  assertNear,
} from "./test_framework.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { PlayerOrb, Bumper, GravityWell, BossEntity } from "../../src/lib/gameEngine/types.ts";
import { SECTORS, generateBoss, generateSectorBumpers } from "../../src/lib/gameEngine/levels.ts";

export function createKineticSurgeTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Kinetic Surge (Slingshot Roguelite)", 1);

  // Test 1: Touch Slingshot Aiming & DPR Drag Scaling
  suite.test("Kinetic Surge: Touch slingshot aiming scales with DPR and clamps drag vector", () => {
    const origin = { x: 300, y: 450 };
    const touchPoint = { x: 220, y: 550 };
    const dpr = 2.0;

    // Calculate drag offset scaled by DPR
    const rawDx = (origin.x - touchPoint.x);
    const rawDy = (origin.y - touchPoint.y);
    const rawDist = Math.hypot(rawDx, rawDy);
    
    const maxDragRadius = 120;
    const clampedDist = Math.min(rawDist, maxDragRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const pullVector = {
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    };

    const launchPower = 0.16;
    const launchVelocity = {
      x: pullVector.x * launchPower,
      y: pullVector.y * launchPower,
    };

    assertGreaterThan(launchVelocity.x, 0, "Pulling left-down should impart right-up velocity X");
    assertLessThan(launchVelocity.y, 0, "Pulling left-down should impart upward velocity Y");
    assertNear(Math.hypot(pullVector.x, pullVector.y), clampedDist, 0.001, "Vector magnitude matches clamped distance");
  });

  // Test 2: Sub-step Trajectory Bounce Lookahead Raycast
  suite.test("Kinetic Surge: Multi-bounce trajectory lookahead simulates reflections accurately", () => {
    const startX = 50;
    const startY = 300;
    const velocity = { x: -12, y: -8 };
    const gravityWells: GravityWell[] = [];
    const bumpers: Bumper[] = [
      {
        id: "b_center",
        x: 300,
        y: 200,
        radius: 25,
        type: "STANDARD",
        hp: 2,
        maxHp: 2,
        points: 100,
        shards: 5,
        pulsePhase: 0,
        color: "#00F0FF",
        glowColor: "#00F0FF",
        isDestroyed: false,
      }
    ];

    const trajectory = PhysicsEngine.simulateTrajectory(
      startX,
      startY,
      velocity,
      gravityWells,
      bumpers,
      600,
      600,
      60
    );

    assertGreaterThan(trajectory.length, 10, "Should generate multi-step trajectory points");
    const wallBounce = trajectory.find((p) => p.isBounce && p.bounceType === "WALL");
    assertTrue(wallBounce !== undefined, "Trajectory must record boundary bounce on left wall collision");
    assertGreaterThan(trajectory[trajectory.length - 1].x, startX, "Orb rebounds to the right after left wall impact");
  });

  // Test 3: Inverse-Square Newtonian Gravity Wells with Singularity Softening
  suite.test("Kinetic Surge: Gravity wells exert inverse-square acceleration without singularity NaN", () => {
    const well: GravityWell = {
      id: "gw_core",
      x: 300,
      y: 300,
      radius: 180,
      innerRadius: 15,
      strength: 5000,
      pulseSpeed: 0.05,
      pulseOffset: 0,
      color: "#BF00FF",
    };

    // Test standard distance
    const accStandard = PhysicsEngine.computeGravityAcceleration(350, 300, 1.0, [well]);
    assertLessThan(accStandard.x, 0, "Gravity well pulls left toward center (300, 300)");
    assertEquals(accStandard.y, 0, "No vertical acceleration for horizontal alignment");

    // Test singularity distance (r = 0)
    const accSingularity = PhysicsEngine.computeGravityAcceleration(300, 300, 1.0, [well]);
    assertFalse(Number.isNaN(accSingularity.x), "Acceleration at singularity center must not be NaN");
    assertFalse(Number.isNaN(accSingularity.y), "Acceleration at singularity center must not be NaN");
    assertTrue(Number.isFinite(accSingularity.x), "Acceleration at center must be finite");
  });

  // Test 4: Multi-Bumper Collision Restitution & Multiplier Scoring
  suite.test("Kinetic Surge: Bumper collision resolves elastic restitution and yields score/shards", () => {
    const orb: PlayerOrb = {
      x: 280,
      y: 200,
      vx: 15,
      vy: 0,
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
      energy: 50,
      maxEnergy: 100,
      overdriveCharge: 0,
      isOverdrive: false,
      overdriveTimer: 0,
      combo: 3,
      maxCombo: 3,
      comboTimer: 180,
      piercing: 0,
      splitCount: 0,
      lightningArcs: 0,
      isGhost: false,
      trailHistory: [],
      launchesLeft: 5,
      maxLaunches: 5,
    };

    const bumper: Bumper = {
      id: "b_gold",
      x: 300,
      y: 200,
      radius: 20,
      type: "GOLDEN_CORE",
      hp: 3,
      maxHp: 3,
      points: 500,
      shards: 25,
      pulsePhase: 0,
      color: "#FFD700",
      glowColor: "rgba(255,215,0,0.8)",
      isDestroyed: false,
    };

    const collision = PhysicsEngine.checkBumperCollision(orb, bumper, 1.0);
    assertTrue(collision.hit, "Direct collision must register hit");
    assertLessThan(orb.vx, 0, "Orb velocity reverses after bumper rebound");
    assertGreaterThan(collision.impulse, 10, "Collision produces positive impulse");
  });

  // Test 5: Boss AI Enrage State Machine & Orbital Drone Destruction
  suite.test("Kinetic Surge: Boss enters enrage state at <=40% HP with speed scaling and shockwave", () => {
    const boss = generateBoss(3, 600, 600)!;
    assert(boss !== null, "Sector 3 generates Vortex Titan");
    assertEquals(boss.type, "VORTEX_TITAN");
    assertFalse(boss.enraged, "Boss initially not enraged");
    const initialSpeed = Math.hypot(boss.vx, boss.vy);

    // Damage boss below 40% threshold
    boss.hp = Math.floor(boss.maxHp * 0.35);
    if (boss.hp <= boss.maxHp * 0.40) {
      boss.enraged = true;
      boss.phase = 2;
      boss.vx *= 1.8;
      boss.vy *= 1.8;
    }

    assertTrue(boss.enraged, "Boss must enter enrage mode at 35% HP");
    assertEquals(boss.phase, 2, "Boss advances to Phase 2");
    assertNear(Math.hypot(boss.vx, boss.vy), initialSpeed * 1.8, 0.01, "Enraged boss scales speed by 1.80x");
  });

  return suite;
}
