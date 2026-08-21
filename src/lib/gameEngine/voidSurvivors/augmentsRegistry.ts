// Augments Registry & Drafting Generator for Void Survivors (Nova Protocol)
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

import { VoidAugmentCard, WeaponId } from "./types";

export const AUGMENTS_CATALOG: VoidAugmentCard[] = [
  // ==========================================================================
  // 1. WEAPON SYSTEMS
  // ==========================================================================
  {
    id: "AUG_WEAPON_BLADES",
    name: "Orbiting Plasma Blades",
    category: "WEAPON",
    rarity: "COMMON",
    level: 1,
    maxLevel: 6,
    icon: "[BLADES]",
    tagline: "Kinetic Energy Scythes",
    description: "Deploys rotating high-intensity plasma blades that slice through approaching swarms.",
    weaponId: "BLADES",
    statBonus: {
      projectileCount: 1,
      damageMult: 1.15,
      radiusBonus: 8,
    },
  },
  {
    id: "AUG_WEAPON_LIGHTNING",
    name: "Fractal Chain Lightning",
    category: "WEAPON",
    rarity: "RARE",
    level: 1,
    maxLevel: 6,
    icon: "[LIGHTNING]",
    tagline: "High-Voltage Arc Discharge",
    description: "Discharges branching electrical arcs jumping between clustered enemies in rapid sequence.",
    weaponId: "LIGHTNING",
    statBonus: {
      projectileCount: 1,
      damageMult: 1.2,
      cooldownReduction: 0.1,
    },
  },
  {
    id: "AUG_WEAPON_DRONES",
    name: "Autonomous Laser Drones",
    category: "WEAPON",
    rarity: "RARE",
    level: 1,
    maxLevel: 6,
    icon: "[DRONES]",
    tagline: "Tactical Orbiting Sentinels",
    description: "Launches companion drones that lock continuous focused neon cyan beams onto priority threats.",
    weaponId: "DRONES",
    statBonus: {
      projectileCount: 1,
      damageMult: 1.25,
      radiusBonus: 25,
    },
  },
  {
    id: "AUG_WEAPON_MISSILES",
    name: "Homing Missile Clusters",
    category: "WEAPON",
    rarity: "EPIC",
    level: 1,
    maxLevel: 6,
    icon: "[MISSILES]",
    tagline: "Proportional Navigation Salvo",
    description: "Fires salvos of high-yield micro-rockets with smoke trails and heavy AOE detonation blast.",
    weaponId: "MISSILES",
    statBonus: {
      projectileCount: 2,
      damageMult: 1.3,
      radiusBonus: 15,
    },
  },

  // ==========================================================================
  // 2. STAT MODIFIERS & CORE ENHANCEMENTS
  // ==========================================================================
  {
    id: "AUG_STAT_SPEED",
    name: "Quantum Thrusters",
    category: "STAT",
    rarity: "COMMON",
    level: 1,
    maxLevel: 5,
    icon: "[SPEED]",
    tagline: "+15% Vessel Movement Speed",
    description: "Overclocks impulse engine acceleration and maximum vector maneuverability envelope.",
    statBonus: {
      moveSpeedBonus: 0.15,
    },
  },
  {
    id: "AUG_STAT_MAGNET",
    name: "Void Attractor Coil",
    category: "STAT",
    rarity: "COMMON",
    level: 1,
    maxLevel: 5,
    icon: "[MAGNET]",
    tagline: "+35% XP Magnetic Suction Radius",
    description: "Amplifies graviton field density to vacuum distant XP gems with quadratic pull.",
    statBonus: {
      magnetRadiusBonus: 0.35,
    },
  },
  {
    id: "AUG_STAT_DAMAGE",
    name: "Antimatter Amplifier",
    category: "STAT",
    rarity: "RARE",
    level: 1,
    maxLevel: 5,
    icon: "[AMP]",
    tagline: "+20% Damage Across All Weapons",
    description: "Injects concentrated antimatter flow into vessel weapon capacitor matrix.",
    statBonus: {
      damageMult: 0.20,
    },
  },
  {
    id: "AUG_STAT_COOLDOWN",
    name: "Hyper Chrono Dial",
    category: "STAT",
    rarity: "RARE",
    level: 1,
    maxLevel: 5,
    icon: "[CHRONO]",
    tagline: "+15% Weapons Attack Speed",
    description: "Accelerates weapon cycle clocks and reduces discharge intervals across all systems.",
    statBonus: {
      cooldownReduction: 0.15,
    },
  },
  {
    id: "AUG_STAT_HEALTH",
    name: "Nanite Hull Matrix",
    category: "STAT",
    rarity: "COMMON",
    level: 1,
    maxLevel: 5,
    icon: "[HULL]",
    tagline: "+40 Max HP & Instant Repair",
    description: "Reinforces structural plating and releases nanobots to instantly patch hull breaches.",
    statBonus: {
      maxHpBonus: 40,
      healAmount: 40,
    },
  },
  {
    id: "AUG_STAT_SHIELD",
    name: "Aegis Barrier Capacitor",
    category: "STAT",
    rarity: "EPIC",
    level: 1,
    maxLevel: 4,
    icon: "[SHIELD]",
    tagline: "+1 Max Shield & Faster Recharge",
    description: "Deploys an additional refractive kinetic shield layer that absorbs lethal collisions.",
    statBonus: {
      shieldSlotsBonus: 1,
    },
  },
  {
    id: "AUG_STAT_CRIT",
    name: "Tachyon Targeting Lens",
    category: "STAT",
    rarity: "EPIC",
    level: 1,
    maxLevel: 4,
    icon: "[CRIT]",
    tagline: "+12% Critical Strike Chance",
    description: "Calculates subatomic weak points in enemy carapaces for massive 2.5x critical damage.",
    statBonus: {
      critChanceBonus: 0.12,
    },
  },

  // ==========================================================================
  // 3. LEGENDARY EVOLUTIONS
  // ==========================================================================
  {
    id: "AUG_EVO_SUPERNOVA",
    name: "Supernova Blade Vortex",
    category: "EVOLUTION",
    rarity: "LEGENDARY",
    level: 1,
    maxLevel: 1,
    icon: "[SUPERNOVA]",
    tagline: "Evolved Plasma Blades",
    description: "Blades ignite with solar plasma, shedding expanding burning rings and doubling rotational speed.",
    weaponId: "BLADES",
    statBonus: {
      damageMult: 0.65,
      radiusBonus: 20,
    },
  },
  {
    id: "AUG_EVO_TESLA_STORM",
    name: "Tesla Cataclysm",
    category: "EVOLUTION",
    rarity: "LEGENDARY",
    level: 1,
    maxLevel: 1,
    icon: "[CATACLYSM]",
    tagline: "Evolved Chain Lightning",
    description: "Lightning strikes in dual concurrent arcs leaping through up to 14 enemies with catastrophic power.",
    weaponId: "LIGHTNING",
    statBonus: {
      projectileCount: 6,
      damageMult: 0.75,
    },
  },
  {
    id: "AUG_EVO_DEATH_RAY",
    name: "Death Ray Satellite",
    category: "EVOLUTION",
    rarity: "LEGENDARY",
    level: 1,
    maxLevel: 1,
    icon: "[DEATH RAY]",
    tagline: "Evolved Laser Drones",
    description: "Drones synchronize into an orbital laser array that pierces infinite enemies with continuous beam melt.",
    weaponId: "DRONES",
    statBonus: {
      damageMult: 0.85,
      radiusBonus: 60,
    },
  },
  {
    id: "AUG_EVO_APOCALYPSE",
    name: "Apocalypse Missile Swarm",
    category: "EVOLUTION",
    rarity: "LEGENDARY",
    level: 1,
    maxLevel: 1,
    icon: "[APOCALYPSE]",
    tagline: "Evolved Missile Salvos",
    description: "Salvos deploy 8 thermonuclear warheads that disperse secondary cluster bomblets on impact.",
    weaponId: "MISSILES",
    statBonus: {
      projectileCount: 4,
      damageMult: 0.8,
      radiusBonus: 35,
    },
  },
];

/**
 * Drafts 3 unique valid augment cards according to player's current progression levels.
 */
export function draftRandomAugments(
  currentLevels: Record<string, number>,
  weaponLevels: { blades: number; lightning: number; drones: number; missiles: number },
  count: number = 3
): VoidAugmentCard[] {
  // Filter eligible cards
  const eligible = AUGMENTS_CATALOG.filter((card) => {
    const curLvl = currentLevels[card.id] || 0;
    if (curLvl >= card.maxLevel) return false;

    // Check Evolution prerequisites
    if (card.category === "EVOLUTION") {
      if (card.weaponId === "BLADES" && weaponLevels.blades < 4) return false;
      if (card.weaponId === "LIGHTNING" && weaponLevels.lightning < 4) return false;
      if (card.weaponId === "DRONES" && weaponLevels.drones < 4) return false;
      if (card.weaponId === "MISSILES" && weaponLevels.missiles < 4) return false;
    }

    return true;
  });

  if (eligible.length === 0) {
    // Fallback card if all maxed
    return [
      {
        id: "AUG_FALLBACK_REPAIR",
        name: "Emergency Repair Protocol",
        category: "STAT",
        rarity: "COMMON",
        level: 1,
        maxLevel: 99,
        icon: "[REPAIR]",
        tagline: "Instant 50 HP Hull Repair & +100 Shards",
        description: "Nanite synthesis regenerates hull structural integrity and grants 100 bonus Quantum Shards.",
        statBonus: {
          healAmount: 50,
        },
      },
    ];
  }

  // Shuffle and pick
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const selected: VoidAugmentCard[] = [];

  for (let i = 0; i < shuffled.length && selected.length < count; i++) {
    const card = { ...shuffled[i] };
    const curLvl = currentLevels[card.id] || 0;
    card.level = curLvl + 1;
    selected.push(card);
  }

  return selected;
}
