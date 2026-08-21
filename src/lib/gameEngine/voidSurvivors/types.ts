// Void Survivors (Nova Protocol) - Type Definitions
// Aegis Arcade Universe Master Suite
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

export type EnemyType =
  | "MITE"
  | "STALKER"
  | "SPITTER"
  | "GOLIATH"
  | "VOID_BEHEMOTH"
  | "SINGULARITY_COLOSSUS";

export type GemType = "GREEN" | "BLUE" | "VIOLET" | "CORE_GOLD";

export type WeaponId = "BLADES" | "LIGHTNING" | "DRONES" | "MISSILES";

export type AugmentCategory = "WEAPON" | "STAT" | "EVOLUTION";

export type AugmentRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface WeaponState {
  level: number; // 0 = unacquired, 1-6 = active tiers
  cooldownTimer: number;
  baseCooldown: number;
  damage: number;
  count: number;
  radius: number;
  isEvolved: boolean;
}

export interface PlayerStats {
  moveSpeedBonus: number; // multiplier e.g. 1.0 = base
  damageBonus: number; // multiplier e.g. 1.0 = base
  cooldownReduction: number; // e.g. 0.0 = 0% reduction
  magnetRadiusBonus: number; // multiplier e.g. 1.0 = base
  critChance: number; // 0.0 to 1.0
  critMultiplier: number; // e.g. 2.0x
  shieldSlots: number;
  shieldRegenTimer: number;
  shieldRegenRate: number; // seconds per shield point
  dashCooldownMax: number;
  dashDuration: number;
}

export interface VoidPlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // radians
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  level: number;
  xp: number;
  xpRequired: number;
  speed: number;
  magnetRadius: number;
  dashTimer: number;
  dashCooldownTimer: number;
  dashVx: number;
  dashVy: number;
  isDashing: boolean;
  iframeTimer: number;
  isExtracting: boolean;
  extractionProgress: number; // 0.0 to 3.0 seconds
  stats: PlayerStats;
  weapons: {
    blades: WeaponState;
    lightning: WeaponState;
    drones: WeaponState;
    missiles: WeaponState;
  };
  totalKills: number;
  totalDamageDealt: number;
  shardsEarned: number;
  score: number;
}

export interface VoidEnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  shardsValue: number;
  color: string;
  iframeTimer: number; // per-enemy weapon hit cooldown
  shootTimer: number;
  angle: number;
  bossPhase?: number;
  isBoss?: boolean;
}

export interface EnemyProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface XPGemEntity {
  id: string;
  type: GemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  color: string;
  radius: number;
  isAttracted: boolean;
  pursuitTimer: number;
}

export interface BladeEntity {
  angle: number;
  radius: number;
  orbitDist: number;
  trailPoints: { x: number; y: number; alpha: number }[];
}

export interface DroneEntity {
  id: string;
  angleOffset: number;
  orbitRadius: number;
  targetEnemyId: string | null;
  targetX: number;
  targetY: number;
  beamActive: boolean;
  beamIntensity: number;
  damageTickTimer: number;
}

export interface MissileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetEnemyId: string | null;
  life: number;
  maxLife: number;
  damage: number;
  aoeRadius: number;
  speed: number;
  smokeTimer: number;
}

export interface LightningArc {
  points: { x: number; y: number }[];
  branches: { points: { x: number; y: number }[] }[];
  life: number;
  maxLife: number;
  color: string;
}

export interface ExtractionBeacon {
  x: number;
  y: number;
  radius: number;
  isActive: boolean;
  progress: number; // 0.0 to 3.0
  maxProgress: number; // 3.0 seconds
  pulseTimer: number;
}

export interface VoidAugmentCard {
  id: string;
  name: string;
  category: AugmentCategory;
  rarity: AugmentRarity;
  level: number;
  maxLevel: number;
  icon: string;
  tagline: string;
  description: string;
  weaponId?: WeaponId;
  statBonus?: {
    moveSpeedBonus?: number;
    damageMult?: number;
    cooldownReduction?: number;
    magnetRadiusBonus?: number;
    maxHpBonus?: number;
    healAmount?: number;
    shieldSlotsBonus?: number;
    critChanceBonus?: number;
    projectileCount?: number;
    radiusBonus?: number;
  };
}

export interface FloatingDamageNumber {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export interface VoidSurvivorsCanvasProps {
  onScoreUpdate: (score: number) => void;
  onShardsCollected: (shards: number) => void;
  onLevelUp?: (level: number) => void;
  onGameOver: (survivedSeconds: number, score: number, extracted: boolean) => void;
  shipColor?: string;
}
