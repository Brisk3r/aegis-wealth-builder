import { BossEntity, BossType, Bumper, BumperType, CustomLevelData, GravityWell, LaserBeam, SectorConfig } from "./types";

export const SECTORS: SectorConfig[] = [
  {
    sectorNumber: 1,
    name: "Neon Asteroid Belt",
    subtitle: "Gravitational Slingshot Proving Grounds",
    targetScore: 1500,
    bumpersCount: 12,
    gravityWellsCount: 1,
    laserBeamsCount: 0,
    hasBoss: false,
    ambientColor: "#050B14",
    musicTheme: "NEBULA",
  },
  {
    sectorNumber: 2,
    name: "Plasma Grid Relay",
    subtitle: "High-Energy Deflection Arrays",
    targetScore: 4000,
    bumpersCount: 16,
    gravityWellsCount: 2,
    laserBeamsCount: 1,
    hasBoss: false,
    ambientColor: "#06130B",
    musicTheme: "PLASMA",
  },
  {
    sectorNumber: 3,
    name: "Cyber Singularity Maw",
    subtitle: "Sector Apex: Vortex Titan Encounter",
    targetScore: 8500,
    bumpersCount: 14,
    gravityWellsCount: 2,
    laserBeamsCount: 1,
    hasBoss: true,
    bossType: "VORTEX_TITAN",
    ambientColor: "#120517",
    musicTheme: "BOSS_VORTEX",
  },
  {
    sectorNumber: 4,
    name: "Hyperion Solar Core",
    subtitle: "Thermonuclear Overdrive Field",
    targetScore: 16000,
    bumpersCount: 18,
    gravityWellsCount: 3,
    laserBeamsCount: 2,
    hasBoss: true,
    bossType: "SOLAR_HYPERION",
    ambientColor: "#170B03",
    musicTheme: "BOSS_HYPERION",
  },
  {
    sectorNumber: 5,
    name: "Aegis Quantum Nexus",
    subtitle: "Grand Master Protocol: Aegis Dreadnought",
    targetScore: 30000,
    bumpersCount: 20,
    gravityWellsCount: 3,
    laserBeamsCount: 3,
    hasBoss: true,
    bossType: "AEGIS_DREADNOUGHT",
    ambientColor: "#031217",
    musicTheme: "BOSS_AEGIS",
  },
  {
    sectorNumber: 6,
    name: "Chronos Temporal Abyss",
    subtitle: "Secret Apex: Chronos Prime Singularity",
    targetScore: 50000,
    bumpersCount: 22,
    gravityWellsCount: 3,
    laserBeamsCount: 3,
    hasBoss: true,
    bossType: "CHRONOS_PRIME",
    ambientColor: "#0A0314",
    musicTheme: "BOSS_VORTEX",
  },
  {
    sectorNumber: 7,
    name: "Void Leviathan Maw",
    subtitle: "Ultimate Singularity: Void Leviathan",
    targetScore: 80000,
    bumpersCount: 24,
    gravityWellsCount: 4,
    laserBeamsCount: 4,
    hasBoss: true,
    bossType: "VOID_LEVIATHAN",
    ambientColor: "#03080F",
    musicTheme: "BOSS_AEGIS",
  },
];

export function generateSectorBumpers(sectorNumber: number, width: number, height: number): Bumper[] {
  const bumpers: Bumper[] = [];
  const sector = SECTORS.find((s) => s.sectorNumber === sectorNumber) || SECTORS[0];
  const count = sector.bumpersCount;

  const bumperTypes: { type: BumperType; color: string; glow: string; hp: number; points: number; shards: number; weight: number }[] = [
    { type: "STANDARD", color: "#00F0FF", glow: "rgba(0, 240, 255, 0.4)", hp: 1, points: 100, shards: 5, weight: 45 },
    { type: "BOUNCE_SUPER", color: "#39FF14", glow: "rgba(57, 255, 20, 0.4)", hp: 2, points: 200, shards: 10, weight: 25 },
    { type: "EXPLOSIVE", color: "#FF3366", glow: "rgba(255, 51, 102, 0.4)", hp: 1, points: 300, shards: 15, weight: 15 },
    { type: "PRISM_LASER", color: "#BF00FF", glow: "rgba(191, 0, 255, 0.4)", hp: 3, points: 450, shards: 20, weight: 10 },
    { type: "GOLDEN_CORE", color: "#FFD700", glow: "rgba(255, 215, 0, 0.6)", hp: 2, points: 600, shards: 50, weight: 5 },
  ];

  // Distribute in playable game zone (top 15% to bottom 65%)
  const marginX = width * 0.12;
  const topY = height * 0.15;
  const bottomY = height * 0.65;

  let attempts = 0;
  while (bumpers.length < count && attempts < 200) {
    attempts++;
    const x = marginX + Math.random() * (width - marginX * 2);
    const y = topY + Math.random() * (bottomY - topY);
    const radius = Math.random() * 8 + 18;

    // Check overlap with existing bumpers
    const overlapping = bumpers.some((b) => {
      const dx = b.x - x;
      const dy = b.y - y;
      return Math.hypot(dx, dy) < b.radius + radius + 18;
    });

    if (!overlapping) {
      // Pick type by weight
      const totalWeight = bumperTypes.reduce((acc, t) => acc + t.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedType = bumperTypes[0];
      for (const t of bumperTypes) {
        if (rand < t.weight) {
          selectedType = t;
          break;
        }
        rand -= t.weight;
      }

      bumpers.push({
        id: `bumper_${sectorNumber}_${bumpers.length}`,
        x,
        y,
        radius,
        type: selectedType.type,
        hp: selectedType.hp,
        maxHp: selectedType.hp,
        points: selectedType.points,
        shards: selectedType.shards,
        pulsePhase: Math.random() * Math.PI * 2,
        color: selectedType.color,
        glowColor: selectedType.glow,
        isDestroyed: false,
      });
    }
  }

  return bumpers;
}

export function generateGravityWells(sectorNumber: number, width: number, height: number): GravityWell[] {
  const wells: GravityWell[] = [];
  const sector = SECTORS.find((s) => s.sectorNumber === sectorNumber) || SECTORS[0];

  if (sector.gravityWellsCount >= 1) {
    wells.push({
      id: "gw_center",
      x: width * 0.5,
      y: height * 0.38,
      radius: Math.min(width, height) * 0.22,
      innerRadius: 18,
      strength: 4200,
      pulseSpeed: 0.04,
      pulseOffset: 0,
      color: "#00F0FF",
    });
  }

  if (sector.gravityWellsCount >= 2) {
    wells.push({
      id: "gw_left",
      x: width * 0.25,
      y: height * 0.25,
      radius: Math.min(width, height) * 0.16,
      innerRadius: 14,
      strength: -3200, // Repulsion well
      pulseSpeed: 0.06,
      pulseOffset: Math.PI,
      color: "#FF3366",
    });
  }

  if (sector.gravityWellsCount >= 3) {
    wells.push({
      id: "gw_right",
      x: width * 0.75,
      y: height * 0.25,
      radius: Math.min(width, height) * 0.16,
      innerRadius: 14,
      strength: 3800,
      pulseSpeed: 0.05,
      pulseOffset: Math.PI * 0.5,
      color: "#39FF14",
    });
  }

  return wells;
}

export function generateLaserBeams(sectorNumber: number, width: number, height: number): LaserBeam[] {
  const beams: LaserBeam[] = [];
  const sector = SECTORS.find((s) => s.sectorNumber === sectorNumber) || SECTORS[0];

  if (sector.laserBeamsCount >= 1) {
    beams.push({
      id: "laser_1",
      startX: width * 0.5,
      startY: height * 0.32,
      endX: width * 0.5,
      endY: height * 0.32,
      angle: 0,
      angularVelocity: 0.02,
      length: Math.min(width, height) * 0.28,
      isActive: true,
      warmupTimer: 0,
      activeTimer: 0,
      duration: 180,
      interval: 120,
      damage: 1,
      color: "#FF0055",
    });
  }

  if (sector.laserBeamsCount >= 2) {
    beams.push({
      id: "laser_2",
      startX: width * 0.5,
      startY: height * 0.32,
      endX: width * 0.5,
      endY: height * 0.32,
      angle: Math.PI,
      angularVelocity: -0.015,
      length: Math.min(width, height) * 0.28,
      isActive: true,
      warmupTimer: 0,
      activeTimer: 0,
      duration: 180,
      interval: 120,
      damage: 1,
      color: "#BF00FF",
    });
  }

  return beams;
}

export function generateBoss(sectorNumber: number, width: number, height: number): BossEntity | null {
  const sector = SECTORS.find((s) => s.sectorNumber === sectorNumber);
  if (!sector || !sector.hasBoss || !sector.bossType) return null;

  const dronesCount = sector.bossType === "VOID_LEVIATHAN" ? 8 : sector.bossType === "AEGIS_DREADNOUGHT" || sector.bossType === "CHRONOS_PRIME" ? 6 : 4;
  const drones = Array.from({ length: dronesCount }, (_, idx) => {
    const angle = (idx / dronesCount) * Math.PI * 2;
    const orbitRadius = 65;
    return {
      x: width * 0.5 + Math.cos(angle) * orbitRadius,
      y: height * 0.24 + Math.sin(angle) * orbitRadius,
      angle,
      orbitRadius,
      radius: 12,
      hp: 150,
      maxHp: 150,
      color: "#00F0FF",
    };
  });

  const hp =
    sector.bossType === "VORTEX_TITAN"
      ? 1800
      : sector.bossType === "SOLAR_HYPERION"
      ? 3200
      : sector.bossType === "AEGIS_DREADNOUGHT"
      ? 5000
      : sector.bossType === "CHRONOS_PRIME"
      ? 7500
      : 12000;

  const color =
    sector.bossType === "VORTEX_TITAN"
      ? "#BF00FF"
      : sector.bossType === "SOLAR_HYPERION"
      ? "#FF9900"
      : sector.bossType === "CHRONOS_PRIME"
      ? "#39FF14"
      : sector.bossType === "VOID_LEVIATHAN"
      ? "#00FFCC"
      : "#00F0FF";

  return {
    id: `boss_${sector.bossType}`,
    name: sector.bossType.replace(/_/g, " "),
    type: sector.bossType,
    x: width * 0.5,
    y: height * 0.24,
    vx: 1.2,
    vy: 0,
    radius: 42,
    hp,
    maxHp: hp,
    phase: 1,
    maxPhases: 3,
    attackTimer: 0,
    attackCooldown: 180,
    color,
    glowColor: "rgba(0, 240, 255, 0.7)",
    drones,
    shieldActive: true,
    enraged: false,
    dialogue: "CORE SYSTEM INITIATED. COMMENCE KINETIC DEFENSE.",
  };
}

// ----------------------------------------------------------------------------
// Base64 Custom Level Serialization & Hardened Deserialization
// ----------------------------------------------------------------------------

function hasPrototypePollution(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (
    Object.prototype.hasOwnProperty.call(obj, "__proto__") ||
    Object.prototype.hasOwnProperty.call(obj, "constructor") ||
    Object.prototype.hasOwnProperty.call(obj, "prototype")
  ) {
    return true;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (hasPrototypePollution(item)) return true;
    }
  } else {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      if (hasPrototypePollution((obj as Record<string, unknown>)[key])) return true;
    }
  }
  return false;
}

export function exportLevelToBase64(level: CustomLevelData): string {
  const json = JSON.stringify(level);
  if (typeof btoa === "function") {
    return btoa(json);
  }
  return Buffer.from(json, "utf-8").toString("base64");
}

export function safeDeserializeLevelCode(code: string): {
  success: boolean;
  data?: CustomLevelData;
  error?: string;
} {
  try {
    if (!code || typeof code !== "string" || code.trim() === "") {
      return { success: false, error: "Empty or invalid string" };
    }

    const trimmed = code.trim();

    // Guard against oversized Denial-of-Service payloads (> 1MB)
    if (trimmed.length > 1024 * 1024) {
      return { success: false, error: "Payload exceeds size limit (DoS prevention)" };
    }

    // Check base64 format characters
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(trimmed);
    if (!isBase64) {
      return { success: false, error: "Invalid Base64 character set" };
    }

    // Base64 length must be multiple of 4 if padded
    if (trimmed.length % 4 !== 0) {
      return { success: false, error: "Invalid Base64 length alignment" };
    }

    // Decode Base64 string
    let jsonStr: string;
    if (typeof atob === "function") {
      jsonStr = atob(trimmed);
    } else {
      jsonStr = Buffer.from(trimmed, "base64").toString("utf-8");
    }

    if (!jsonStr || jsonStr.length === 0) {
      return { success: false, error: "Decoded JSON string is empty" };
    }

    // Parse JSON
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: "JSON parse error: " + msg };
    }

    // Root must be a non-null plain object (not an array, not a primitive)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { success: false, error: "Root payload must be a JSON object" };
    }

    // Security check: Recursive Prototype pollution block
    if (hasPrototypePollution(parsed)) {
      return { success: false, error: "Security violation: Prototype pollution detected" };
    }

    // Required schema verification: bumpers MUST be an Array
    if (!parsed.bumpers || !Array.isArray(parsed.bumpers)) {
      return { success: false, error: "Missing or invalid required 'bumpers' array" };
    }

    // Validate bumper entities
    for (let i = 0; i < parsed.bumpers.length; i++) {
      const b = parsed.bumpers[i];
      if (!b || typeof b !== "object" || Array.isArray(b)) {
        return { success: false, error: `Invalid bumper object at index ${i}` };
      }
      const bObj = b as Record<string, unknown>;
      if (
        typeof bObj.x !== "number" ||
        !Number.isFinite(bObj.x) ||
        bObj.x < 0 ||
        bObj.x > 10000 ||
        (bObj.x > 0 && bObj.x < 0.01) ||
        typeof bObj.y !== "number" ||
        !Number.isFinite(bObj.y) ||
        bObj.y < 0 ||
        bObj.y > 10000 ||
        (bObj.y > 0 && bObj.y < 0.01)
      ) {
        return { success: false, error: `Invalid numeric coordinates at bumper index ${i}` };
      }
      if (
        typeof bObj.radius !== "number" ||
        !Number.isFinite(bObj.radius) ||
        bObj.radius < 5 ||
        bObj.radius > 500
      ) {
        return { success: false, error: `Invalid radius at bumper index ${i}` };
      }
    }

    // Validate gravity wells if present
    if (parsed.gravityWells !== undefined) {
      if (!Array.isArray(parsed.gravityWells)) {
        return { success: false, error: "Field 'gravityWells' must be an Array if specified" };
      }
      for (let i = 0; i < parsed.gravityWells.length; i++) {
        const gw = parsed.gravityWells[i];
        if (!gw || typeof gw !== "object" || Array.isArray(gw)) {
          return { success: false, error: `Invalid gravity well object at index ${i}` };
        }
        const gwObj = gw as Record<string, unknown>;
        if (
          typeof gwObj.x !== "number" ||
          !Number.isFinite(gwObj.x) ||
          typeof gwObj.y !== "number" ||
          !Number.isFinite(gwObj.y)
        ) {
          return { success: false, error: `Invalid numeric coordinates at gravity well index ${i}` };
        }
      }
    }

    // Validate laser beams if present
    if (parsed.laserBeams !== undefined) {
      if (!Array.isArray(parsed.laserBeams)) {
        return { success: false, error: "Field 'laserBeams' must be an Array if specified" };
      }
    }

    // Validate target score if present
    if (parsed.targetScore !== undefined) {
      if (
        typeof parsed.targetScore !== "number" ||
        !Number.isFinite(parsed.targetScore) ||
        parsed.targetScore <= 0 ||
        parsed.targetScore > 10000000
      ) {
        return { success: false, error: "Field 'targetScore' must be a positive finite number <= 10,000,000" };
      }
    }

    // Validate metadata strings if present
    if (parsed.name !== undefined && typeof parsed.name !== "string") {
      return { success: false, error: "Field 'name' must be a string" };
    }
    if (parsed.author !== undefined && typeof parsed.author !== "string") {
      return { success: false, error: "Field 'author' must be a string" };
    }
    if (parsed.ambientColor !== undefined && typeof parsed.ambientColor !== "string") {
      return { success: false, error: "Field 'ambientColor' must be a string" };
    }

    // Sanitize output
    const sanitized: CustomLevelData = {
      id: typeof parsed.id === "string" ? parsed.id.slice(0, 64) : `custom_${Date.now()}`,
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 64) : "Imported Level",
      author: typeof parsed.author === "string" ? parsed.author.slice(0, 64) : "Pilot",
      targetScore: typeof parsed.targetScore === "number" ? parsed.targetScore : 10000,
      ambientColor: typeof parsed.ambientColor === "string" ? parsed.ambientColor : "#0B0F19",
      hasBoss: Boolean(parsed.hasBoss),
      bossType: parsed.bossType as BossType | undefined,
      bumpers: parsed.bumpers as Bumper[],
      gravityWells: Array.isArray(parsed.gravityWells) ? (parsed.gravityWells as GravityWell[]) : [],
      laserBeams: Array.isArray(parsed.laserBeams) ? (parsed.laserBeams as LaserBeam[]) : [],
    };

    return { success: true, data: sanitized };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg || "Unhandled deserialization exception" };
  }
}

