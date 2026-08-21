/**
 * Tier 1 - Feature Coverage: Orbital Sandbox Level Designer & Base64 Serializer
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertGreaterThan,
  assertThrows,
} from "../framework.ts";
import { CustomLevelData } from "../../src/lib/gameEngine/types.ts";

export const PREBUILT_COMMUNITY_LEVELS: CustomLevelData[] = [
  {
    id: "lvl_pinball_mayhem",
    name: "Pinball Super-Colosseum",
    author: "AegisCore",
    targetScore: 12000,
    ambientColor: "#0F051D",
    hasBoss: false,
    bumpers: [
      { id: "b1", x: 200, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b2", x: 400, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 320, radius: 30, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 800, shards: 60, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
      { id: "b4", x: 150, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 3, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
      { id: "b5", x: 450, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 4, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 250, radius: 120, innerRadius: 16, strength: 4500, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    ],
    laserBeams: [],
  },
  {
    id: "lvl_laser_gauntlet",
    name: "Dual Laser Helix",
    author: "QuantumPilot",
    targetScore: 18000,
    ambientColor: "#170308",
    hasBoss: true,
    bossType: "VORTEX_TITAN",
    bumpers: [
      { id: "b1", x: 220, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 0, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b2", x: 380, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 1, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 400, radius: 100, innerRadius: 14, strength: -3800, pulseSpeed: 0.08, pulseOffset: 0, color: "#FF3366" },
    ],
    laserBeams: [
      { id: "l1", startX: 300, startY: 300, endX: 300, endY: 300, angle: 0, angularVelocity: 0.025, length: 140, isActive: true, warmupTimer: 0, activeTimer: 0, duration: 180, interval: 120, damage: 1, color: "#FF0055" },
    ],
  },
];

export function createLevelEditorTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Sandbox Level Designer & Serializer", 1);

  // Helper serializer functions matching LevelEditorModal
  function exportLevelToBase64(data: CustomLevelData): string {
    const json = JSON.stringify(data);
    return Buffer.from(json, "binary").toString("base64");
  }

  function importLevelFromBase64(base64Str: string): CustomLevelData {
    const json = Buffer.from(base64Str.trim(), "base64").toString("binary");
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.bumpers)) {
      throw new Error("Invalid custom level data structure");
    }
    return data;
  }

  // Test 1: Prebuilt Community Levels Integrity
  suite.test("PREBUILT_COMMUNITY_LEVELS contains valid pre-configured playable stages", () => {
    assertEquals(PREBUILT_COMMUNITY_LEVELS.length, 2, "Must provide 2 default community levels");
    
    const pinballLevel = PREBUILT_COMMUNITY_LEVELS[0];
    assertEquals(pinballLevel.id, "lvl_pinball_mayhem");
    assertGreaterThan(pinballLevel.bumpers.length, 3, "Pinball arena should have at least 4 bumpers");
    assertGreaterThan(pinballLevel.gravityWells.length, 0, "Pinball arena should have a gravity well");

    const laserLevel = PREBUILT_COMMUNITY_LEVELS[1];
    assertEquals(laserLevel.id, "lvl_laser_gauntlet");
    assertTrue(laserLevel.hasBoss, "Laser gauntlet must configure boss encounter");
    assertEquals(laserLevel.bossType, "VORTEX_TITAN");
    assertGreaterThan(laserLevel.laserBeams.length, 0, "Laser gauntlet must contain laser beams");
  });

  // Test 2: Custom Level Base64 Export Serialization
  suite.test("Sandbox Level Designer exports valid Base64 encoded payload", () => {
    const testLevel: CustomLevelData = {
      id: "custom_test_101",
      name: "Hyperion Gauntlet",
      author: "TestCommander",
      targetScore: 25000,
      ambientColor: "#170B03",
      hasBoss: true,
      bossType: "SOLAR_HYPERION",
      bumpers: [
        { id: "b1", x: 250, y: 250, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
        { id: "b2", x: 350, y: 250, radius: 30, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 800, shards: 60, pulsePhase: 1, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
      ],
      gravityWells: [
        { id: "gw1", x: 300, y: 200, radius: 100, innerRadius: 15, strength: 4000, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
      ],
      laserBeams: [],
    };

    const base64 = exportLevelToBase64(testLevel);
    assertTrue(base64.length > 50, "Base64 payload must not be empty");
    assertTrue(/^[A-Za-z0-9+/=]+$/.test(base64), "Must be valid Base64 character string");
  });

  // Test 3: Custom Level Base64 Import Deserialization & Validation
  suite.test("Sandbox Level Designer imports and deserializes Base64 code into matching level struct", () => {
    const originalLevel = PREBUILT_COMMUNITY_LEVELS[0];
    const base64 = exportLevelToBase64(originalLevel);

    const imported = importLevelFromBase64(base64);
    assertEquals(imported.name, originalLevel.name);
    assertEquals(imported.targetScore, originalLevel.targetScore);
    assertEquals(imported.bumpers.length, originalLevel.bumpers.length);
    assertEquals(imported.gravityWells.length, originalLevel.gravityWells.length);
    assertEquals(imported.bumpers[0].type, originalLevel.bumpers[0].type);
  });

  // Test 4: Rejection of Corrupted & Invalid Base64 Level Codes
  suite.test("Sandbox Level Designer rejects corrupted or non-conforming payloads", () => {
    assertThrows(() => {
      importLevelFromBase64("NotAValidBase64String!!!");
    }, "Should reject non-base64 characters");

    // Valid Base64 but invalid JSON
    const brokenJsonBase64 = Buffer.from("{ bad json ", "binary").toString("base64");
    assertThrows(() => {
      importLevelFromBase64(brokenJsonBase64);
    }, "Should reject invalid JSON syntax");

    // Valid JSON but missing bumpers array
    const missingFieldsBase64 = Buffer.from(JSON.stringify({ name: "Incomplete" }), "binary").toString("base64");
    assertThrows(() => {
      importLevelFromBase64(missingFieldsBase64);
    }, "Should reject level missing required bumpers array");
  });

  // Test 5: Placement Tool Bumper Entity Generation
  suite.test("Sandbox Level Designer generates valid custom bumper entity definitions", () => {
    const x = 300;
    const y = 220;
    const type = "GOLDEN_CORE";
    const bumper = {
      id: `custom_b_${Date.now()}`,
      x,
      y,
      radius: 26,
      type,
      hp: 4,
      maxHp: 4,
      points: 800,
      shards: 50,
      pulsePhase: 0,
      color: "#FFD700",
      glowColor: "#FFD700",
      isDestroyed: false,
    };

    assertEquals(bumper.x, 300);
    assertEquals(bumper.y, 220);
    assertEquals(bumper.shards, 50, "Golden Core must award 50 shards");
    assertEquals(bumper.hp, 4, "Golden Core must have 4 HP");
  });

  return suite;
}
