import { AchievementItem, GameTelemetry, HullVessel, TechUpgrade } from "./types";

const STORAGE_KEY_TELEMETRY = "aegis_kinetic_telemetry";
const STORAGE_KEY_TECH = "aegis_kinetic_tech";
const STORAGE_KEY_VESSELS = "aegis_kinetic_vessels";
const STORAGE_KEY_ACTIVE_VESSEL = "aegis_kinetic_active_vessel";
const STORAGE_KEY_ACTIVE_TRAIL = "aegis_kinetic_active_trail";
const STORAGE_KEY_UNLOCKED_TRAILS = "aegis_kinetic_unlocked_trails";
const STORAGE_KEY_ACHIEVEMENTS = "aegis_kinetic_achievements";
const STORAGE_KEY_SUPPLY_DROP = "aegis_kinetic_last_supply_drop";
const STORAGE_KEY_SEASON_PASS = "aegis_kinetic_season_pass";

export interface CosmeticTrail {
  id: string;
  name: string;
  color: string;
  cost: number;
  unlocked: boolean;
}

export interface SeasonPassReward {
  title: string;
  shards: number;
  icon: string;
  type: "SHARDS" | "HULL" | "TRAIL" | "AUDIO" | "SHIELD" | "RELIC" | "MOD" | "LENS" | "VISUAL" | "INSIGNIA" | "SOVEREIGN";
  cosmeticId?: string;
  description?: string;
}

export interface SeasonPassTier {
  tier: number;
  xpRequired: number;
  freeReward: SeasonPassReward;
  premiumReward: SeasonPassReward;
}

export interface SeasonPassData {
  seasonId: string;
  xp: number;
  isPremium: boolean;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

export const INITIAL_TECH_UPGRADES: TechUpgrade[] = [
  {
    id: "TECH_LAUNCH_VELOCITY",
    name: "Kinetic Accelerator",
    description: "Increases initial slingshot launch velocity.",
    icon: "[ACCEL]",
    level: 0,
    maxLevel: 10,
    costPerLevel: 100,
    valuePerLevel: 6,
    unit: "% Launch Speed",
  },
  {
    id: "TECH_MAGNET_RADIUS",
    name: "Quantum Magnetizer",
    description: "Expands magnetic harvest radius for Quantum Shards.",
    icon: "[MAGNET]",
    level: 0,
    maxLevel: 10,
    costPerLevel: 80,
    valuePerLevel: 25,
    unit: "px Radius",
  },
  {
    id: "TECH_BOUNCE_RESTITUTION",
    name: "Kinetic Elasticity",
    description: "Multiplies velocity boost gained on bumper collisions.",
    icon: "[BOUNCE]",
    level: 0,
    maxLevel: 10,
    costPerLevel: 120,
    valuePerLevel: 8,
    unit: "% Elastic Boost",
  },
  {
    id: "TECH_SHIELD_CAPACITY",
    name: "Aegis Nano-Plating",
    description: "Increases starting renewable kinetic shield capacity.",
    icon: "[SHIELD]",
    level: 0,
    maxLevel: 5,
    costPerLevel: 250,
    valuePerLevel: 1,
    unit: " Shield Unit",
  },
  {
    id: "TECH_OVERDRIVE_REACTOR",
    name: "Overdrive Supercharger",
    description: "Accelerates Overdrive energy gauge fill rate.",
    icon: "[REACTOR]",
    level: 0,
    maxLevel: 8,
    costPerLevel: 150,
    valuePerLevel: 12,
    unit: "% Charge Rate",
  },
  {
    id: "TECH_SHARD_YIELD",
    name: "Shard Extractor Matrix",
    description: "Increases total Quantum Shards harvested per run.",
    icon: "[SHARD]",
    level: 0,
    maxLevel: 10,
    costPerLevel: 100,
    valuePerLevel: 15,
    unit: "% Bonus Shards",
  },
  {
    id: "TECH_TRAJECTORY_CALCULATOR",
    name: "Sub-Space Trajectory Lens",
    description: "Extends trajectory line preview distance and bounces.",
    icon: "[LENS]",
    level: 0,
    maxLevel: 5,
    costPerLevel: 100,
    valuePerLevel: 20,
    unit: "% Preview Range",
  },
];

export const INITIAL_VESSELS: HullVessel[] = [
  {
    id: "PHOTON_DART",
    name: "Photon Dart",
    title: "Standard Interceptor",
    description: "Balanced kinetic weight and precision aerodynamics. Ideal for agile trajectory aiming.",
    unlocked: true,
    cost: 0,
    speedMultiplier: 1.0,
    mass: 1.0,
    bounceMultiplier: 1.0,
    shieldSlots: 1,
    specialTrait: "Balanced Trajectory & Recoil",
    color: "#00F0FF",
    trailColor: "#00F0FF",
  },
  {
    id: "VORTEX_STRIKER",
    name: "Vortex Striker",
    title: "Light Speed Skiff",
    description: "Hyper-light frame capable of blistering speeds and enhanced slingshot force.",
    unlocked: false,
    cost: 500,
    speedMultiplier: 1.35,
    mass: 0.75,
    bounceMultiplier: 1.25,
    shieldSlots: 0,
    specialTrait: "+35% Velocity & Fast Energy Build",
    color: "#39FF14",
    trailColor: "#39FF14",
  },
  {
    id: "TITAN_DREADNOUGHT",
    name: "Titan Dreadnought",
    title: "Heavy Kinetic Ram",
    description: "Massive reinforced titanium alloy that smashes obstacles and triggers massive shockwaves.",
    unlocked: false,
    cost: 1200,
    speedMultiplier: 0.85,
    mass: 2.2,
    bounceMultiplier: 0.9,
    shieldSlots: 3,
    specialTrait: "2.5x Smash Damage & Inherent +2 Shields",
    color: "#FF3366",
    trailColor: "#FF3366",
  },
  {
    id: "CHRONO_PHANTOM",
    name: "Chrono Phantom",
    title: "Quantum Phase Vessel",
    description: "Manipulates local gravitational spacetime to slow down hazard projectiles.",
    unlocked: false,
    cost: 2500,
    speedMultiplier: 1.1,
    mass: 0.9,
    bounceMultiplier: 1.1,
    shieldSlots: 2,
    specialTrait: "Automatic Bullet-Time Near Hazards",
    color: "#BF00FF",
    trailColor: "#BF00FF",
  },
  {
    id: "SOLAR_ECLIPSE",
    name: "Solar Eclipse",
    title: "Thermonuclear Core",
    description: "Emits continuous solar plasma corona that vaporizes nearby debris automatically.",
    unlocked: false,
    cost: 5000,
    speedMultiplier: 1.15,
    mass: 1.3,
    bounceMultiplier: 1.2,
    shieldSlots: 2,
    specialTrait: "Radiates 360-degree Solar Damage Aura",
    color: "#FF9900",
    trailColor: "#FF9900",
  },
  {
    id: "AEGIS_PRIME",
    name: "Aegis Prime",
    title: "Master Quantum Flagship",
    description: "The pinnacle of orbital engineering. Equipped with maximum energy arrays and double shard harvest.",
    unlocked: false,
    cost: 10000,
    speedMultiplier: 1.25,
    mass: 1.5,
    bounceMultiplier: 1.3,
    shieldSlots: 4,
    specialTrait: "Double Shard Harvesting & Overdrive Auto-Blast",
    color: "#00E5FF",
    trailColor: "#FFE600",
  },
  {
    id: "HYPERION_DREAD",
    name: "Hyperion Dread",
    title: "Heavy Solar Juggernaut",
    description: "Reinforced solar hull that unleashes radial shockwaves on every bumper bounce and absorbs laser damage.",
    unlocked: false,
    cost: 15000,
    speedMultiplier: 0.95,
    mass: 2.8,
    bounceMultiplier: 1.4,
    shieldSlots: 5,
    specialTrait: "Radial Shockwaves on Bounce & Laser Immunity",
    color: "#FF5500",
    trailColor: "#FF5500",
  },
  {
    id: "OMEGA_AEGIS",
    name: "Omega Aegis",
    title: "Singularity Sovereign",
    description: "The ultimate hyper-dimensional prototype vessel with infinite trajectory forecasting and tri-laser burst aura.",
    unlocked: false,
    cost: 25000,
    speedMultiplier: 1.45,
    mass: 1.8,
    bounceMultiplier: 1.5,
    shieldSlots: 6,
    specialTrait: "Permanent 2x Overdrive Charge Rate & Tri-Laser Aura",
    color: "#00FFCC",
    trailColor: "#FF00FF",
  },
];

export const COSMETIC_TRAILS: CosmeticTrail[] = [
  { id: "CYBER_CYAN", name: "Cyber Cyan", color: "#00F0FF", cost: 0, unlocked: true },
  { id: "SOLAR_AMBER", name: "Solar Amber", color: "#FF9900", cost: 300, unlocked: false },
  { id: "VOID_PURPLE", name: "Void Nebula", color: "#BF00FF", cost: 600, unlocked: false },
  { id: "ACID_GREEN", name: "Matrix Acid", color: "#39FF14", cost: 1000, unlocked: false },
  { id: "RUBY_LASER", name: "Ruby Laser", color: "#FF1744", cost: 1500, unlocked: false },
  { id: "HYPERION_GOLD", name: "Hyperion Gold", color: "#FFD700", cost: 3000, unlocked: false },
];

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "ACH_FIRST_LAUNCH",
    title: "First Orbit",
    description: "Launch your kinetic vessel for the first time.",
    icon: "[LAUNCH]",
    progress: 0,
    target: 1,
    rewardShards: 50,
    unlocked: false,
  },
  {
    id: "ACH_SCORE_1000",
    title: "Sector Pilot",
    description: "Score 1,000 points in a single run.",
    icon: "[SCORE]",
    progress: 0,
    target: 1000,
    rewardShards: 150,
    unlocked: false,
  },
  {
    id: "ACH_SCORE_5000",
    title: "Quantum Ace",
    description: "Score 5,000 points in a single run.",
    icon: "[ACE]",
    progress: 0,
    target: 5000,
    rewardShards: 400,
    unlocked: false,
  },
  {
    id: "ACH_SCORE_25000",
    title: "Cosmic Legend",
    description: "Score 25,000 points in a single run.",
    icon: "[LEGEND]",
    progress: 0,
    target: 25000,
    rewardShards: 1500,
    unlocked: false,
  },
  {
    id: "ACH_COMBO_15",
    title: "Chain Reaction",
    description: "Achieve a 15x kinetic bumper combo streak.",
    icon: "[COMBO]",
    progress: 0,
    target: 15,
    rewardShards: 250,
    unlocked: false,
  },
  {
    id: "ACH_COMBO_30",
    title: "Resonance Master",
    description: "Achieve a 30x kinetic bumper combo streak.",
    icon: "[RESONANCE]",
    progress: 0,
    target: 30,
    rewardShards: 600,
    unlocked: false,
  },
  {
    id: "ACH_BOSS_DEFEAT",
    title: "Titan Slayer",
    description: "Defeat a Sector Boss Singularity.",
    icon: "[BOSS]",
    progress: 0,
    target: 1,
    rewardShards: 500,
    unlocked: false,
  },
  {
    id: "ACH_SHARDS_2000",
    title: "Shard Harvester",
    description: "Collect a lifetime total of 2,000 Quantum Shards.",
    icon: "[SHARD]",
    progress: 0,
    target: 2000,
    rewardShards: 350,
    unlocked: false,
  },
  {
    id: "ACH_SHARDS_10000",
    title: "Quantum Oligarch",
    description: "Collect a lifetime total of 10,000 Quantum Shards.",
    icon: "[VAULT]",
    progress: 0,
    target: 10000,
    rewardShards: 2000,
    unlocked: false,
  },
  {
    id: "ACH_OVERDRIVE_5",
    title: "Supernova Trigger",
    description: "Activate Supernova Overdrive 5 times in a single session.",
    icon: "[SUPERNOVA]",
    progress: 0,
    target: 5,
    rewardShards: 300,
    unlocked: false,
  },
];

export const SEASON_PASS_TIERS: SeasonPassTier[] = [
  { tier: 1, xpRequired: 100, freeReward: { title: "50 Quantum Shards", shards: 50, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "150 Shards + Bronze Hull", shards: 150, icon: "[HULL]", type: "HULL" } },
  { tier: 2, xpRequired: 250, freeReward: { title: "75 Quantum Shards", shards: 75, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "250 Shards + Cyber Spark Trail", shards: 250, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 3, xpRequired: 450, freeReward: { title: "100 Quantum Shards", shards: 100, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "350 Shards + FM Bell Synth Pack", shards: 350, icon: "[AUDIO]", type: "AUDIO" } },
  { tier: 4, xpRequired: 700, freeReward: { title: "150 Quantum Shards", shards: 150, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "500 Shards + Aegis Nano-Shield", shards: 500, icon: "[SHIELD]", type: "SHIELD" } },
  { tier: 5, xpRequired: 1000, freeReward: { title: "200 Quantum Shards", shards: 200, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "750 Shards + Vortex Skiff Variant", shards: 750, icon: "[SHIP]", type: "HULL" } },
  { tier: 6, xpRequired: 1400, freeReward: { title: "250 Quantum Shards", shards: 250, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "1,000 Shards + Dark Matter Relic", shards: 1000, icon: "[RELIC]", type: "RELIC" } },
  { tier: 7, xpRequired: 1900, freeReward: { title: "300 Quantum Shards", shards: 300, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "1,200 Shards + Solar Flare Ion Trail", shards: 1200, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 8, xpRequired: 2500, freeReward: { title: "350 Quantum Shards", shards: 350, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "1,400 Shards + Pentatonic Audio Core", shards: 1400, icon: "[AUDIO]", type: "AUDIO" } },
  { tier: 9, xpRequired: 3200, freeReward: { title: "400 Quantum Shards", shards: 400, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "1,600 Shards + EMP Boost Mod", shards: 1600, icon: "[MOD]", type: "MOD" } },
  { tier: 10, xpRequired: 4000, freeReward: { title: "500 Quantum Shards", shards: 500, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "2,000 Shards + Titan Ram Chassis", shards: 2000, icon: "[SHIP]", type: "HULL" } },
  { tier: 11, xpRequired: 4900, freeReward: { title: "550 Quantum Shards", shards: 550, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "2,200 Shards + Acid Matrix Glow", shards: 2200, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 12, xpRequired: 5900, freeReward: { title: "600 Quantum Shards", shards: 600, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "2,400 Shards + 808 Sub-Bass Synth", shards: 2400, icon: "[AUDIO]", type: "AUDIO" } },
  { tier: 13, xpRequired: 7000, freeReward: { title: "650 Quantum Shards", shards: 650, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "2,600 Shards + Singularity Lens", shards: 2600, icon: "[LENS]", type: "LENS" } },
  { tier: 14, xpRequired: 8200, freeReward: { title: "700 Quantum Shards", shards: 700, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "2,800 Shards + Kinetic Dynamo Mod", shards: 2800, icon: "[MOD]", type: "MOD" } },
  { tier: 15, xpRequired: 9500, freeReward: { title: "850 Quantum Shards", shards: 850, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "3,200 Shards + Chrono Phase Hull", shards: 3200, icon: "[SHIP]", type: "HULL" } },
  { tier: 16, xpRequired: 11000, freeReward: { title: "900 Quantum Shards", shards: 900, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "3,500 Shards + Ruby Laser Array", shards: 3500, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 17, xpRequired: 12600, freeReward: { title: "1,000 Quantum Shards", shards: 1000, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "3,800 Shards + Binaural Drone Pad", shards: 3800, icon: "[AUDIO]", type: "AUDIO" } },
  { tier: 18, xpRequired: 14300, freeReward: { title: "1,100 Quantum Shards", shards: 1100, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "4,200 Shards + Overdrive Booster", shards: 4200, icon: "[MOD]", type: "MOD" } },
  { tier: 19, xpRequired: 16100, freeReward: { title: "1,200 Quantum Shards", shards: 1200, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "4,600 Shards + Prism Refractor Mod", shards: 4600, icon: "[PRISM]", type: "MOD" } },
  { tier: 20, xpRequired: 18000, freeReward: { title: "1,500 Quantum Shards", shards: 1500, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "5,500 Shards + Solar Eclipse Vessel", shards: 5500, icon: "[SHIP]", type: "HULL" } },
  { tier: 21, xpRequired: 20000, freeReward: { title: "1,600 Quantum Shards", shards: 1600, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "6,000 Shards + Hyperion Gold Aura", shards: 6000, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 22, xpRequired: 22100, freeReward: { title: "1,750 Quantum Shards", shards: 1750, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "6,500 Shards + Supernova FX Shader", shards: 6500, icon: "[VISUAL]", type: "VISUAL" } },
  { tier: 23, xpRequired: 24300, freeReward: { title: "1,900 Quantum Shards", shards: 1900, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "7,000 Shards + Quantum Fission Module", shards: 7000, icon: "[MOD]", type: "MOD" } },
  { tier: 24, xpRequired: 26600, freeReward: { title: "2,100 Quantum Shards", shards: 2100, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "7,500 Shards + Dreadnought Core", shards: 7500, icon: "[RELIC]", type: "RELIC" } },
  { tier: 25, xpRequired: 29000, freeReward: { title: "2,500 Quantum Shards", shards: 2500, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "9,000 Shards + Aegis Prime Flagship", shards: 9000, icon: "[SHIP]", type: "HULL" } },
  { tier: 26, xpRequired: 31500, freeReward: { title: "2,700 Quantum Shards", shards: 2700, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "10,000 Shards + Singularity Warp Trail", shards: 10000, icon: "[TRAIL]", type: "TRAIL" } },
  { tier: 27, xpRequired: 34100, freeReward: { title: "3,000 Quantum Shards", shards: 3000, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "11,000 Shards + 16-Step Arp Synthesizer", shards: 11000, icon: "[AUDIO]", type: "AUDIO" } },
  { tier: 28, xpRequired: 36800, freeReward: { title: "3,300 Quantum Shards", shards: 3300, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "12,500 Shards + Hyperion Dread Plate", shards: 12500, icon: "[SHIP]", type: "HULL" } },
  { tier: 29, xpRequired: 39600, freeReward: { title: "3,700 Quantum Shards", shards: 3700, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "14,000 Shards + Phoenix Protocol Insignia", shards: 14000, icon: "[INSIGNIA]", type: "INSIGNIA" } },
  { tier: 30, xpRequired: 42500, freeReward: { title: "5,000 Quantum Shards", shards: 5000, icon: "[SHARD]", type: "SHARDS" }, premiumReward: { title: "20,000 Shards + Omega Aegis Sovereign Crown", shards: 20000, icon: "[SOVEREIGN]", type: "SOVEREIGN" } },
];

export class ProgressionManager {
  // --- Quantum Vault Telemetry ---
  public static getTelemetry(): GameTelemetry {
    const defaultTelemetry: GameTelemetry = {
      score: 0,
      highScore: 0,
      currentSector: 1,
      maxSectorReached: 1,
      quantumShardsRun: 0,
      totalQuantumShards: 250, // Welcome starting bonus
      comboCount: 0,
      highestCombo: 0,
      totalBounces: 0,
      bossesDefeated: 0,
      runsCompleted: 0,
      totalPlayTimeSeconds: 0,
    };

    if (typeof window === "undefined") {
      return { ...defaultTelemetry };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TELEMETRY);
      if (saved) {
        return { ...defaultTelemetry, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...defaultTelemetry };
  }

  public static saveTelemetry(data: Partial<GameTelemetry>): GameTelemetry {
    const current = ProgressionManager.getTelemetry();
    const merged: GameTelemetry = { ...current, ...data };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(merged));
      } catch {}
    }
    return merged;
  }

  public static addQuantumShards(amount: number): number {
    const telemetry = ProgressionManager.getTelemetry();
    telemetry.totalQuantumShards = Math.max(0, telemetry.totalQuantumShards + amount);
    ProgressionManager.saveTelemetry(telemetry);
    return telemetry.totalQuantumShards;
  }

  public static deductQuantumShards(amount: number): boolean {
    const telemetry = ProgressionManager.getTelemetry();
    if (telemetry.totalQuantumShards < amount) return false;
    telemetry.totalQuantumShards -= amount;
    ProgressionManager.saveTelemetry(telemetry);
    return true;
  }

  // --- Tech Matrix Skill Tree ---
  public static getTechUpgrades(): TechUpgrade[] {
    if (typeof window === "undefined") return INITIAL_TECH_UPGRADES.map((u) => ({ ...u }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TECH);
      if (saved) {
        const loaded: TechUpgrade[] = JSON.parse(saved);
        return INITIAL_TECH_UPGRADES.map((initial) => {
          const found = loaded.find((l) => l.id === initial.id);
          return found ? { ...initial, level: found.level } : { ...initial };
        });
      }
    } catch {}
    return INITIAL_TECH_UPGRADES.map((u) => ({ ...u }));
  }

  public static saveTechUpgrades(upgrades: TechUpgrade[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_TECH, JSON.stringify(upgrades));
    } catch {}
  }

  public static calculateUpgradeCost(nodeId: string, currentLevel: number): number {
    const upgrade = INITIAL_TECH_UPGRADES.find((u) => u.id === nodeId);
    if (!upgrade) return 999999;
    return upgrade.costPerLevel * (currentLevel + 1);
  }

  public static calculateNonLinearTechCost(nodeId: string, level: number): number {
    const upgrade = INITIAL_TECH_UPGRADES.find((u) => u.id === nodeId);
    if (!upgrade) return 999999;
    // Exponential formula for deep progression balancing: base * 1.35^lvl
    return Math.floor(upgrade.costPerLevel * Math.pow(1.35, level));
  }

  public static calculateLifetimeSinkDemand(): number {
    let techSink = 0;
    for (const upgrade of INITIAL_TECH_UPGRADES) {
      for (let lvl = 0; lvl < upgrade.maxLevel; lvl++) {
        techSink += upgrade.costPerLevel * (lvl + 1);
      }
    }
    const vesselSink = INITIAL_VESSELS.reduce((acc, v) => acc + v.cost, 0);
    const trailSink = COSMETIC_TRAILS.reduce((acc, t) => acc + t.cost, 0);
    return techSink + vesselSink + trailSink;
  }

  public static purchaseTechUpgrade(nodeId: string): { success: boolean; newLevel: number; cost: number; error?: string } {
    const upgrades = ProgressionManager.getTechUpgrades();
    const index = upgrades.findIndex((u) => u.id === nodeId);
    if (index === -1) return { success: false, newLevel: 0, cost: 0, error: "Node not found" };

    const item = upgrades[index];
    if (item.level >= item.maxLevel) {
      return { success: false, newLevel: item.level, cost: 0, error: "Max level reached" };
    }

    const cost = item.costPerLevel * (item.level + 1);
    const success = ProgressionManager.deductQuantumShards(cost);
    if (!success) {
      return { success: false, newLevel: item.level, cost, error: "Insufficient Quantum Shards" };
    }

    upgrades[index] = { ...item, level: item.level + 1 };
    ProgressionManager.saveTechUpgrades(upgrades);
    return { success: true, newLevel: upgrades[index].level, cost };
  }

  public static getTechBonuses() {
    const upgrades = ProgressionManager.getTechUpgrades();
    const getVal = (id: string) => {
      const found = upgrades.find((u) => u.id === id);
      return found ? found.level * found.valuePerLevel : 0;
    };

    return {
      launchVelocityBonus: getVal("TECH_LAUNCH_VELOCITY"),
      magnetRadiusBonus: getVal("TECH_MAGNET_RADIUS"),
      bounceRestitutionBonus: getVal("TECH_BOUNCE_RESTITUTION"),
      shieldCapacityBonus: getVal("TECH_SHIELD_CAPACITY"),
      overdriveReactorBonus: getVal("TECH_OVERDRIVE_REACTOR"),
      shardYieldBonus: getVal("TECH_SHARD_YIELD"),
      trajectoryPreviewBonus: getVal("TECH_TRAJECTORY_CALCULATOR"),
    };
  }

  // --- Fleet Vessels ---
  public static getVessels(): HullVessel[] {
    if (typeof window === "undefined") return INITIAL_VESSELS.map((v) => ({ ...v }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VESSELS);
      if (saved) {
        const loaded: HullVessel[] = JSON.parse(saved);
        return INITIAL_VESSELS.map((initial) => {
          const found = loaded.find((l) => l.id === initial.id);
          return found ? { ...initial, unlocked: initial.unlocked || found.unlocked } : { ...initial };
        });
      }
    } catch {}
    return INITIAL_VESSELS.map((v) => ({ ...v }));
  }

  public static saveVessels(vessels: HullVessel[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_VESSELS, JSON.stringify(vessels));
    } catch {}
  }

  public static getActiveVesselId(): string {
    if (typeof window === "undefined") return "PHOTON_DART";
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_VESSEL);
      if (saved) return saved;
    } catch {}
    return "PHOTON_DART";
  }

  public static setActiveVesselId(id: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_VESSEL, id);
    } catch {}
  }

  public static getActiveVessel(): HullVessel {
    const vessels = ProgressionManager.getVessels();
    const activeId = ProgressionManager.getActiveVesselId();
    return vessels.find((v) => v.id === activeId) || vessels[0];
  }

  public static unlockVessel(vesselId: string): { success: boolean; cost: number; error?: string } {
    const vessels = ProgressionManager.getVessels();
    const target = vessels.find((v) => v.id === vesselId);
    if (!target) return { success: false, cost: 0, error: "Vessel not found" };
    if (target.unlocked) return { success: true, cost: 0 };

    const success = ProgressionManager.deductQuantumShards(target.cost);
    if (!success) return { success: false, cost: target.cost, error: "Insufficient Quantum Shards" };

    const updated = vessels.map((v) => (v.id === vesselId ? { ...v, unlocked: true } : { ...v }));
    ProgressionManager.saveVessels(updated);
    ProgressionManager.setActiveVesselId(vesselId);
    return { success: true, cost: target.cost };
  }

  // --- Cosmetic Trails ---
  public static getTrails(): CosmeticTrail[] {
    if (typeof window === "undefined") return COSMETIC_TRAILS.map((t) => ({ ...t }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED_TRAILS);
      if (saved) {
        const unlockedIds: string[] = JSON.parse(saved);
        return COSMETIC_TRAILS.map((t) => ({
          ...t,
          unlocked: t.unlocked || unlockedIds.includes(t.id),
        }));
      }
    } catch {}
    return COSMETIC_TRAILS.map((t) => ({ ...t }));
  }

  public static unlockTrail(trailId: string): { success: boolean; cost: number; error?: string } {
    const trails = ProgressionManager.getTrails();
    const target = trails.find((t) => t.id === trailId);
    if (!target) return { success: false, cost: 0, error: "Trail not found" };
    if (target.unlocked) return { success: true, cost: 0 };

    const success = ProgressionManager.deductQuantumShards(target.cost);
    if (!success) return { success: false, cost: target.cost, error: "Insufficient Quantum Shards" };

    if (typeof window !== "undefined") {
      try {
        const currentUnlocked = ProgressionManager.getTrails()
          .filter((t) => t.unlocked)
          .map((t) => t.id);
        const nextUnlocked = Array.from(new Set([...currentUnlocked, trailId]));
        localStorage.setItem(STORAGE_KEY_UNLOCKED_TRAILS, JSON.stringify(nextUnlocked));
      } catch {}
    }

    ProgressionManager.setActiveTrailId(trailId);
    return { success: true, cost: target.cost };
  }

  public static getActiveTrailId(): string {
    if (typeof window === "undefined") return "CYBER_CYAN";
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TRAIL);
      if (saved) return saved;
    } catch {}
    return "CYBER_CYAN";
  }

  public static setActiveTrailId(id: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TRAIL, id);
    } catch {}
  }

  public static getActiveTrail(): CosmeticTrail {
    const trails = ProgressionManager.getTrails();
    const activeId = ProgressionManager.getActiveTrailId();
    return trails.find((t) => t.id === activeId) || trails[0];
  }

  // --- Achievements ---
  public static getAchievements(): AchievementItem[] {
    if (typeof window === "undefined") return INITIAL_ACHIEVEMENTS.map((a) => ({ ...a }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (saved) {
        const loaded: AchievementItem[] = JSON.parse(saved);
        return INITIAL_ACHIEVEMENTS.map((initial) => {
          const found = loaded.find((l) => l.id === initial.id);
          return found ? { ...initial, progress: found.progress, unlocked: found.unlocked } : { ...initial };
        });
      }
    } catch {}
    return INITIAL_ACHIEVEMENTS.map((a) => ({ ...a }));
  }

  public static saveAchievements(achievements: AchievementItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {}
  }

  public static updateAchievementProgress(
    achievementId: string,
    progressDelta: number
  ): { unlockedNow: boolean; rewardShards: number } {
    const achievements = ProgressionManager.getAchievements();
    const target = achievements.find((a) => a.id === achievementId);
    if (!target || target.unlocked) return { unlockedNow: false, rewardShards: 0 };

    target.progress = Math.min(target.target, target.progress + progressDelta);
    let unlockedNow = false;
    let reward = 0;

    if (target.progress >= target.target) {
      target.unlocked = true;
      unlockedNow = true;
      reward = target.rewardShards;
      ProgressionManager.addQuantumShards(reward);
    }

    ProgressionManager.saveAchievements(achievements);
    return { unlockedNow, rewardShards: reward };
  }

  // --- 30-Tier Season Pass Ladder ---
  public static getSeasonPassData(): SeasonPassData {
    const defaultData: SeasonPassData = {
      seasonId: "SEASON_1",
      xp: 680,
      isPremium: false,
      claimedFreeTiers: [1, 2],
      claimedPremiumTiers: [],
    };

    if (typeof window === "undefined") return { ...defaultData };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON_PASS);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...defaultData };
  }

  public static saveSeasonPassData(data: SeasonPassData) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_SEASON_PASS, JSON.stringify(data));
    } catch {}
  }

  public static addSeasonPassXp(xpGained: number): { newXp: number; unlockedTiers: number[] } {
    const data = ProgressionManager.getSeasonPassData();
    const oldXp = data.xp;
    data.xp += Math.max(0, xpGained);
    ProgressionManager.saveSeasonPassData(data);

    const newlyUnlocked = SEASON_PASS_TIERS.filter(
      (t) => oldXp < t.xpRequired && data.xp >= t.xpRequired
    ).map((t) => t.tier);

    return { newXp: data.xp, unlockedTiers: newlyUnlocked };
  }

  public static unlockPremiumSeasonPass(cost: number = 500): { success: boolean; error?: string } {
    const data = ProgressionManager.getSeasonPassData();
    if (data.isPremium) return { success: true };

    const success = ProgressionManager.deductQuantumShards(cost);
    if (!success) return { success: false, error: "Insufficient Quantum Shards" };

    data.isPremium = true;
    ProgressionManager.saveSeasonPassData(data);
    return { success: true };
  }

  public static claimSeasonTier(
    tierIndex: number,
    isPremiumClaim?: boolean
  ): { success: boolean; shardsClaimed: number; rewards: string[] } {
    const data = ProgressionManager.getSeasonPassData();
    const tierConfig = SEASON_PASS_TIERS.find((t) => t.tier === tierIndex);
    if (!tierConfig || data.xp < tierConfig.xpRequired) {
      return { success: false, shardsClaimed: 0, rewards: [] };
    }

    let shardsClaimed = 0;
    const rewards: string[] = [];

    // Claim Free Track
    if (!data.claimedFreeTiers.includes(tierIndex)) {
      data.claimedFreeTiers.push(tierIndex);
      shardsClaimed += tierConfig.freeReward.shards;
      rewards.push(tierConfig.freeReward.title);
    }

    // Claim Premium Track if eligible or specifically requested
    const shouldClaimPremium = isPremiumClaim ?? data.isPremium;
    if (shouldClaimPremium && data.isPremium && !data.claimedPremiumTiers.includes(tierIndex)) {
      data.claimedPremiumTiers.push(tierIndex);
      shardsClaimed += tierConfig.premiumReward.shards;
      rewards.push(tierConfig.premiumReward.title);
    }

    if (shardsClaimed > 0) {
      ProgressionManager.addQuantumShards(shardsClaimed);
    }

    ProgressionManager.saveSeasonPassData(data);
    return { success: true, shardsClaimed, rewards };
  }

  public static claimAllAvailableSeasonTiers(): { totalShardsClaimed: number; claimedTierCount: number } {
    const data = ProgressionManager.getSeasonPassData();
    let totalShardsClaimed = 0;
    let claimedTierCount = 0;

    for (const t of SEASON_PASS_TIERS) {
      if (data.xp >= t.xpRequired) {
        let tierClaimed = false;
        if (!data.claimedFreeTiers.includes(t.tier)) {
          data.claimedFreeTiers.push(t.tier);
          totalShardsClaimed += t.freeReward.shards;
          tierClaimed = true;
        }
        if (data.isPremium && !data.claimedPremiumTiers.includes(t.tier)) {
          data.claimedPremiumTiers.push(t.tier);
          totalShardsClaimed += t.premiumReward.shards;
          tierClaimed = true;
        }
        if (tierClaimed) claimedTierCount++;
      }
    }

    if (totalShardsClaimed > 0) {
      ProgressionManager.addQuantumShards(totalShardsClaimed);
    }

    ProgressionManager.saveSeasonPassData(data);
    return { totalShardsClaimed, claimedTierCount };
  }

  // --- Daily Supply Drop ---
  public static canClaimDailySupplyDrop(): boolean {
    if (typeof window === "undefined") return true;
    try {
      const last = localStorage.getItem(STORAGE_KEY_SUPPLY_DROP);
      if (!last) return true;
      const lastTime = parseInt(last, 10);
      const now = Date.now();
      return now - lastTime > 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }

  public static recordSupplyDropClaim() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_SUPPLY_DROP, Date.now().toString());
    } catch {}
  }

  // --- Vault Backup & Restore ---
  public static exportVaultData(): string {
    const vault = {
      version: "1.0.0",
      timestamp: Date.now(),
      telemetry: ProgressionManager.getTelemetry(),
      tech: ProgressionManager.getTechUpgrades(),
      vessels: ProgressionManager.getVessels(),
      activeVessel: ProgressionManager.getActiveVesselId(),
      activeTrail: ProgressionManager.getActiveTrailId(),
      achievements: ProgressionManager.getAchievements(),
      seasonPass: ProgressionManager.getSeasonPassData(),
    };
    return JSON.stringify(vault, null, 2);
  }

  public static importVaultData(jsonStr: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object") return false;

      if (data.telemetry) localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(data.telemetry));
      if (data.tech) localStorage.setItem(STORAGE_KEY_TECH, JSON.stringify(data.tech));
      if (data.vessels) localStorage.setItem(STORAGE_KEY_VESSELS, JSON.stringify(data.vessels));
      if (data.activeVessel) localStorage.setItem(STORAGE_KEY_ACTIVE_VESSEL, data.activeVessel);
      if (data.activeTrail) localStorage.setItem(STORAGE_KEY_ACTIVE_TRAIL, data.activeTrail);
      if (data.achievements) localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(data.achievements));
      if (data.seasonPass) localStorage.setItem(STORAGE_KEY_SEASON_PASS, JSON.stringify(data.seasonPass));
      return true;
    } catch {
      return false;
    }
  }

  public static resetAllVaultData() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY_TELEMETRY);
      localStorage.removeItem(STORAGE_KEY_TECH);
      localStorage.removeItem(STORAGE_KEY_VESSELS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_VESSEL);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TRAIL);
      localStorage.removeItem(STORAGE_KEY_UNLOCKED_TRAILS);
      localStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS);
      localStorage.removeItem(STORAGE_KEY_SUPPLY_DROP);
      localStorage.removeItem(STORAGE_KEY_SEASON_PASS);
    } catch {}
  }
}
