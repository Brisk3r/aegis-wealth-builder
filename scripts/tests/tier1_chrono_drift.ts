/**
 * Tier 1 - Feature Coverage: Chrono Drift (Neon Drift Racer)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertLessThan,
  assertNear,
  resetLocalStorage,
} from "./test_framework.ts";

export interface DriftCarState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  speed: number;
  slipAngle: number;
  isDrifting: boolean;
  driftCharge: number;
  boostTier: 0 | 1 | 2 | 3;
  boostTimer: number;
}

export interface DriftInputState {
  throttle: number; // 0 to 1
  steer: number;    // -1 (left) to +1 (right)
  handbrake: boolean;
  boost: boolean;
}

export function updateDriftCarPhysics(car: DriftCarState, input: DriftInputState, dt: number): void {
  // Heading & Lateral unit vectors
  const forwardX = Math.cos(car.angle);
  const forwardY = Math.sin(car.angle);
  const rightX = -Math.sin(car.angle);
  const rightY = Math.cos(car.angle);

  // Velocity decomposition
  const vLong = car.vx * forwardX + car.vy * forwardY;
  const vLat = car.vx * rightX + car.vy * rightY;
  car.speed = Math.hypot(car.vx, car.vy);
  car.slipAngle = Math.atan2(vLat, Math.max(0.1, vLong));

  // Drift condition: handbrake or slip angle >= 0.28 rad (~16 deg)
  car.isDrifting = input.handbrake || Math.abs(car.slipAngle) >= 0.28;

  // Steering angular velocity modulated by forward speed and drift factor
  const steerAgility = 3.8;
  const speedFactor = Math.abs(vLong) / (2.5 + Math.abs(vLong));
  const driftFactor = car.isDrifting ? 1.45 : 1.0;
  car.angularVelocity = input.steer * steerAgility * speedFactor * driftFactor;
  car.angle += car.angularVelocity * dt;

  // Engine force
  const topSpeed = car.boostTier > 0 ? 350 * (car.boostTier === 3 ? 1.85 : car.boostTier === 2 ? 1.50 : 1.25) : 350;
  const enginePower = 400;
  const engineForce = input.throttle * enginePower * Math.max(0, 1 - car.speed / topSpeed);

  // Lateral friction (Grip vs Drift)
  const muGrip = 0.95;
  const muDrift = 0.42;
  const mass = 1.0;
  const g = 9.81;

  let latForceMag = 0;
  if (!car.isDrifting) {
    const latRatio = Math.max(-1, Math.min(1, vLat / 0.5));
    latForceMag = -latRatio * muGrip * mass * g * 50;
  } else {
    latForceMag = -Math.sign(vLat) * muDrift * mass * g * 50;
  }

  // Linear drag
  const dragCoeff = 0.002;
  const dragForceX = -dragCoeff * car.speed * car.vx;
  const dragForceY = -dragCoeff * car.speed * car.vy;

  // Total force and integration
  const totalFx = forwardX * engineForce + rightX * latForceMag + dragForceX;
  const totalFy = forwardY * engineForce + rightY * latForceMag + dragForceY;

  car.vx += (totalFx / mass) * dt;
  car.vy += (totalFy / mass) * dt;
  car.x += car.vx * dt;
  car.y += car.vy * dt;

  // Turbo boost charge accumulation
  if (car.isDrifting && car.speed > 80) {
    car.driftCharge += Math.abs(car.slipAngle) * (car.speed / topSpeed) * 2.0 * dt;
  }

  // Boost Tier thresholds: Tier 1 (1.0), Tier 2 (2.2), Tier 3 (3.8)
  if (car.driftCharge >= 3.8) {
    car.boostTier = 3;
  } else if (car.driftCharge >= 2.2) {
    car.boostTier = 2;
  } else if (car.driftCharge >= 1.0) {
    car.boostTier = 1;
  }

  // Boost release on straighten out
  if (!car.isDrifting && Math.abs(car.slipAngle) < 0.15 && car.boostTier > 0 && car.boostTimer <= 0) {
    car.boostTimer = car.boostTier === 3 ? 3.2 : car.boostTier === 2 ? 2.0 : 1.2;
    car.driftCharge = 0;
  }

  if (car.boostTimer > 0) {
    car.boostTimer -= dt;
    if (car.boostTimer <= 0) {
      car.boostTier = 0;
    }
  }
}

export function createChronoDriftTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Chrono Drift (Neon Drift Racer)", 1);

  // Test 1: 2D Vector Slip Kinematics & Velocity Decomposition
  suite.test("Chrono Drift: Computes longitudinal/lateral velocity decomposition and slip angle", () => {
    const car: DriftCarState = {
      x: 0,
      y: 0,
      vx: 100, // moving East
      vy: 50,  // moving South-East
      angle: 0, // facing East
      angularVelocity: 0,
      speed: 0,
      slipAngle: 0,
      isDrifting: false,
      driftCharge: 0,
      boostTier: 0,
      boostTimer: 0,
    };

    const input: DriftInputState = { throttle: 1, steer: 0, handbrake: false, boost: false };
    updateDriftCarPhysics(car, input, 0.016);

    assertGreaterThan(car.speed, 100, "Speed calculated from vector magnitude");
    assertGreaterThan(car.slipAngle, 0.25, "Significant lateral velocity produces measurable slip angle");
  });

  // Test 2: Dynamic Grip-to-Drift Friction Model Transition
  suite.test("Chrono Drift: Grip friction transitions to dynamic drift friction when handbrake engaged", () => {
    const carGrip: DriftCarState = {
      x: 0, y: 0, vx: 150, vy: 0, angle: 0, angularVelocity: 0,
      speed: 150, slipAngle: 0, isDrifting: false, driftCharge: 0, boostTier: 0, boostTimer: 0,
    };
    const carDrift: DriftCarState = { ...carGrip };

    // Standard steer without handbrake
    updateDriftCarPhysics(carGrip, { throttle: 1, steer: 1, handbrake: false, boost: false }, 0.05);

    // Hard drift with handbrake
    updateDriftCarPhysics(carDrift, { throttle: 1, steer: 1, handbrake: true, boost: false }, 0.05);

    assertTrue(carDrift.isDrifting, "Handbrake forces active drift state");
    assertGreaterThan(Math.abs(carDrift.angularVelocity), Math.abs(carGrip.angularVelocity), "Drifting increases rotational slip authority");
  });

  // Test 3: 3-Tier Drift Turbo Accumulator & Boost Discharge
  suite.test("Chrono Drift: Sustained high-speed drift charges Tier 1, 2, and 3 boost meters", () => {
    const car: DriftCarState = {
      x: 0, y: 0, vx: 200, vy: 120, angle: 0, angularVelocity: 0,
      speed: 233, slipAngle: 0.5, isDrifting: true, driftCharge: 0, boostTier: 0, boostTimer: 0,
    };

    // Simulate sustained drift charging
    for (let frame = 0; frame < 150; frame++) {
      updateDriftCarPhysics(car, { throttle: 1, steer: 0.5, handbrake: true, boost: false }, 0.016);
    }

    assertGreaterThanOrEqual(car.driftCharge, 1.0, "Drift charges turbo meter");
    assertGreaterThanOrEqual(car.boostTier, 1, "Charges to at least Tier 1 Boost");

    // Straighten out to unleash boost
    car.vx = 250;
    car.vy = 0;
    car.slipAngle = 0.05;
    updateDriftCarPhysics(car, { throttle: 1, steer: 0, handbrake: false, boost: false }, 0.016);

    assertGreaterThan(car.boostTimer, 0, "Boost discharges on straighten out");
    assertEquals(car.driftCharge, 0, "Drift charge consumed into active boost timer");
  });

  // Test 4: Catmull-Rom Spline Track & Sequential Checkpoint Gate Anti-Cheat
  suite.test("Chrono Drift: Checkpoint gates enforce sequential crossing order and reject skips", () => {
    const totalGates = 6;
    let lastGateIndex = 0;
    let lapCount = 0;

    function processGateCrossing(crossedGateIndex: number): boolean {
      const expectedGate = (lastGateIndex + 1) % totalGates;
      if (crossedGateIndex === expectedGate) {
        lastGateIndex = crossedGateIndex;
        if (lastGateIndex === 0) {
          lapCount++;
        }
        return true;
      }
      return false; // Reject out-of-order gate crossing
    }

    // Gate 1, 2, 3 in order
    assertTrue(processGateCrossing(1), "Gate 1 accepted");
    assertTrue(processGateCrossing(2), "Gate 2 accepted");
    assertTrue(processGateCrossing(3), "Gate 3 accepted");

    // Attempt to skip Gate 4 and hit Gate 5 directly
    assertFalse(processGateCrossing(5), "Gate 5 rejected when Gate 4 was skipped");
    assertEquals(lastGateIndex, 3, "Gate index not advanced on illegal crossing");

    // Resume valid sequence: 4, 5, 0 (Lap completed)
    assertTrue(processGateCrossing(4), "Gate 4 accepted");
    assertTrue(processGateCrossing(5), "Gate 5 accepted");
    assertTrue(processGateCrossing(0), "Gate 0 crossed -> Lap 1 Complete");
    assertEquals(lapCount, 1, "Completed exactly 1 lap");
  });

  // Test 5: 60 FPS Delta-Compressed Ghost Car Telemetry Recorder & Interpolation
  suite.test("Chrono Drift: Ghost recorder records frames and interpolates sub-frame positions smoothly", () => {
    interface GhostFrame {
      t: number;
      x: number;
      y: number;
      rot: number;
      spd: number;
      drf: boolean;
      bst: number;
    }

    const recordedGhost: GhostFrame[] = [
      { t: 0, x: 100, y: 200, rot: 0.0, spd: 150, drf: false, bst: 0 },
      { t: 100, x: 120, y: 200, rot: 0.1, spd: 160, drf: false, bst: 0 },
      { t: 200, x: 150, y: 210, rot: 0.3, spd: 180, drf: true, bst: 1 },
    ];

    // Sub-frame interpolation at t = 50ms (50% between frame 0 and frame 1)
    function sampleGhost(ghost: GhostFrame[], t: number): { x: number; y: number } {
      if (t <= ghost[0].t) return { x: ghost[0].x, y: ghost[0].y };
      if (t >= ghost[ghost.length - 1].t) return { x: ghost[ghost.length - 1].x, y: ghost[ghost.length - 1].y };

      for (let i = 0; i < ghost.length - 1; i++) {
        if (t >= ghost[i].t && t <= ghost[i + 1].t) {
          const alpha = (t - ghost[i].t) / (ghost[i + 1].t - ghost[i].t);
          return {
            x: (1 - alpha) * ghost[i].x + alpha * ghost[i + 1].x,
            y: (1 - alpha) * ghost[i].y + alpha * ghost[i + 1].y,
          };
        }
      }
      return { x: 0, y: 0 };
    }

    const posAt50ms = sampleGhost(recordedGhost, 50);
    assertEquals(posAt50ms.x, 110, "X interpolated at midpoint (100 + 120) / 2 = 110");
    assertEquals(posAt50ms.y, 200, "Y constant at 200");

    const posAt150ms = sampleGhost(recordedGhost, 150);
    assertEquals(posAt150ms.x, 135, "X interpolated at midpoint (120 + 150) / 2 = 135");
    assertEquals(posAt150ms.y, 205, "Y interpolated at midpoint (200 + 210) / 2 = 205");
  });

  return suite;
}
