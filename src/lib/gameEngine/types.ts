export type GameStatus = 
  | "IDLE" 
  | "AIMING" 
  | "FLYING" 
  | "DRAFTING" 
  | "GAMEOVER" 
  | "VICTORY" 
  | "PAUSED";

export type GameMode = 
  | "CAMPAIGN" 
  | "ENDLESS" 
  | "BOSS_RUSH" 
  | "DAILY_CHALLENGE" 
  | "TIME_ATTACK" 
  | "CUSTOM_SANDBOX";

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  mass: number;
  color: string;
  glowColor: string;
  trailColor: string;
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  energy: number;
  maxEnergy: number;
  overdriveCharge: number;
  isOverdrive: boolean;
  overdriveTimer: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  piercing: number;
  splitCount: number;
  lightningArcs: number;
  isGhost: boolean;
  trailHistory: { x: number; y: number; alpha: number }[];
  launchesLeft: number;
  maxLaunches: number;
}

export type BumperType = 
  | "STANDARD" 
  | "BOUNCE_SUPER" 
  | "EXPLOSIVE" 
  | "PRISM_LASER" 
  | "TESLA_NODE" 
  | "WARP_PORTAL" 
  | "SHIELD_BEACON" 
  | "GOLDEN_CORE";

export interface Bumper {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: BumperType;
  hp: number;
  maxHp: number;
  points: number;
  shards: number;
  pulsePhase: number;
  color: string;
  glowColor: string;
  isDestroyed: boolean;
  respawnTimer?: number;
  targetPortalId?: string;
}

export interface GravityWell {
  id: string;
  x: number;
  y: number;
  radius: number;
  innerRadius: number;
  strength: number; // Positive = attract, Negative = repel
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  angularVelocity: number;
  length: number;
  isActive: boolean;
  warmupTimer: number;
  activeTimer: number;
  duration: number;
  interval: number;
  damage: number;
  color: string;
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

export type BossType = 
  | "VORTEX_TITAN" 
  | "CHRONO_SINGULARITY" 
  | "SOLAR_HYPERION" 
  | "AEGIS_DREADNOUGHT"
  | "CHRONOS_PRIME"
  | "VOID_LEVIATHAN";

export interface BossDrone {
  x: number;
  y: number;
  angle: number;
  orbitRadius: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
}

export interface BossEntity {
  id: string;
  name: string;
  type: BossType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhases: number;
  attackTimer: number;
  attackCooldown: number;
  color: string;
  glowColor: string;
  drones: BossDrone[];
  shieldActive: boolean;
  enraged: boolean;
  dialogue?: string;
}

export interface ShardPickup {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  type: "STANDARD" | "RARE" | "OVERDRIVE_CELL";
  radius: number;
  color: string;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: "SPARK" | "SHOCKWAVE" | "SMOKE" | "TEXT" | "ORBITAL_RING" | "LASER_SPARK";
  text?: string;
}

export type AugmentRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface AugmentCard {
  id: string;
  name: string;
  tagline: string;
  description: string;
  rarity: AugmentRarity;
  category: "OFFENSE" | "DEFENSE" | "KINETIC" | "UTILITY";
  icon: string;
  stackCount: number;
  maxStacks: number;
}

export interface HullVessel {
  id: string;
  name: string;
  title: string;
  description: string;
  unlocked: boolean;
  cost: number;
  speedMultiplier: number;
  mass: number;
  bounceMultiplier: number;
  shieldSlots: number;
  specialTrait: string;
  color: string;
  trailColor: string;
}

export interface TechUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  costPerLevel: number;
  valuePerLevel: number;
  unit: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  rewardShards: number;
  unlocked: boolean;
}

export interface SectorConfig {
  sectorNumber: number;
  name: string;
  subtitle: string;
  targetScore: number;
  bumpersCount: number;
  gravityWellsCount: number;
  laserBeamsCount: number;
  hasBoss: boolean;
  bossType?: BossType;
  ambientColor: string;
  musicTheme: string;
}

export interface GameTelemetry {
  score: number;
  highScore: number;
  currentSector: number;
  maxSectorReached: number;
  quantumShardsRun: number;
  totalQuantumShards: number;
  comboCount: number;
  highestCombo: number;
  totalBounces: number;
  bossesDefeated: number;
  runsCompleted: number;
  totalPlayTimeSeconds: number;
}

export interface ModeConfig {
  mode: GameMode;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
  timeLimitSeconds?: number;
  startingLaunches: number;
  modifiers: string[];
}

export interface TacticalAbility {
  id: "EMP_PULSE" | "GRAVITY_ANCHOR" | "QUANTUM_CLONE";
  name: string;
  icon: string;
  hotkey: string;
  cooldownSeconds: number;
  currentCooldown: number;
  energyCost: number;
  description: string;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardShards: number;
  completed: boolean;
  claimed: boolean;
  expiresInHours: number;
}

export interface LeaderboardEntry {
  rank: number;
  pilotHandle: string;
  score: number;
  sector: number;
  vesselUsed: string;
  peakCombo: number;
  region: string;
  date: string;
}

export interface CustomLevelData {
  id: string;
  name: string;
  author: string;
  bumpers: Bumper[];
  gravityWells: GravityWell[];
  laserBeams: LaserBeam[];
  hasBoss: boolean;
  bossType?: BossType;
  targetScore: number;
  ambientColor: string;
}

