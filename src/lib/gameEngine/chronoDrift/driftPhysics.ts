// ============================================================================
// CHRONO DRIFT (NEON RACER) - 2D VECTOR DRIFT KINEMATICS & COLLISION ENGINE
// Aegis Arcade Universe (Project Phoenix)
// Strict 7-Bit ASCII Compliance -- Zero-Mojibake -- ANSI Windows-1252 Safe
// ============================================================================

import { DriftCarState, TrackCircuit, CheckpointGate, BoostPad, BoostTier } from "./types";

export interface ControlInputs {
  throttle: number; // 0.0 to 1.0
  brake: number;    // 0.0 to 1.0
  steer: number;    // -1.0 (Left) to 1.0 (Right)
  handbrake: boolean;
  boostTrigger: boolean;
}

export interface PhysicsStepResult {
  car: DriftCarState;
  skidEmitted: boolean;
  skidAlpha: number;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    type: "SMOKE" | "SPARK" | "FIRE" | "PLASMA";
  }[];
  gateCrossed: CheckpointGate | null;
  boostPadTriggered: BoostPad | null;
  boostDischargedTier: BoostTier;
  wallCollided: boolean;
  driftPointsGained: number;
}

/**
 * 2D Cross Product orientation test for segment intersection.
 */
export function ccw(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

/**
 * Tests if segment (A, B) intersects segment (C, D).
 */
export function segmentsIntersect(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  d: { x: number; y: number }
): boolean {
  const ccw1 = ccw(a, b, c);
  const ccw2 = ccw(a, b, d);
  const ccw3 = ccw(c, d, a);
  const ccw4 = ccw(c, d, b);

  return (
    ((ccw1 > 0 && ccw2 < 0) || (ccw1 < 0 && ccw2 > 0)) &&
    ((ccw3 > 0 && ccw4 < 0) || (ccw3 < 0 && ccw4 > 0))
  );
}

/**
 * Finds closest distance from car to track spline and determines if car is off-road.
 */
export function queryTrackProximity(
  px: number,
  py: number,
  circuit: TrackCircuit
): { distance: number; halfWidth: number; isOffRoad: boolean; nearestIndex: number } {
  const spline = circuit.interpolatedSpline;
  let minSq = Infinity;
  let nearestIdx = 0;

  for (let i = 0; i < spline.length; i++) {
    const sp = spline[i];
    const dx = px - sp.x;
    const dy = py - sp.y;
    const sq = dx * dx + dy * dy;
    if (sq < minSq) {
      minSq = sq;
      nearestIdx = i;
    }
  }

  const dist = Math.sqrt(minSq);
  const halfWidth = spline[nearestIdx].width / 2;
  const isOffRoad = dist > halfWidth + 8; // Small grace threshold

  return {
    distance: dist,
    halfWidth,
    isOffRoad,
    nearestIndex: nearestIdx,
  };
}

/**
 * Integrates car physics by one delta step dt.
 */
export function stepDriftPhysics(
  car: DriftCarState,
  inputs: ControlInputs,
  circuit: TrackCircuit,
  dt: number,
  vesselStats: { speedMult?: number; mass?: number; bounceMult?: number } = {},
  expectedGateIndex: number = 0
): PhysicsStepResult {
  const dtClamped = Math.min(Math.max(dt, 0.001), 0.05);

  const prevX = car.x;
  const prevY = car.y;

  const mass = vesselStats.mass || 1.0;
  const speedMult = vesselStats.speedMult || 1.0;

  // Base physics constants
  const baseFMax = 680 * mass * speedMult;
  const baseTopSpeed = 480 * speedMult;
  const vRef = 50.0;
  const omegaMax = 3.6;
  const muGrip = 0.95;
  const muDrift = 0.42;
  const muDirt = 0.45;

  // 1. Boost Decay & Multipliers
  let activeBoostMult = 1.0;
  let boostDischargedTier: BoostTier = 0;

  if (car.boostTimer > 0) {
    car.boostTimer -= dtClamped;
    if (car.boostTier === 1) activeBoostMult = 1.25;
    else if (car.boostTier === 2) activeBoostMult = 1.50;
    else if (car.boostTier === 3) activeBoostMult = 1.85;

    if (car.boostTimer <= 0) {
      car.boostTimer = 0;
      car.boostTier = 0;
      car.boostMultiplier = 1.0;
    }
  }

  // 2. Off-road Proximity Check
  const trackProximity = queryTrackProximity(car.x, car.y, circuit);
  car.isOffRoad = trackProximity.isOffRoad;

  const offRoadSpeedCap = car.isOffRoad ? 0.45 : 1.0;
  const topSpeed = baseTopSpeed * activeBoostMult * offRoadSpeedCap;
  const engineForceMax = baseFMax * activeBoostMult;

  // 3. Heading & Direction Vectors
  const cosA = Math.cos(car.angle);
  const sinA = Math.sin(car.angle);
  const uFx = cosA;
  const uFy = sinA;
  const uRx = -sinA;
  const uRy = cosA;

  // Longitudinal and Lateral Velocities
  car.vLong = car.vx * uFx + car.vy * uFy;
  car.vLat = car.vx * uRx + car.vy * uRy;
  car.speed = Math.hypot(car.vx, car.vy);

  // 4. Slip Angle beta = atan2(vLat, vLong)
  car.slipAngle = Math.atan2(car.vLat, Math.max(0.1, Math.abs(car.vLong)));
  const absBeta = Math.abs(car.slipAngle);

  // Active drift condition
  const isHandbraking = inputs.handbrake;
  car.isDrifting = (absBeta >= 0.26 || isHandbraking) && car.speed > 55;

  // 5. Steering Dynamics
  const driftAgilityMult = car.isDrifting ? 1.42 : 1.0;
  const speedSteerFactor = Math.min(1.0, Math.abs(car.vLong) / (vRef + Math.abs(car.vLong)));
  const targetOmega = inputs.steer * omegaMax * speedSteerFactor * driftAgilityMult;

  car.angularVelocity = targetOmega;
  car.angle += car.angularVelocity * dtClamped;

  // Normalize angle to [-PI, PI]
  while (car.angle > Math.PI) car.angle -= 2 * Math.PI;
  while (car.angle < -Math.PI) car.angle += 2 * Math.PI;

  // Recompute heading vectors after steering turn
  const newCosA = Math.cos(car.angle);
  const newSinA = Math.sin(car.angle);
  const newUFx = newCosA;
  const newUFy = newSinA;
  const newURx = -newSinA;
  const newURy = newCosA;

  // 6. Force Calculations
  // Drive Force
  let fEngineX = 0;
  let fEngineY = 0;

  if (inputs.throttle > 0) {
    const throttleRatio = Math.max(0, 1.0 - car.speed / topSpeed);
    const driveScalar = inputs.throttle * engineForceMax * throttleRatio;
    fEngineX += newUFx * driveScalar;
    fEngineY += newUFy * driveScalar;
  }

  // Brake / Reverse Force
  let fBrakeX = 0;
  let fBrakeY = 0;
  if (inputs.brake > 0) {
    if (car.vLong > 15) {
      const brakeScalar = inputs.brake * 720 * mass;
      fBrakeX -= newUFx * brakeScalar;
      fBrakeY -= newUFy * brakeScalar;
    } else {
      // Reverse drive
      const revScalar = inputs.brake * 280 * mass * Math.max(0, 1.0 - car.speed / 160);
      fBrakeX -= newUFx * revScalar;
      fBrakeY -= newUFy * revScalar;
    }
  }

  // Lateral Friction & Grip
  let fLatX = 0;
  let fLatY = 0;
  const g = 980;

  if (car.isOffRoad) {
    // Dirt off-road lateral slip
    const latScalar = -Math.sign(car.vLat) * muDirt * mass * g;
    fLatX += newURx * latScalar;
    fLatY += newURy * latScalar;
  } else if (!car.isDrifting && !isHandbraking) {
    // High Grip
    const clampedSlip = Math.max(-1.0, Math.min(1.0, car.vLat / 22.0));
    const latScalar = -clampedSlip * muGrip * mass * g;
    fLatX += newURx * latScalar;
    fLatY += newURy * latScalar;
  } else {
    // Dynamic Drift Friction
    const latScalar = -Math.sign(car.vLat) * muDrift * mass * g;
    fLatX += newURx * latScalar;
    fLatY += newURy * latScalar;
  }

  // Drag Force
  const dragCoeff = car.isOffRoad ? 0.0075 : 0.0016;
  const fDragX = -dragCoeff * car.speed * car.vx - car.vx * (car.isOffRoad ? 1.8 : 0.45);
  const fDragY = -dragCoeff * car.speed * car.vy - car.vy * (car.isOffRoad ? 1.8 : 0.45);

  // 7. Symplectic Euler Integration
  const totalFx = fEngineX + fBrakeX + fLatX + fDragX;
  const totalFy = fEngineY + fBrakeY + fLatY + fDragY;

  const ax = totalFx / mass;
  const ay = totalFy / mass;

  car.vx += ax * dtClamped;
  car.vy += ay * dtClamped;

  car.x += car.vx * dtClamped;
  car.y += car.vy * dtClamped;

  // 8. 3-Tier Drift Turbo Accumulation
  let driftPointsGained = 0;

  if (car.isDrifting && !car.isOffRoad) {
    const chargeRate = absBeta * (car.speed / baseTopSpeed) * 1.8;
    car.driftCharge = Math.min(5.0, car.driftCharge + chargeRate * dtClamped);

    // Compute drift tier
    if (car.driftCharge >= 3.8) {
      car.boostTier = 3;
    } else if (car.driftCharge >= 2.2) {
      car.boostTier = 2;
    } else if (car.driftCharge >= 1.0) {
      car.boostTier = 1;
    } else {
      car.boostTier = 0;
    }

    driftPointsGained = Math.round(absBeta * car.speed * 0.18 * (car.boostTier + 1));
  } else {
    // If drift has ended and we had accumulated charge, discharge turbo surge!
    if (car.driftCharge >= 1.0 && (!isHandbraking || inputs.boostTrigger)) {
      boostDischargedTier = car.boostTier;
      if (car.boostTier === 1) {
        car.boostTimer = 1.2;
        car.boostMultiplier = 1.25;
      } else if (car.boostTier === 2) {
        car.boostTimer = 2.0;
        car.boostMultiplier = 1.50;
      } else if (car.boostTier === 3) {
        car.boostTimer = 3.2;
        car.boostMultiplier = 1.85;
      }
    }
    car.driftCharge = 0;
    if (car.boostTimer <= 0) {
      car.boostTier = 0;
    }
  }

  // 9. Particles and Skidmark Generation
  const particles: PhysicsStepResult["particles"] = [];
  let skidEmitted = false;
  let skidAlpha = 0;

  const carLength = 36;
  const carWidth = 22;

  // Left and Right rear tire world positions
  const rlX = car.x - newUFx * (carLength / 2) - newURx * (carWidth / 2);
  const rlY = car.y - newUFy * (carLength / 2) - newURy * (carWidth / 2);
  const rrX = car.x - newUFx * (carLength / 2) + newURx * (carWidth / 2);
  const rrY = car.y - newUFy * (carLength / 2) + newURy * (carWidth / 2);

  if (car.isDrifting || isHandbraking) {
    skidEmitted = true;
    skidAlpha = Math.min(0.65, 0.2 + absBeta * 0.4);

    let sparkColor = "#FFFFFF";
    let pType: "SMOKE" | "SPARK" | "FIRE" | "PLASMA" = "SMOKE";

    if (car.boostTier === 1) {
      sparkColor = "#00F0FF";
      pType = "SPARK";
    } else if (car.boostTier === 2) {
      sparkColor = "#FF9900";
      pType = "FIRE";
    } else if (car.boostTier === 3) {
      sparkColor = "#BF00FF";
      pType = "PLASMA";
    }

    // Emit from both rear tires
    particles.push({
      x: rlX + (Math.random() - 0.5) * 4,
      y: rlY + (Math.random() - 0.5) * 4,
      vx: -car.vx * 0.15 + (Math.random() - 0.5) * 40,
      vy: -car.vy * 0.15 + (Math.random() - 0.5) * 40,
      color: sparkColor,
      type: pType,
    });

    particles.push({
      x: rrX + (Math.random() - 0.5) * 4,
      y: rrY + (Math.random() - 0.5) * 4,
      vx: -car.vx * 0.15 + (Math.random() - 0.5) * 40,
      vy: -car.vy * 0.15 + (Math.random() - 0.5) * 40,
      color: sparkColor,
      type: pType,
    });
  }

  // If Turbo Boost is firing, emit supersonic exhaust jets
  if (car.boostTimer > 0) {
    const exhaustColor = car.boostTier === 3 ? "#FFE600" : car.boostTier === 2 ? "#FF5500" : "#00F0FF";
    particles.push({
      x: car.x - newUFx * (carLength / 2 + 4),
      y: car.y - newUFy * (carLength / 2 + 4),
      vx: -newUFx * (200 + Math.random() * 100),
      vy: -newUFy * (200 + Math.random() * 100),
      color: exhaustColor,
      type: car.boostTier === 3 ? "PLASMA" : "FIRE",
    });
  }

  // 10. Checkpoint Gate Crossing Test
  let gateCrossed: CheckpointGate | null = null;
  const currPos = { x: car.x, y: car.y };
  const prevPos = { x: prevX, y: prevY };

  // Test the expected gate first, and nearby gates if any
  const gateToTest = circuit.checkpoints[expectedGateIndex];
  if (gateToTest) {
    if (segmentsIntersect(prevPos, currPos, gateToTest.p1, gateToTest.p2)) {
      gateCrossed = gateToTest;
    }
  }

  // 11. Boost Pad Triggering Test
  let boostPadTriggered: BoostPad | null = null;
  for (const pad of circuit.boostPads) {
    const dx = car.x - pad.x;
    const dy = car.y - pad.y;
    if (Math.abs(dx) < pad.width / 2 + 10 && Math.abs(dy) < pad.height / 2 + 10) {
      boostPadTriggered = pad;
      // Instant directional velocity impulse
      const impulseCos = Math.cos(pad.angle);
      const impulseSin = Math.sin(pad.angle);
      car.vx += impulseCos * 260 * pad.power;
      car.vy += impulseSin * 260 * pad.power;
      car.boostTier = 3;
      car.boostTimer = 2.4;
      car.boostMultiplier = 1.85;
      break;
    }
  }

  // 12. Boundary Cushion & Wall Collisions
  let wallCollided = false;
  const bounds = circuit.bounds;
  if (
    car.x < bounds.minX ||
    car.x > bounds.maxX ||
    car.y < bounds.minY ||
    car.y > bounds.maxY
  ) {
    wallCollided = true;
    car.vx *= -0.5;
    car.vy *= -0.5;
    car.x = Math.max(bounds.minX + 10, Math.min(bounds.maxX - 10, car.x));
    car.y = Math.max(bounds.minY + 10, Math.min(bounds.maxY - 10, car.y));
    car.driftCharge = 0;
    car.boostTier = 0;
    car.boostTimer = 0;
  }

  return {
    car,
    skidEmitted,
    skidAlpha,
    particles,
    gateCrossed,
    boostPadTriggered,
    boostDischargedTier,
    wallCollided,
    driftPointsGained,
  };
}
