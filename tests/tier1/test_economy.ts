/**
 * Tier 1 - Feature Coverage: Roguelite Drafting, Economy & Quantum Vault
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThanOrEqual,
  resetLocalStorage,
} from "../framework.ts";
import {
  AUGMENT_REGISTRY,
  getRandomAugmentDraft,
} from "../../src/lib/gameEngine/augments.ts";
import {
  ProgressionManager,
  INITIAL_VESSELS,
  COSMETIC_TRAILS,
} from "../../src/lib/gameEngine/progression.ts";

export function createEconomyTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Roguelite Economy & Vault", 1);

  // Test 1: Augment Registry Catalog Completeness
  suite.test("AUGMENT_REGISTRY contains complete card catalog across 4 categories and rarities", () => {
    assertGreaterThanOrEqual(AUGMENT_REGISTRY.length, 14, "Must contain at least 14 roguelite augment cards");

    const categories = new Set(AUGMENT_REGISTRY.map((a) => a.category));
    assertTrue(categories.has("OFFENSE"), "Must include OFFENSE augments");
    assertTrue(categories.has("DEFENSE"), "Must include DEFENSE augments");
    assertTrue(categories.has("KINETIC"), "Must include KINETIC augments");
    assertTrue(categories.has("UTILITY"), "Must include UTILITY augments");

    const rarities = new Set(AUGMENT_REGISTRY.map((a) => a.rarity));
    assertTrue(rarities.has("COMMON"), "Must include COMMON rarity");
    assertTrue(rarities.has("RARE"), "Must include RARE rarity");
    assertTrue(rarities.has("EPIC"), "Must include EPIC rarity");
    assertTrue(rarities.has("LEGENDARY"), "Must include LEGENDARY rarity");

    // All IDs must be unique
    const idSet = new Set(AUGMENT_REGISTRY.map((a) => a.id));
    assertEquals(idSet.size, AUGMENT_REGISTRY.length, "All augment IDs must be strictly unique");
  });

  // Test 2: Weighted Roguelite Card Drafting
  suite.test("getRandomAugmentDraft returns 3 distinct un-maxed augment cards", () => {
    const draft = getRandomAugmentDraft([]);
    assertEquals(draft.length, 3, "Draft must present exactly 3 options");

    const draftIds = new Set(draft.map((d) => d.id));
    assertEquals(draftIds.size, 3, "All 3 cards in draft must be distinct");

    // If all but 2 augments are maxed, draft returns remaining
    const allExceptTwo = AUGMENT_REGISTRY.slice(2).flatMap((a) =>
      Array(a.maxStacks).fill(a.id)
    );
    const constrainedDraft = getRandomAugmentDraft(allExceptTwo);
    assertEquals(constrainedDraft.length, 2, "Draft should return only remaining eligible cards");
  });

  // Test 3: Tech Matrix Skill Tree Upgrades
  suite.test("Tech Matrix upgrades initialize correctly and persist level changes", () => {
    resetLocalStorage();
    const tech = ProgressionManager.getTechUpgrades();
    assertEquals(tech.length, 7, "Must contain exactly 7 tech upgrade nodes");

    // Modify a level and save
    tech[0].level = 3;
    ProgressionManager.saveTechUpgrades(tech);

    const reloaded = ProgressionManager.getTechUpgrades();
    assertEquals(reloaded[0].level, 3, "Saved tech level should persist");
    assertEquals(reloaded[1].level, 0, "Untouched tech level should remain 0");
  });

  // Test 4: Fleet Hangar Vessels Configuration
  suite.test("INITIAL_VESSELS defines 8 distinct hull classes with mass & shield attributes", () => {
    assertEquals(INITIAL_VESSELS.length, 8, "Must define 8 distinct vessels");
    
    // First vessel is free and unlocked
    assertEquals(INITIAL_VESSELS[0].id, "PHOTON_DART");
    assertTrue(INITIAL_VESSELS[0].unlocked, "Starter Photon Dart must be unlocked by default");
    assertEquals(INITIAL_VESSELS[0].cost, 0, "Starter Photon Dart must cost 0 shards");

    // Final vessel is endgame sovereign
    assertEquals(INITIAL_VESSELS[7].id, "OMEGA_AEGIS");
    assertEquals(INITIAL_VESSELS[7].cost, 25000, "Omega Aegis sovereign cost must be 25,000 shards");
    assertEquals(INITIAL_VESSELS[7].shieldSlots, 6, "Omega Aegis must provide 6 shield slots");

    // Unlocking a vessel
    resetLocalStorage();
    const vessels = ProgressionManager.getVessels();
    // Clone and test
    const customVessels = vessels.map((v) => ({ ...v }));
    customVessels[1].unlocked = true; // Unlock Vortex Striker
    ProgressionManager.saveVessels(customVessels);

    const reloadedVessels = ProgressionManager.getVessels();
    assertTrue(reloadedVessels[1].unlocked, "Vortex Striker unlock state must persist");
  });

  // Test 5: Cosmetic Ion Particle Trails
  suite.test("COSMETIC_TRAILS defines 6 neon color palettes with active selection", () => {
    assertEquals(COSMETIC_TRAILS.length, 6, "Must define 6 cosmetic ion trails");
    assertTrue(COSMETIC_TRAILS[0].unlocked, "First trail Cyber Cyan must be unlocked by default");

    resetLocalStorage();
    assertEquals(ProgressionManager.getActiveTrailId(), "CYBER_CYAN");

    ProgressionManager.setActiveTrailId("RUBY_LASER");
    assertEquals(ProgressionManager.getActiveTrailId(), "RUBY_LASER");
  });

  // Test 6: Unified Quantum Vault Telemetry & Currency Persistence
  suite.test("ProgressionManager persists telemetry, high scores, and currency balances", () => {
    resetLocalStorage();
    const initialTelemetry = ProgressionManager.getTelemetry();
    assertEquals(initialTelemetry.totalQuantumShards, 250, "Welcome starter shard bonus should be 250");

    initialTelemetry.highScore = 48500;
    initialTelemetry.totalQuantumShards += 1200;
    initialTelemetry.bossesDefeated += 2;
    ProgressionManager.saveTelemetry(initialTelemetry);

    const updated = ProgressionManager.getTelemetry();
    assertEquals(updated.highScore, 48500, "High score persisted");
    assertEquals(updated.totalQuantumShards, 1450, "Shard total updated and persisted");
    assertEquals(updated.bossesDefeated, 2, "Bosses defeated count persisted");
  });

  // Test 7: Daily Supply Drop 24-Hour Timer Check
  suite.test("ProgressionManager validates 24-hour daily supply drop eligibility", () => {
    resetLocalStorage();
    assertTrue(ProgressionManager.canClaimDailySupplyDrop(), "Should be claimable on fresh install");

    ProgressionManager.recordSupplyDropClaim();
    assertFalse(ProgressionManager.canClaimDailySupplyDrop(), "Should NOT be claimable immediately after claiming");
  });

  return suite;
}
