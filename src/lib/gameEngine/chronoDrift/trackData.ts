// ============================================================================
// CHRONO DRIFT (NEON RACER) - TRACK & SPLINE GENERATOR
// Aegis Arcade Universe (Project Phoenix)
// Strict 7-Bit ASCII Compliance -- Zero-Mojibake -- ANSI Windows-1252 Safe
// ============================================================================

import { CheckpointGate, BoostPad, TrackCircuit, TrackPoint } from "./types";

/**
 * Evaluates Catmull-Rom spline point and tangent between P1 and P2 given P0, P1, P2, P3 and t in [0, 1].
 */
export function evaluateCatmullRom(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number; tx: number; ty: number; nx: number; ny: number } {
  const t2 = t * t;
  const t3 = t2 * t;

  // Position
  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

  // Tangent derivative dP/dt
  const tx =
    0.5 *
    (-p0.x +
      p2.x +
      2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t +
      3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2);

  const ty =
    0.5 *
    (-p0.y +
      p2.y +
      2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t +
      3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2);

  const len = Math.hypot(tx, ty) || 1;
  const normTx = tx / len;
  const normTy = ty / len;

  // Normal vector perpendicular to tangent (to the right: -ty, tx)
  const nx = -normTy;
  const ny = normTx;

  return { x, y, tx: normTx, ty: normTy, nx, ny };
}

/**
 * Builds a complete smooth closed Catmull-Rom spline circuit from discrete waypoint nodes.
 */
export function buildTrackCircuit(
  id: string,
  name: string,
  rawPoints: TrackPoint[],
  trackWidth: number = 130,
  boostPadLocations: { segmentIndex: number; t: number; power: number }[] = []
): TrackCircuit {
  const n = rawPoints.length;
  const samplesPerSegment = 24;
  const interpolated: { x: number; y: number; normalX: number; normalY: number; width: number }[] = [];
  const checkpoints: CheckpointGate[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < n; i++) {
    const p0 = rawPoints[(i - 1 + n) % n];
    const p1 = rawPoints[i];
    const p2 = rawPoints[(i + 1) % n];
    const p3 = rawPoints[(i + 2) % n];

    // Create Checkpoint Gate at each primary control node
    const evalAtStart = evaluateCatmullRom(p0, p1, p2, p3, 0);
    const gateWidth = p1.width || trackWidth;
    const halfW = (gateWidth + 30) / 2; // Gate extends slightly beyond asphalt

    // Sector 1: first third, Sector 2: second third, Sector 3: final third
    const sector: 1 | 2 | 3 = i < Math.floor(n / 3) ? 1 : i < Math.floor((2 * n) / 3) ? 2 : 3;

    checkpoints.push({
      id: i,
      index: i,
      x: p1.x,
      y: p1.y,
      angle: Math.atan2(evalAtStart.ty, evalAtStart.tx),
      p1: {
        x: p1.x - evalAtStart.nx * halfW,
        y: p1.y - evalAtStart.ny * halfW,
      },
      p2: {
        x: p1.x + evalAtStart.nx * halfW,
        y: p1.y + evalAtStart.ny * halfW,
      },
      width: gateWidth,
      sector,
    });

    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const res = evaluateCatmullRom(p0, p1, p2, p3, t);
      const w = (1 - t) * (p1.width || trackWidth) + t * (p2.width || trackWidth);

      interpolated.push({
        x: res.x,
        y: res.y,
        normalX: res.nx,
        normalY: res.ny,
        width: w,
      });

      if (res.x < minX) minX = res.x;
      if (res.y < minY) minY = res.y;
      if (res.x > maxX) maxX = res.x;
      if (res.y > maxY) maxY = res.y;
    }
  }

  // Generate Boost Pads
  const boostPads: BoostPad[] = boostPadLocations.map((b, idx) => {
    const segIdx = b.segmentIndex % n;
    const p0 = rawPoints[(segIdx - 1 + n) % n];
    const p1 = rawPoints[segIdx];
    const p2 = rawPoints[(segIdx + 1) % n];
    const p3 = rawPoints[(segIdx + 2) % n];
    const res = evaluateCatmullRom(p0, p1, p2, p3, b.t);

    return {
      id: idx + 1,
      x: res.x,
      y: res.y,
      width: 70,
      height: 40,
      angle: Math.atan2(res.ty, res.tx),
      power: b.power,
    };
  });

  // Start position is placed just before checkpoint 0, aligned along spline
  const startEval = evaluateCatmullRom(
    rawPoints[n - 1],
    rawPoints[0],
    rawPoints[1],
    rawPoints[2],
    0.02
  );

  return {
    id,
    name,
    totalLaps: 3,
    width: trackWidth,
    centerline: rawPoints,
    interpolatedSpline: interpolated,
    checkpoints,
    boostPads,
    startX: startEval.x,
    startY: startEval.y,
    startAngle: Math.atan2(startEval.ty, startEval.tx),
    bounds: {
      minX: minX - 250,
      minY: minY - 250,
      maxX: maxX + 250,
      maxY: maxY + 250,
    },
  };
}

// ============================================================================
// DEFAULT TRACK 1: "NEON APEX GRAND PRIX"
// Featuring high-speed start straight, sweeping 180-degree hairpin, chicane,
// and double-apex turbo drift bends.
// ============================================================================

const TRACK_1_NODES: TrackPoint[] = [
  { x: 450, y: 350, width: 140 },  // 0: Start / Finish Line straight
  { x: 950, y: 350, width: 140 },  // 1: High speed entry straight
  { x: 1400, y: 450, width: 130, curbRight: true }, // 2: Sweeping right turn 1
  { x: 1750, y: 800, width: 130, curbRight: true }, // 3: Turn 1 apex
  { x: 1650, y: 1250, width: 130, curbRight: true }, // 4: Turn 1 exit
  { x: 1200, y: 1450, width: 130, curbLeft: true },  // 5: Sector 2 transition
  { x: 800, y: 1300, width: 120, curbLeft: true },   // 6: Chicane entry
  { x: 600, y: 1600, width: 120, curbRight: true },  // 7: Chicane flip
  { x: 400, y: 1950, width: 130, curbRight: true },  // 8: Hairpin approach
  { x: 200, y: 2250, width: 140, curbRight: true },  // 9: Hairpin entry
  { x: -100, y: 2050, width: 140, curbLeft: true },  // 10: Hairpin apex
  { x: -50, y: 1550, width: 130, curbLeft: true },   // 11: Sector 3 hairpin exit
  { x: 150, y: 1100, width: 130, curbRight: true },  // 12: High-speed S-turn
  { x: -100, y: 700, width: 130, curbLeft: true },   // 13: Final bend entry
  { x: 50, y: 400, width: 140, curbRight: true },    // 14: Final straight alignment
];

const TRACK_1_BOOST_PADS = [
  { segmentIndex: 1, t: 0.5, power: 1.5 },   // Straightaway boost
  { segmentIndex: 5, t: 0.6, power: 1.4 },   // Sector 2 exit boost
  { segmentIndex: 11, t: 0.7, power: 1.6 },  // Post-hairpin recovery boost
];

export const NEON_APEX_CIRCUIT: TrackCircuit = buildTrackCircuit(
  "neon_apex",
  "NEON APEX GRAND PRIX",
  TRACK_1_NODES,
  130,
  TRACK_1_BOOST_PADS
);

// Pre-recorded Benchmark Ghost Telemetry (sample baseline run: ~14.8 seconds lap)
export function generateBenchmarkGhost(circuit: TrackCircuit): import("./types").GhostTelemetryFrame[] {
  const frames: import("./types").GhostTelemetryFrame[] = [];
  const totalFrames = 880; // ~14.6s at 60 FPS
  const spline = circuit.interpolatedSpline;
  const n = spline.length;

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const splineIdx = Math.floor(progress * n) % n;
    const nextIdx = (splineIdx + 1) % n;
    const p0 = spline[splineIdx];
    const p1 = spline[nextIdx];
    const subT = (progress * n) - Math.floor(progress * n);

    const x = Math.round(((1 - subT) * p0.x + subT * p1.x) * 10) / 10;
    const y = Math.round(((1 - subT) * p0.y + subT * p1.y) * 10) / 10;
    const angle = Math.round(Math.atan2(p1.y - p0.y, p1.x - p0.x) * 100) / 100;
    const isDrifting = i % 180 > 70 && i % 180 < 150;

    frames.push({
      t: Math.round((i * 1000) / 60),
      x,
      y,
      rot: angle,
      spd: isDrifting ? 380 : 460,
      drf: isDrifting,
      bst: isDrifting && i % 180 > 130 ? 2 : 0,
    });
  }

  return frames;
}
