// Dynamic Cosmic Weather & Elemental Sector Auras Engine
// Pure 7-bit ASCII compliant. Affects physics constants, particle visuals, and reward multipliers.

export type SectorWeatherType = 
  | "CALM_VOID" 
  | "SOLAR_FLARE" 
  | "CRYO_NEBULA" 
  | "VOID_SINGULARITY" 
  | "ION_STORM";

export interface WeatherParticleConfig {
  spawnRate: number;
  particleColor: string;
  glowColor: string;
  driftVx: number;
  driftVy: number;
  pulseSpeed: number;
  sparkCountOnBumper: number;
}

export interface SectorWeather {
  type: SectorWeatherType;
  name: string;
  badge: string;
  description: string;
  color: string;
  speedMultiplier: number;
  dragMultiplier: number;
  shardYieldBonus: number;
  overdriveChargeRate: number;
  particleConfig: WeatherParticleConfig;
}

export const SECTOR_WEATHER_PRESETS: SectorWeather[] = [
  {
    type: "CALM_VOID",
    name: "Calm Void",
    badge: "[STABLE]",
    description: "Standard gravitational spacetime. Nominal trajectory physics.",
    color: "#00F0FF",
    speedMultiplier: 1.0,
    dragMultiplier: 1.0,
    shardYieldBonus: 1.0,
    overdriveChargeRate: 1.0,
    particleConfig: {
      spawnRate: 1.0,
      particleColor: "#00F0FF",
      glowColor: "rgba(0, 240, 255, 0.4)",
      driftVx: 0.0,
      driftVy: 0.2,
      pulseSpeed: 1.0,
      sparkCountOnBumper: 12,
    },
  },
  {
    type: "SOLAR_FLARE",
    name: "Solar Flare Corona",
    badge: "[SOLAR AURA]",
    description: "+25% projectile velocity & explosive shockwaves on bumper impacts.",
    color: "#FF9900",
    speedMultiplier: 1.25,
    dragMultiplier: 0.9,
    shardYieldBonus: 1.2,
    overdriveChargeRate: 1.3,
    particleConfig: {
      spawnRate: 2.2,
      particleColor: "#FFAA00",
      glowColor: "rgba(255, 153, 0, 0.6)",
      driftVx: 0.3,
      driftVy: 0.5,
      pulseSpeed: 1.8,
      sparkCountOnBumper: 20,
    },
  },
  {
    type: "CRYO_NEBULA",
    name: "Cryo Freeze Nebula",
    badge: "[CRYO AURA]",
    description: "Sub-zero temperatures reduce air drag. Bumpers shatter into crystal fragments.",
    color: "#00FFCC",
    speedMultiplier: 1.1,
    dragMultiplier: 0.8,
    shardYieldBonus: 1.35,
    overdriveChargeRate: 1.15,
    particleConfig: {
      spawnRate: 1.6,
      particleColor: "#00FFCC",
      glowColor: "rgba(0, 255, 204, 0.5)",
      driftVx: -0.1,
      driftVy: 0.15,
      pulseSpeed: 0.8,
      sparkCountOnBumper: 16,
    },
  },
  {
    type: "VOID_SINGULARITY",
    name: "Void Singularity Surge",
    badge: "[SINGULARITY]",
    description: "Gravitational warping pulls orbs inward. +75% Quantum Shard yields!",
    color: "#BF00FF",
    speedMultiplier: 0.95,
    dragMultiplier: 1.1,
    shardYieldBonus: 1.75,
    overdriveChargeRate: 1.5,
    particleConfig: {
      spawnRate: 2.0,
      particleColor: "#BF00FF",
      glowColor: "rgba(191, 0, 255, 0.6)",
      driftVx: 0.0,
      driftVy: -0.2,
      pulseSpeed: 2.0,
      sparkCountOnBumper: 18,
    },
  },
  {
    type: "ION_STORM",
    name: "Electromagnetic Ion Storm",
    badge: "[ION STORM]",
    description: "High-voltage lightning arcs between bumpers. 2x Overdrive charge speed!",
    color: "#39FF14",
    speedMultiplier: 1.15,
    dragMultiplier: 0.95,
    shardYieldBonus: 1.4,
    overdriveChargeRate: 2.0,
    particleConfig: {
      spawnRate: 2.5,
      particleColor: "#39FF14",
      glowColor: "rgba(57, 255, 20, 0.6)",
      driftVx: 0.4,
      driftVy: 0.4,
      pulseSpeed: 2.5,
      sparkCountOnBumper: 24,
    },
  },
];

export class WeatherSystem {
  /**
   * Retrieves weather preset for a given 1-indexed sector number.
   */
  public static getWeatherForSector(sectorNumber: number): SectorWeather {
    const safeSector = Math.max(1, Math.floor(sectorNumber));
    const idx = (safeSector - 1) % SECTOR_WEATHER_PRESETS.length;
    return SECTOR_WEATHER_PRESETS[idx];
  }

  /**
   * Retrieves weather preset by unique enum type.
   */
  public static getWeatherByType(type: SectorWeatherType): SectorWeather {
    const found = SECTOR_WEATHER_PRESETS.find((w) => w.type === type);
    return found || SECTOR_WEATHER_PRESETS[0];
  }

  /**
   * Returns all available sector weather presets.
   */
  public static getAllWeatherPresets(): SectorWeather[] {
    return SECTOR_WEATHER_PRESETS;
  }

  /**
   * Calculates atmospheric drag decay for a velocity vector given a weather preset.
   * Standard nominal base drag coefficient is 0.998 per step.
   */
  public static applyWeatherDrag(
    vx: number,
    vy: number,
    weather: SectorWeather,
    dt: number = 1.0,
    baseDragCoeff: number = 0.998
  ): { vx: number; vy: number } {
    // Effective per-step drag adjusted by weather dragMultiplier
    const effectiveDrag = 1.0 - (1.0 - baseDragCoeff) * weather.dragMultiplier;
    const factor = Math.pow(Math.max(0.0, Math.min(1.0, effectiveDrag)), dt);
    return {
      vx: vx * factor,
      vy: vy * factor,
    };
  }

  /**
   * Formats a clean 7-bit ASCII weather telemetry badge.
   */
  public static formatWeatherBadge(weather: SectorWeather): string {
    return weather.badge;
  }
}
