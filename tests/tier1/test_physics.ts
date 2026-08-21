/**
 * Tier 1 - Feature Coverage: Core Physics & Trajectory Math
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
} from "../framework.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { PlayerOrb, Bumper, GravityWell, LaserBeam, BossEntity, ShardPickup } from "../../src/lib/gameEngine/types.ts";

export function createPhysicsTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Core Physics Engine", 1);

  // Test 1: Semi-Implicit Euler Trajectory Simulation
  suite.test("PhysicsEngine.simulateTrajectory calculates multi-step lookahead points", () => {
    const startX = 300;
    const startY = 450;
    const velocity = { x: 0, y: -10 };
    const gravityWells: GravityWell[] = [];
    const bumpers: Bumper[] = [];
    const width = 600;
    const height = 500;

    const trajectory = PhysicsEngine.simulateTrajectory(
      startX,
      startY,
      velocity,
      gravityWells,
      bumpers,
      width,
      height,
      50
    );

    assertGreaterThan(trajectory.length, 10, "Trajectory should produce at least 10 step points");
    assertEquals(trajectory[0].x, startX, "First point should match startX");
    assertEquals(trajectory[0].y, startY, "First point should match startY");
    assertLessThan(trajectory[5].y, startY, "Orb should move upwards with negative y velocity");
  });

  // Test 2: Wall Reflection Dynamics
  suite.test("PhysicsEngine.simulateTrajectory reflects off boundaries with damping", () => {
    const startX = 20;
    const startY = 200;
    const velocity = { x: -15, y: 0 }; // moving into left wall
    const gravityWells: GravityWell[] = [];
    const bumpers: Bumper[] = [];
    const width = 600;
    const height = 500;

    const trajectory = PhysicsEngine.simulateTrajectory(
      startX,
      startY,
      velocity,
      gravityWells,
      bumpers,
      width,
      height,
      30
    );

    const hasBounce = trajectory.some((p) => p.isBounce);
    assertTrue(hasBounce, "Trajectory should mark a bounce point when colliding with left wall");
    
    // Later points should have x > startX (moving right after reflection)
    const lastPoint = trajectory[trajectory.length - 1];
    assertGreaterThan(lastPoint.x, 12, "Reflected point should move away from left wall");
  });

  // Test 3: Inverse-Square Gravity Well Force Deflection
  suite.test("PhysicsEngine.updateOrb applies Newtonian attraction and mass scaling", () => {
    const orb: PlayerOrb = {
      x: 300,
      y: 300,
      vx: 0,
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
    };

    // Well positioned to the right at (400, 300)
    const well: GravityWell = {
      id: "gw_test",
      x: 400,
      y: 300,
      radius: 150,
      innerRadius: 10,
      strength: 5000,
      pulseSpeed: 0.05,
      pulseOffset: 0,
      color: "#00F0FF",
    };

    const { hitBottom } = PhysicsEngine.updateOrb(orb, [well], 600, 600, 1.0);
    assertFalse(hitBottom, "Orb should not hit bottom");
    assertGreaterThan(orb.vx, 0, "Orb should accelerate rightward toward the positive gravity well");
    assertEquals(orb.trailHistory.length, 1, "Trail history should record 1 position");
  });

  // Test 4: Bumper Geometric Restitution Collision
  suite.test("PhysicsEngine.checkBumperCollision calculates restitution impulse and position offset", () => {
    const orb: PlayerOrb = {
      x: 290,
      y: 200,
      vx: 10,
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
    };

    const bumper: Bumper = {
      id: "b1",
      x: 300,
      y: 200,
      radius: 20,
      type: "BOUNCE_SUPER",
      hp: 2,
      maxHp: 2,
      points: 200,
      shards: 10,
      pulsePhase: 0,
      color: "#39FF14",
      glowColor: "rgba(57,255,20,0.4)",
      isDestroyed: false,
    };

    const result = PhysicsEngine.checkBumperCollision(orb, bumper, 1.0);
    assertTrue(result.hit, "Orb should collide with bumper");
    assertLessThan(orb.vx, 0, "Velocity should reverse along collision normal");
    assertGreaterThan(result.impulse, 0, "Impulse should be positive scalar");
  });

  // Test 5: Laser Hazard Ray-Segment Collision
  suite.test("PhysicsEngine.checkLaserCollision detects orthogonal laser intersection", () => {
    const orb: PlayerOrb = {
      x: 300,
      y: 250,
      vx: 0,
      vy: 5,
      radius: 12,
      baseRadius: 12,
      mass: 1.0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      trailColor: "#00F0FF",
      hp: 100,
      maxHp: 100,
      shields: 0,
      maxShields: 0,
      energy: 0,
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
    };

    const horizontalLaser: LaserBeam = {
      id: "laser_1",
      startX: 200,
      startY: 250,
      endX: 400,
      endY: 250,
      angle: 0,
      angularVelocity: 0,
      length: 200,
      isActive: true,
      warmupTimer: 0,
      activeTimer: 0,
      duration: 180,
      interval: 120,
      damage: 1,
      color: "#FF0055",
    };

    const isHitActive = PhysicsEngine.checkLaserCollision(orb, horizontalLaser);
    assertTrue(isHitActive, "Active laser beam crossing orb center must register hit");

    horizontalLaser.isActive = false;
    const isHitInactive = PhysicsEngine.checkLaserCollision(orb, horizontalLaser);
    assertFalse(isHitInactive, "Inactive laser beam must not register hit");
  });

  // Test 6: Boss Core and Orbital Drone Collisions
  suite.test("PhysicsEngine.checkBossCollisions handles shield drones and core rebounds", () => {
    const orb: PlayerOrb = {
      x: 300,
      y: 150,
      vx: 0,
      vy: 10,
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
    };

    const boss: BossEntity = {
      id: "boss_vortex",
      name: "VORTEX TITAN",
      type: "VORTEX_TITAN",
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 40,
      hp: 1800,
      maxHp: 1800,
      phase: 1,
      maxPhases: 3,
      attackTimer: 0,
      attackCooldown: 180,
      color: "#BF00FF",
      glowColor: "rgba(0, 240, 255, 0.7)",
      drones: [
        { x: 300, y: 160, angle: 0, orbitRadius: 40, radius: 12, hp: 150, maxHp: 150, color: "#00F0FF" },
      ],
      shieldActive: true,
      enraged: false,
    };

    // Should hit drone 0 first
    const droneCollision = PhysicsEngine.checkBossCollisions(orb, boss);
    assertFalse(droneCollision.hitCore, "Should hit drone before core");
    assertEquals(droneCollision.hitDroneIndex, 0, "Should report drone index 0");

    // Destroy drone 0, now check core hit
    boss.drones[0].hp = 0;
    orb.x = 300;
    orb.y = 170;
    orb.vx = 0;
    orb.vy = 10;

    const coreCollision = PhysicsEngine.checkBossCollisions(orb, boss);
    assertTrue(coreCollision.hitCore, "Should hit boss core when drone is destroyed");
  });

  // Test 7: Shard Vacuum Magnetics & Harvest Bounds
  suite.test("PhysicsEngine.updateShards accelerates shards toward vessel within magnet radius", () => {
    const orb: PlayerOrb = {
      x: 300,
      y: 300,
      radius: 12,
      baseRadius: 12,
      vx: 0,
      vy: 0,
      mass: 1.0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      trailColor: "#00F0FF",
      hp: 100,
      maxHp: 100,
      shields: 1,
      maxShields: 1,
      energy: 0,
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
    };

    const shards: ShardPickup[] = [
      { id: "s1", x: 320, y: 300, vx: 0, vy: 0, value: 10, type: "STANDARD", radius: 5, color: "#00F0FF", life: 100 },
      { id: "s2", x: 550, y: 550, vx: 0, vy: 0, value: 50, type: "RARE", radius: 8, color: "#FFD700", life: 100 },
    ];

    // s1 is at dist 20, inside magnet (90)
    PhysicsEngine.updateShards(shards, orb, 0);
    assertLessThan(shards[0].x, 320, "Shard 1 should move toward orb x=300");

    // Move s1 inside collect radius
    shards[0].x = 310;
    const result2 = PhysicsEngine.updateShards(shards, orb, 0);
    assertEquals(result2.collectedCount, 1, "Shard 1 should be collected");
    assertEquals(result2.totalValue, 10, "Collected value should be 10");
  });

  return suite;
}
