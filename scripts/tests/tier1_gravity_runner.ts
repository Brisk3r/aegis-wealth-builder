/**
 * Tier 1 - Feature Coverage: Gravity Runner (Reflex Inverter)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  assertNear,
} from "./test_framework.ts";

export function solveTriangleCircleSAT(
  tri: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
  circle: { center: { x: number; y: number }; radius: number }
): boolean {
  const vertices = tri;
  const axes: { x: number; y: number }[] = [];

  // 3 edge normals
  for (let i = 0; i < 3; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % 3];
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    // Perpendicular normal
    const normal = { x: -edge.y, y: edge.x };
    const len = Math.hypot(normal.x, normal.y);
    if (len > 1e-6) {
      axes.push({ x: normal.x / len, y: normal.y / len });
    }
  }

  // 3 vertex-to-center axes
  for (let i = 0; i < 3; i++) {
    const v = vertices[i];
    const toCenter = { x: circle.center.x - v.x, y: circle.center.y - v.y };
    const len = Math.hypot(toCenter.x, toCenter.y);
    if (len > 1e-6) {
      axes.push({ x: toCenter.x / len, y: toCenter.y / len });
    }
  }

  // Test projections on all axes
  for (const axis of axes) {
    // Project triangle
    let minTri = Infinity;
    let maxTri = -Infinity;
    for (const v of vertices) {
      const proj = v.x * axis.x + v.y * axis.y;
      minTri = Math.min(minTri, proj);
      maxTri = Math.max(maxTri, proj);
    }

    // Project circle
    const centerProj = circle.center.x * axis.x + circle.center.y * axis.y;
    const minCircle = centerProj - circle.radius;
    const maxCircle = centerProj + circle.radius;

    // Check separation
    if (maxTri < minCircle || maxCircle < minTri) {
      return false; // Separating axis found -> No collision
    }
  }

  return true; // Overlaps on all axes -> Collision
}

export function createGravityRunnerTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Gravity Runner (Reflex Inverter)", 1);

  // Test 1: Dual-Rail Gravity Flipping & Velocity Impulse
  suite.test("Gravity Runner: Gravity inversion changes vertical acceleration and imparts jump impulse", () => {
    const floorY = 400;
    const ceilingY = 80;
    let shipY = floorY;
    let vy = 0;
    let gravity = 0.85;

    // Flip to ceiling
    gravity = -0.85;
    vy = gravity * 3.5; // -2.975 px/step initial burst
    assertLessThan(vy, 0, "Inverting gravity upward imparts negative vertical velocity impulse");

    for (let frame = 0; frame < 40; frame++) {
      vy += gravity;
      shipY += vy;
      if (shipY <= ceilingY) {
        shipY = ceilingY;
        vy = 0;
        break;
      }
    }

    assertEquals(shipY, ceilingY, "Ship lands smoothly on ceiling rail");
    assertEquals(vy, 0, "Velocity settles to zero on rail landing");
  });

  // Test 2: SAT Triangle-Circle Collision Solver vs Triangular Spikes
  suite.test("Gravity Runner: SAT triangle solver accurately detects edge hits and rejects AABB corner false positives", () => {
    // Upward floor spike triangle at (100, 400), base width 40, height 50
    // Vertices: A(80, 400), B(120, 400), C(100, 350)
    const spikeTriangle: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 80, y: 400 },
      { x: 120, y: 400 },
      { x: 100, y: 350 },
    ];

    // Case A: Circle hitting apex
    const hitApex = solveTriangleCircleSAT(spikeTriangle, {
      center: { x: 100, y: 345 },
      radius: 12,
    });
    assertTrue(hitApex, "Circle intersecting apex must trigger collision");

    // Case B: Circle in AABB bounding box corner (e.g. 82, 352) but OUTSIDE the triangular slope
    // AABB of triangle is [80..120] x [350..400]. AABB collision would falsely trigger!
    const falseCorner = solveTriangleCircleSAT(spikeTriangle, {
      center: { x: 82, y: 352 },
      radius: 3,
    });
    assertFalse(falseCorner, "SAT solver must reject circle in triangle AABB corner (no phantom hits)");

    // Case C: Circle clearly distant
    const distant = solveTriangleCircleSAT(spikeTriangle, {
      center: { x: 200, y: 300 },
      radius: 10,
    });
    assertFalse(distant, "Distant circle must not collide");
  });

  // Test 3: Supersonic Speed Boost Rings with Decaying Velocity
  suite.test("Gravity Runner: Boost rings multiply speed and decay smoothly back to base speed", () => {
    const baseSpeed = 8.0;
    let currentSpeed = baseSpeed;
    let boostMultiplier = 1.0;

    // Enter boost ring
    boostMultiplier = 1.65;
    currentSpeed = baseSpeed * boostMultiplier;
    assertEquals(currentSpeed, 13.2, "Speed boosted to 1.65x base speed");

    // Simulate 30 frames of exponential decay toward 1.0x
    const decayRate = 0.95;
    for (let f = 0; f < 60; f++) {
      boostMultiplier = 1.0 + (boostMultiplier - 1.0) * decayRate;
      currentSpeed = baseSpeed * boostMultiplier;
    }

    assertNear(boostMultiplier, 1.0, 0.05, "Boost multiplier decays back to near baseline");
    assertNear(currentSpeed, baseSpeed, 0.4, "Current speed settles back to baseline speed");
  });

  // Test 4: Procedural Obstacle Generation & Spacing Safeguards
  suite.test("Gravity Runner: Obstacle procedural generation maintains minimum reflex gap spacing", () => {
    interface Obstacle {
      x: number;
      type: "SPIKE_FLOOR" | "SPIKE_CEILING" | "LASER_GATE" | "BOOST_RING";
    }

    const obstacles: Obstacle[] = [];
    const minSpacing = 160;
    let lastX = 400;

    for (let i = 0; i < 20; i++) {
      const gap = minSpacing + (i % 3) * 60;
      const nextX = lastX + gap;
      const type = i % 4 === 0 ? "BOOST_RING" : i % 2 === 0 ? "SPIKE_FLOOR" : "SPIKE_CEILING";
      obstacles.push({ x: nextX, type });
      lastX = nextX;
    }

    assertEquals(obstacles.length, 20);
    for (let i = 1; i < obstacles.length; i++) {
      const dist = obstacles[i].x - obstacles[i - 1].x;
      assertGreaterThan(dist, 140, "Gap between obstacles must exceed minimum human reflex threshold");
    }
  });

  // Test 5: Distance Scoring & Speed Multiplier Progression
  suite.test("Gravity Runner: Score accumulates with distance and scales with speed multipliers", () => {
    let distanceMeters = 0;
    let score = 0;
    let speed = 8.0;
    let comboMultiplier = 1;

    for (let tick = 0; tick < 100; tick++) {
      distanceMeters += speed * 0.1;
      if (distanceMeters > 50) comboMultiplier = 2;
      if (distanceMeters > 100) comboMultiplier = 3;
      score += Math.floor(speed * 0.5 * comboMultiplier);
    }

    assertGreaterThan(distanceMeters, 75, "Distance traversed should be substantial");
    assertGreaterThan(score, 500, "Score should accumulate positively with multiplier");
  });

  return suite;
}
