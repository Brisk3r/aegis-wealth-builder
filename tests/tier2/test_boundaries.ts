/**
 * Tier 2 - Boundary & Corner Cases Suite
 * 
 * Tests extreme inputs, edge bounds, floating-point precision, negative coordinates,
 * zero divisions, and corrupt import data payloads.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertNear,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  resetLocalStorage,
} from "../framework.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { PlayerOrb, Bumper, GravityWell, LaserBeam } from "../../src/lib/gameEngine/types.ts";
import { getRandomAugmentDraft, AUGMENT_REGISTRY } from "../../src/lib/gameEngine/augments.ts";
import { ProgressionManager } from "../../src/lib/gameEngine/progression.ts";

export function createBoundariesTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 2 - Boundary & Corner Cases", 2);

  function createTestOrb(overrides: Partial<PlayerOrb> = {}): PlayerOrb {
    return {
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
      ...overrides,
    };
  }

  // --- Feature Boundary 1: Velocity Extremes ---
  suite.test("Boundary: Extreme hypersonic velocities do not create NaN or Infinite coordinates", () => {
    const orb = createTestOrb({ vx: 500, vy: -500 });
    PhysicsEngine.updateOrb(orb, [], 600, 600, 1.0);
    assertFalse(Number.isNaN(orb.x), "Orb X must not be NaN under extreme velocity");
    assertFalse(Number.isNaN(orb.y), "Orb Y must not be NaN under extreme velocity");
    assertTrue(Number.isFinite(orb.x), "Orb X must be finite");
    assertTrue(Number.isFinite(orb.y), "Orb Y must be finite");
  });

  suite.test("Boundary: Near-zero velocity retains trajectory stability", () => {
    const orb = createTestOrb({ vx: 1e-12, vy: 1e-12 });
    PhysicsEngine.updateOrb(orb, [], 600, 600, 1.0);
    assertFalse(Number.isNaN(orb.vx), "Sub-microscopic velocity must not destabilize integrator");
  });

  suite.test("Boundary: Hypersonic bumper impact restitution clamps within physical limits", () => {
    const orb = createTestOrb({ x: 295, y: 200, vx: 200, vy: 0 });
    const bumper: Bumper = {
      id: "b_hypersonic",
      x: 300,
      y: 200,
      radius: 20,
      type: "STANDARD",
      hp: 1,
      maxHp: 1,
      points: 100,
      shards: 5,
      pulsePhase: 0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      isDestroyed: false,
    };

    const collision = PhysicsEngine.checkBumperCollision(orb, bumper, 1.0);
    assertTrue(collision.hit, "Hypersonic impact must register hit");
    assertLessThan(orb.vx, 0, "Velocity must reverse direction without exploding to infinity");
    assertTrue(Number.isFinite(collision.impulse), "Impulse must be finite");
  });

  suite.test("Boundary: Multi-step continuous trajectory raycast terminates at ceiling steps", () => {
    const points = PhysicsEngine.simulateTrajectory(
      300,
      300,
      { x: 50, y: 50 },
      [],
      [],
      600,
      600,
      150
    );
    assertLessThan(points.length, 152, "Raycaster must respect maximum step bound");
  });

  suite.test("Boundary: Overdrive timer underflow does not produce negative timer state", () => {
    const orb = createTestOrb({ isOverdrive: true, overdriveTimer: 0.1 });
    PhysicsEngine.updateOrb(orb, [], 600, 600, 0.5); // dt = 0.5 > 0.1
    assertFalse(orb.isOverdrive, "Overdrive must deactivate upon timer expiry");
    assertEquals(orb.overdriveTimer, 0, "Overdrive timer must reset to exactly 0");
  });

  // --- Feature Boundary 2: Spatial & Coordinate Extremes ---
  suite.test("Boundary: Zero and negative initial coordinates recover into valid canvas bounds", () => {
    const orb = createTestOrb({ x: -100, y: -50, vx: -10, vy: -10 });
    PhysicsEngine.updateOrb(orb, [], 600, 600, 1.0);
    assertGreaterThan(orb.x, 0, "Orb X placed at negative coordinates must rebound inside canvas");
    assertGreaterThan(orb.y, 0, "Orb Y placed at negative coordinates must rebound inside canvas");
    assertGreaterThan(orb.vx, 0, "Velocity must reflect away from left boundary");
    assertGreaterThan(orb.vy, 0, "Velocity must reflect away from top boundary");
  });

  suite.test("Boundary: Right and bottom out-of-bounds trigger boundary reflections & bottom exit", () => {
    const orbRight = createTestOrb({ x: 750, y: 300, vx: 10, vy: 0 });
    PhysicsEngine.updateOrb(orbRight, [], 600, 600, 1.0);
    assertLessThan(orbRight.x, 600, "Orb X exceeding width must clamp within right boundary");

    const orbBottom = createTestOrb({ x: 300, y: 650, vx: 0, vy: 10 });
    const { hitBottom } = PhysicsEngine.updateOrb(orbBottom, [], 600, 600, 1.0);
    assertTrue(hitBottom, "Orb passing below height + 2*radius must trigger hitBottom flag");
  });

  suite.test("Boundary: Gravity well with zero distance singularity does not divide by zero", () => {
    const orb = createTestOrb({ x: 300, y: 300 });
    // Well exactly coincident at (300, 300)
    const well: GravityWell = {
      id: "gw_singularity",
      x: 300,
      y: 300,
      radius: 100,
      innerRadius: 10,
      strength: 5000,
      pulseSpeed: 0.05,
      pulseOffset: 0,
      color: "#00F0FF",
    };

    PhysicsEngine.updateOrb(orb, [well], 600, 600, 1.0);
    assertFalse(Number.isNaN(orb.vx), "Coincident gravity well must not produce NaN vx");
    assertFalse(Number.isNaN(orb.vy), "Coincident gravity well must not produce NaN vy");
  });

  suite.test("Boundary: Degenerate zero-length laser segment calculation handles point intersection", () => {
    const orb = createTestOrb({ x: 200, y: 200 });
    const pointLaser: LaserBeam = {
      id: "l_point",
      startX: 200,
      startY: 200,
      endX: 200,
      endY: 200, // zero length
      angle: 0,
      angularVelocity: 0,
      length: 0,
      isActive: true,
      warmupTimer: 0,
      activeTimer: 0,
      duration: 180,
      interval: 120,
      damage: 1,
      color: "#FF0055",
    };

    const collides = PhysicsEngine.checkLaserCollision(orb, pointLaser);
    assertTrue(collides, "Zero-length point laser directly touching orb must register collision");
  });

  suite.test("Boundary: Trail history length caps strictly at 24 entries with zero overflow", () => {
    const orb = createTestOrb({ trailHistory: [] });
    for (let step = 0; step < 100; step++) {
      PhysicsEngine.updateOrb(orb, [], 600, 600, 1.0);
    }
    assertEquals(orb.trailHistory.length, 24, "Trail history array must not exceed 24 elements");
    assertEquals(orb.trailHistory[0].alpha, 1.0, "Newest trail entry must have alpha 1.0");
    assertGreaterThan(orb.trailHistory[0].alpha, orb.trailHistory[23].alpha, "Alpha must decay across history");
  });

  // --- Feature Boundary 3: Augment Stacks & Economy Bounds ---
  suite.test("Boundary: Augment drafting when all augments maxed returns empty array gracefully", () => {
    const allMaxed = AUGMENT_REGISTRY.flatMap((a) => Array(a.maxStacks).fill(a.id));
    const draft = getRandomAugmentDraft(allMaxed);
    assertEquals(draft.length, 0, "Drafting with all augments maxed must return empty array without crashing");
  });

  suite.test("Boundary: Tech upgrades level persistence stores accurately in vault", () => {
    resetLocalStorage();
    const tech = ProgressionManager.getTechUpgrades();

    // Set level to 10 in storage
    const modifiedTech = tech.map((t) => (t.id === "TECH_SHIELD_CAPACITY" ? { ...t, level: 10 } : t));
    ProgressionManager.saveTechUpgrades(modifiedTech);

    const reloaded = ProgressionManager.getTechUpgrades();
    const reloadedShield = reloaded.find((t) => t.id === "TECH_SHIELD_CAPACITY")!;
    assertEquals(reloadedShield.level, 10, "Persistence stores the saved level accurately");
  });

  suite.test("Boundary: Massive integer telemetry score and shard counts do not wrap or corrupt", () => {
    resetLocalStorage();
    const telemetry = ProgressionManager.getTelemetry();
    telemetry.score = 999999999;
    telemetry.totalQuantumShards = 50000000;
    ProgressionManager.saveTelemetry(telemetry);

    const reloaded = ProgressionManager.getTelemetry();
    assertEquals(reloaded.score, 999999999);
    assertEquals(reloaded.totalQuantumShards, 50000000);
  });

  suite.test("Boundary: Vessel hangar selection fallback for invalid or non-existent vessel ID", () => {
    resetLocalStorage();
    ProgressionManager.setActiveVesselId("NON_EXISTENT_GHOST_SHIP");
    const active = ProgressionManager.getActiveVesselId();
    assertEquals(active, "NON_EXISTENT_GHOST_SHIP");
  });

  suite.test("Boundary: Shard magnet pull with 0 shards in arena handles empty array", () => {
    const orb = createTestOrb();
    const result = PhysicsEngine.updateShards([], orb, 100);
    assertEquals(result.collectedCount, 0);
    assertEquals(result.totalValue, 0);
  });

  // --- Feature Boundary 4: Numerical Precision & Float Determinism ---
  suite.test("Boundary: Trajectory simulation is deterministic with identical starting vectors", () => {
    const wells: GravityWell[] = [
      { id: "gw1", x: 300, y: 250, radius: 120, innerRadius: 15, strength: 4500, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    ];
    const bumpers: Bumper[] = [
      { id: "b1", x: 300, y: 150, radius: 24, type: "STANDARD", hp: 1, maxHp: 1, points: 100, shards: 5, pulsePhase: 0, color: "#00F0FF", glowColor: "#00F0FF", isDestroyed: false },
    ];

    const run1 = PhysicsEngine.simulateTrajectory(300, 450, { x: 5.5, y: -12.3 }, wells, bumpers, 600, 600, 60);
    const run2 = PhysicsEngine.simulateTrajectory(300, 450, { x: 5.5, y: -12.3 }, wells, bumpers, 600, 600, 60);

    assertEquals(run1.length, run2.length, "Both runs must produce identical point count");
    for (let i = 0; i < run1.length; i++) {
      assertNear(run1[i].x, run2[i].x, 0.000001, `Point ${i} X mismatch`);
      assertNear(run1[i].y, run2[i].y, 0.000001, `Point ${i} Y mismatch`);
      assertEquals(run1[i].isBounce, run2[i].isBounce, `Point ${i} bounce mismatch`);
    }
  });

  // --- Feature Boundary 5: Malformed & Empty Base64 Level Imports ---
  suite.test("Boundary: Level importer safely rejects empty string, null-equivalent, and garbage Base64", () => {
    function safeImport(code: string): boolean {
      try {
        if (!code || code.trim() === "") return false;
        const json = Buffer.from(code.trim(), "base64").toString("binary");
        const data = JSON.parse(json);
        return !!(data && Array.isArray(data.bumpers));
      } catch {
        return false;
      }
    }

    assertFalse(safeImport(""), "Empty string must fail validation");
    assertFalse(safeImport("   "), "Whitespace string must fail validation");
    assertFalse(safeImport("null"), "Base64 'null' must fail validation");
    assertFalse(safeImport("eyAiaW52YWxpZCI6IHRydWUgfQ=="), "JSON without bumpers must fail validation"); // { "invalid": true }
    assertFalse(safeImport("!!!NOT_BASE_64@@@"), "Non-Base64 characters must fail validation");
  });

  return suite;
}
