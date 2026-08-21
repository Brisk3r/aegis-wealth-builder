import { AugmentCard, AugmentRarity } from "./types";

export const AUGMENT_REGISTRY: AugmentCard[] = [
  {
    id: "QUANTUM_SPLIT",
    name: "Quantum Fission",
    tagline: "Triple projectile fragmentation",
    description: "On high-speed bumper impacts, spawn 2 secondary kinetic micro-orbs that harvest shards and trigger combos.",
    rarity: "EPIC",
    category: "OFFENSE",
    icon: "[SPLIT]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "TESLA_ARC",
    name: "Tesla Arc Conductor",
    tagline: "Chain lightning discharge",
    description: "Bounces discharge chain lightning to up to 3 nearby bumpers and hazards, inflicting +40% bonus damage.",
    rarity: "RARE",
    category: "OFFENSE",
    icon: "[TESLA]",
    stackCount: 1,
    maxStacks: 4,
  },
  {
    id: "KINETIC_DYNAMO",
    name: "Kinetic Dynamo",
    tagline: "Velocity compounding",
    description: "Increases velocity restitution by +25% per bounce, stacking up to 5x maximum launch speed.",
    rarity: "COMMON",
    category: "KINETIC",
    icon: "[VELOCITY]",
    stackCount: 1,
    maxStacks: 5,
  },
  {
    id: "GRAVITY_HARNESS",
    name: "Gravity Harness",
    tagline: "Orbital slingshot booster",
    description: "Passing through gravity wells accelerates your orb by +50% and generates +10 Overdrive energy.",
    rarity: "COMMON",
    category: "KINETIC",
    icon: "[ORBIT]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "SINGULARITY_VACUUM",
    name: "Vortex Magnetizer",
    tagline: "Automated shard attraction",
    description: "Expands magnetic collection radius by +120px and automatically draws Quantum Shards directly to your vessel.",
    rarity: "COMMON",
    category: "UTILITY",
    icon: "[MAGNET]",
    stackCount: 1,
    maxStacks: 4,
  },
  {
    id: "AEGIS_DEFLECTOR",
    name: "Aegis Kinetic Barrier",
    tagline: "Absorbs critical damage",
    description: "Grants +1 renewable energy shield that completely absorbs one fatal impact or laser hazard.",
    rarity: "RARE",
    category: "DEFENSE",
    icon: "[SHIELD]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "PRISM_REFRACTOR",
    name: "Prism Refractor",
    tagline: "Laser beam ricochets",
    description: "Every bumper impact emits twin piercing laser beams along the collision normal vector.",
    rarity: "EPIC",
    category: "OFFENSE",
    icon: "[PRISM]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "CHRONOS_WARP",
    name: "Chronos Time Dilation",
    tagline: "Bullet-time slow motion",
    description: "Slows game time by 45% when approaching critical hazards, granting pinpoint steering corrections.",
    rarity: "RARE",
    category: "UTILITY",
    icon: "[CHRONO]",
    stackCount: 1,
    maxStacks: 2,
  },
  {
    id: "SUPERNOVA_REACTOR",
    name: "Supernova Core",
    tagline: "Full-screen devastation blast",
    description: "Pressing Overdrive unleashes a blinding shockwave that detonates all on-screen bumpers and obliterates boss shields.",
    rarity: "LEGENDARY",
    category: "OFFENSE",
    icon: "[SUPERNOVA]",
    stackCount: 1,
    maxStacks: 2,
  },
  {
    id: "GOLDEN_ALCHEMY",
    name: "Quantum Transmuter",
    tagline: "2.5x Shard extraction rate",
    description: "Destroyed bumpers drop +150% more Quantum Shards and have a 20% chance to drop Overdrive fuel cells.",
    rarity: "RARE",
    category: "UTILITY",
    icon: "[QUANTUM]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "PIERCING_DRILL",
    name: "Hyperion Plasma Drill",
    tagline: "Armor penetration",
    description: "Allows the orb to pierce straight through the first 2 destructible obstacles without losing velocity.",
    rarity: "COMMON",
    category: "KINETIC",
    icon: "[DRILL]",
    stackCount: 1,
    maxStacks: 3,
  },
  {
    id: "COMBO_RESONANCE",
    name: "Resonance Cascade",
    tagline: "Exponential combo multiplier",
    description: "Increases combo score multiplier by +100% per 5 consecutive bounces without touching the bottom boundary.",
    rarity: "COMMON",
    category: "UTILITY",
    icon: "[COMBO]",
    stackCount: 1,
    maxStacks: 4,
  },
  {
    id: "DARK_MATTER_PULSE",
    name: "Dark Matter Pulse",
    tagline: "Repulsion blast on apex",
    description: "Emits a high-frequency shockwave when reaching peak velocity that damages all nearby enemies for 150 DMG.",
    rarity: "EPIC",
    category: "OFFENSE",
    icon: "[PULSE]",
    stackCount: 1,
    maxStacks: 2,
  },
  {
    id: "PHOENIX_REBIRTH",
    name: "Phoenix Protocol",
    tagline: "One-time death defy",
    description: "Upon death, immediately resurrects with full health and a 3-second invulnerability supernova burst.",
    rarity: "LEGENDARY",
    category: "DEFENSE",
    icon: "[PHOENIX]",
    stackCount: 1,
    maxStacks: 1,
  },
];

export interface SynergyCalculationResult {
  offenseMultiplier: number;
  defenseShieldBonus: number;
  velocityBonus: number;
  shardHarvestMultiplier: number;
  activeSynergies: { name: string; description: string; effectBadge: string }[];
}

export function getAugmentById(id: string): AugmentCard | undefined {
  return AUGMENT_REGISTRY.find((c) => c.id === id);
}

export function getAugmentsByCategory(category: AugmentCard["category"]): AugmentCard[] {
  return AUGMENT_REGISTRY.filter((c) => c.category === category);
}

export function getAugmentsByRarity(rarity: AugmentRarity): AugmentCard[] {
  return AUGMENT_REGISTRY.filter((c) => c.rarity === rarity);
}

export function getRarityWeight(rarity: AugmentRarity): number {
  switch (rarity) {
    case "COMMON":
      return 60;
    case "RARE":
      return 26;
    case "EPIC":
      return 11;
    case "LEGENDARY":
      return 3;
    default:
      return 25;
  }
}

export function formatAugmentRarityColor(rarity: AugmentRarity): string {
  switch (rarity) {
    case "LEGENDARY":
      return "#FFD700";
    case "EPIC":
      return "#BF00FF";
    case "RARE":
      return "#00F0FF";
    case "COMMON":
    default:
      return "#94A3B8";
  }
}

export function calculateSynergyMultipliers(equippedAugmentIds: string[]): SynergyCalculationResult {
  const counts: Record<string, number> = {};
  for (const id of equippedAugmentIds) {
    counts[id] = (counts[id] || 0) + 1;
  }

  let offenseMultiplier = 1.0;
  let defenseShieldBonus = 0;
  let velocityBonus = 0;
  let shardHarvestMultiplier = 1.0;
  const activeSynergies: { name: string; description: string; effectBadge: string }[] = [];

  // Stack-based calculations
  if (counts["KINETIC_DYNAMO"]) {
    velocityBonus += counts["KINETIC_DYNAMO"] * 0.25;
  }
  if (counts["AEGIS_DEFLECTOR"]) {
    defenseShieldBonus += counts["AEGIS_DEFLECTOR"];
  }
  if (counts["GOLDEN_ALCHEMY"]) {
    shardHarvestMultiplier += counts["GOLDEN_ALCHEMY"] * 1.5;
  }
  if (counts["TESLA_ARC"]) {
    offenseMultiplier += counts["TESLA_ARC"] * 0.4;
  }

  // Cross-Augment Synergies
  if (counts["QUANTUM_SPLIT"] && counts["TESLA_ARC"]) {
    activeSynergies.push({
      name: "Quantum Chain Lightning",
      description: "Fragment micro-orbs also discharge chain lightning arcs to secondary targets.",
      effectBadge: "[SYN: QUANTUM ARC]",
    });
    offenseMultiplier += 0.35;
  }

  if (counts["GRAVITY_HARNESS"] && counts["SINGULARITY_VACUUM"]) {
    activeSynergies.push({
      name: "Gravitational Singularity",
      description: "Gravity well entries trigger an instant 360-degree shard collection pulse.",
      effectBadge: "[SYN: VORTEX SINK]",
    });
    shardHarvestMultiplier += 0.5;
  }

  if (counts["SUPERNOVA_REACTOR"] && counts["CHRONOS_WARP"]) {
    activeSynergies.push({
      name: "Chrono Supernova",
      description: "Supernova detonates with 2x radius during time dilation.",
      effectBadge: "[SYN: TIME NOVA]",
    });
    offenseMultiplier += 0.5;
  }

  if (counts["AEGIS_DEFLECTOR"] && counts["PHOENIX_REBIRTH"]) {
    activeSynergies.push({
      name: "Immortal Aegis",
      description: "Shield break events grant 1.5s invulnerability barrier.",
      effectBadge: "[SYN: IMMORTAL]",
    });
    defenseShieldBonus += 1;
  }

  return {
    offenseMultiplier,
    defenseShieldBonus,
    velocityBonus,
    shardHarvestMultiplier,
    activeSynergies,
  };
}

export function getRandomAugmentDraft(
  existingAugmentIds: string[] = [],
  count: number = 3,
  options?: { forceRarity?: AugmentRarity; luckMultiplier?: number }
): AugmentCard[] {
  const luck = Math.max(0.5, options?.luckMultiplier || 1.0);

  const rarityWeights: { rarity: AugmentRarity; weight: number }[] = [
    { rarity: "COMMON", weight: Math.max(10, 60 / luck) },
    { rarity: "RARE", weight: 26 * luck },
    { rarity: "EPIC", weight: 11 * Math.pow(luck, 1.2) },
    { rarity: "LEGENDARY", weight: 3 * Math.pow(luck, 1.5) },
  ];

  // Pool excludes augments already maxed out
  const pool = AUGMENT_REGISTRY.filter((c) => {
    const currentStacks = existingAugmentIds.filter((id) => id === c.id).length;
    return currentStacks < c.maxStacks;
  });

  const selected: AugmentCard[] = [];

  while (selected.length < count && pool.length > 0) {
    let chosenRarity: AugmentRarity = options?.forceRarity || "COMMON";

    if (!options?.forceRarity) {
      const totalWeight = rarityWeights.reduce((acc, curr) => acc + curr.weight, 0);
      let rand = Math.random() * totalWeight;

      for (const r of rarityWeights) {
        if (rand < r.weight) {
          chosenRarity = r.rarity;
          break;
        }
        rand -= r.weight;
      }
    }

    const eligible = pool.filter((c) => c.rarity === chosenRarity);
    const chosen =
      eligible.length > 0
        ? eligible[Math.floor(Math.random() * eligible.length)]
        : pool[Math.floor(Math.random() * pool.length)];

    if (chosen && !selected.some((s) => s.id === chosen.id)) {
      selected.push(chosen);
      const idx = pool.findIndex((c) => c.id === chosen.id);
      if (idx >= 0) pool.splice(idx, 1);
    }
  }

  return selected;
}
