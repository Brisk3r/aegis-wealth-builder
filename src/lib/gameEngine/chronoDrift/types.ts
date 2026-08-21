// ============================================================================
// CHRONO DRIFT (NEON RACER) - TYPE DEFINITIONS
// Aegis Arcade Universe (Project Phoenix)
// Strict 7-Bit ASCII Compliance -- Zero-Mojibake -- ANSI Windows-1252 Safe
// ============================================================================

export type BoostTier = 0 | 1 | 2 | 3;

export interface DriftCarState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;           // Heading orientation in radians (-PI to PI)
  angularVelocity: number; // Rad/sec
  speed: number;           // Magnitude of velocity vector
  vLong: number;           // Longitudinal forward velocity
  vLat: number;            // Lateral rightward velocity
  slipAngle: number;       // Drift slip angle beta = atan2(vLat, vLong)
  isDrifting: boolean;     // Active drift boolean
  driftCharge: number;     // Accumulated drift charge (0.0 to 5.0)
  boostTier: BoostTier;    // Active or pending boost tier (0 to 3)
  boostTimer: number;      // Remaining boost duration in seconds
  boostMultiplier: number; // Current boost speed/accel multiplier
  isOffRoad: boolean;      // True if car has strayed off asphalt onto run-off
  color: string;           // Primary hull color
  trailColor: string;      // Ion spark / trail color
}

export interface GhostTelemetryFrame {
  t: number;      // Elapsed race time in milliseconds
  x: number;      // World X coordinate (rounded to 1 decimal place)
  y: number;      // World Y coordinate (rounded to 1 decimal place)
  rot: number;    // Heading angle in radians (rounded to 2 decimal places)
  spd: number;    // Speed in px/s
  drf: boolean;   // Drift state
  bst: number;    // Boost tier
}

export interface CheckpointGate {
  id: number;
  index: number;
  x: number;
  y: number;
  angle: number;  // Spline tangent angle
  p1: { x: number; y: number }; // Left gate boundary point
  p2: { x: number; y: number }; // Right gate boundary point
  width: number;
  sector: 1 | 2 | 3;
}

export interface BoostPad {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // Direction of boost impulse
  power: number; // Speed impulse multiplier
}

export interface TrackPoint {
  x: number;
  y: number;
  width: number;
  curbLeft?: boolean;
  curbRight?: boolean;
}

export interface TrackCircuit {
  id: string;
  name: string;
  totalLaps: number;
  width: number;
  centerline: TrackPoint[];
  interpolatedSpline: { x: number; y: number; normalX: number; normalY: number; width: number }[];
  checkpoints: CheckpointGate[];
  boostPads: BoostPad[];
  startX: number;
  startY: number;
  startAngle: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface SkidmarkSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: string;
}

export interface TireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxLife: number;
  life: number;
  color: string;
  alpha: number;
  type: "SMOKE" | "SPARK" | "FIRE" | "PLASMA" | "WARP";
}

export interface ChronoDriftTelemetry {
  currentLap: number;
  totalLaps: number;
  lapTimeMs: number;
  bestLapMs: number;
  totalTimeMs: number;
  bestRaceMs: number;
  currentSector: 1 | 2 | 3;
  sectorSplitTimes: number[];
  bestSectorSplits: number[];
  driftScore: number;
  driftMultiplier: number;
  topSpeedKmh: number;
  currentSpeedKmh: number;
  shardsEarned: number;
  lastDeltaTimeMs: number | null; // Delta vs best lap at last checkpoint
}

export interface ChronoDriftCanvasProps {
  onScoreUpdate?: (score: number) => void;
  onShardsCollected?: (shards: number) => void;
  onGameOver?: (totalTimeMs: number, bestLapMs: number, shardsEarned: number) => void;
  onLapComplete?: (lapTimeMs: number, isBestLap: boolean) => void;
  onRaceFinish?: (totalTimeMs: number, bestLapMs: number, driftScore: number) => void;
  onShardsEarned?: (shards: number) => void;
  shipColor?: string;
  carColor?: string;
  trailColor?: string;
  trackId?: string;
}

export type RaceStatus = "STANDBY" | "COUNTDOWN" | "RACING" | "FINISHED" | "PAUSED";

export interface ChronoGameState {
  width: number;
  height: number;
  cameraX: number;
  cameraY: number;
  cameraTargetX: number;
  cameraTargetY: number;
  cameraZoom: number;
  car: DriftCarState;
  circuit: TrackCircuit;
  raceStatus: RaceStatus;
  countdownTimer: number;
  currentLap: number;
  totalLaps: number;
  lapStartTime: number;
  raceStartTime: number;
  currentLapElapsedMs: number;
  totalRaceElapsedMs: number;
  bestLapMs: number;
  bestRaceMs: number;
  expectedCheckpointIdx: number;
  lastCheckpointTimeMs: number;
  sectorSplitTimes: number[];
  bestSectorSplits: number[];
  lastDeltaTimeMs: number | null;
  driftScore: number;
  driftCombo: number;
  shardsEarned: number;
  currentGhostBuffer: GhostTelemetryFrame[];
  bestGhostBuffer: GhostTelemetryFrame[];
  particles: TireParticle[];
  skidmarks: SkidmarkSegment[];
  screenShake: number;
  lastFrameTime: number;
}
