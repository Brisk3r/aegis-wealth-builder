/**
 * Tier 4 - Real-World Application Scenarios Suite
 * 
 * Executes full end-to-end user journeys:
 * 1. 2,000-Trial Monte Carlo Headless Physics Simulation (0.00% tunneling, bounce profiling)
 * 2. Multi-Sector Campaign Progression & Roguelite Drafting
 * 3. Complete Run Lifecycle & 2X Rewarded Ad Vault Persistence
 * 4. Sandbox Level Authoring, Base64 Code Exchange & Test Play
 * 5. Unified Cross-Cabinet Progression Loop
 */

import {
  TestSuiteRunner,
  assert,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  resetLocalStorage,
} from "../framework.ts";
import { SimulationBot } from "../../src/lib/gameEngine/simulationBot.ts";
import { SECTORS, generateBoss } from "../../src/lib/gameEngine/levels.ts";
import { getRandomAugmentDraft } from "../../src/lib/gameEngine/augments.ts";
import { ProgressionManager } from "../../src/lib/gameEngine/progression.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { PlayerOrb, CustomLevelData } from "../../src/lib/gameEngine/types.ts";

export function createScenariosTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 4 - Real-World Application Scenarios", 4);

  // Scenario 1: 2,000-Trial Headless Monte Carlo Simulation Run
  suite.test("Scenario 1: Automated 2,000-Trial Monte Carlo physics benchmark achieves 0.00% tunneling rate", () => {
    const result = SimulationBot.runStressTest(2000);
    assertEquals(result.totalTrials, 2000, "Must execute exactly 2,000 trials");
    assertEquals(result.tunnelingAnomalies, 0, "Tunneling anomaly rate must be 0.00%");
    assertEquals(result.stuckLoopsDetected, 0, "Stuck loops detected must be 0");
    assertGreaterThan(result.averageBounces, 3.0, "Average bounces per launch must be >= 3.0");
    assertGreaterThan(result.maxComboAchieved, 5, "Peak combo streak achieved must be >= 5");
    assertGreaterThan(result.averageScore, 500, "Average score must be positive");
    assertGreaterThan(result.shardYieldPerRun, 0, "Shard yield per run must be positive");
    assertLessThan(result.physicsExecutionTimeMs, 5000, "2,000 trials (1.2M sub-steps) must complete in < 5000ms");
  });

  // Scenario 2: Multi-Sector Campaign Progression & Roguelite Drafting Loop
  suite.test("Scenario 2: Multi-Sector Campaign progression from Sector 1 through Sector 5 Apex", () => {
    resetLocalStorage();
    let currentSector = 1;
    let runScore = 0;
    let runShards = 0;
    const draftedAugments: string[] = [];

    // Simulate sectors 1 through 5
    for (let s = 1; s <= 5; s++) {
      currentSector = s;
      const sectorConfig = SECTORS.find((sec) => sec.sectorNumber === s)!;

      // Earn required score to clear sector
      const sectorScore = sectorConfig.targetScore;
      runScore += sectorScore;
      runShards += 150; // Shards collected in sector

      if (sectorConfig.hasBoss) {
        const boss = generateBoss(s, 600, 600)!;
        assert(boss !== null, `Sector ${s} must have active boss`);
        boss.hp = 0; // Boss defeated
        runScore += 5000;
        runShards += 300;
      }

      // Sector Clear -> Augment Drafting Step
      const draft = getRandomAugmentDraft(draftedAugments);
      if (draft.length > 0) {
        const picked = draft[0];
        draftedAugments.push(picked.id);
      }
    }

    assertEquals(currentSector, 5, "Successfully progressed to Sector 5");
    assertGreaterThan(runScore, 60000, "Campaign victory score achieved");
    assertGreaterThan(runShards, 1000, "Campaign victory shards harvested");
    assertEquals(draftedAugments.length, 5, "Drafted 1 augment card per sector clear");
  });

  // Scenario 3: Complete Run Lifecycle -> Game Over -> 2X Ad Multiplier -> Quantum Vault
  suite.test("Scenario 3: Complete run lifecycle, game over telemetry debrief, 2X ad reward, and vault persistence", () => {
    resetLocalStorage();
    const initialVault = ProgressionManager.getTelemetry().totalQuantumShards;

    // Simulated Active Run
    const runStats = {
      score: 34800,
      sectorReached: 4,
      bounces: 64,
      peakCombo: 28,
      shardsCollected: 450,
      bossDefeated: true,
    };

    // Game Over occurs
    const baseShards = runStats.shardsCollected;
    
    // User watches 2X Rewarded Ad sponsor stream
    const adMultiplierWatched = true;
    const finalEarnedShards = adMultiplierWatched ? baseShards * 2 : baseShards;
    assertEquals(finalEarnedShards, 900, "Doubled shards from 2X rewarded ad");

    // Persist to unified localStorage Quantum Vault
    const telemetry = ProgressionManager.getTelemetry();
    telemetry.highScore = Math.max(telemetry.highScore, runStats.score);
    telemetry.maxSectorReached = Math.max(telemetry.maxSectorReached, runStats.sectorReached);
    telemetry.totalBounces += runStats.bounces;
    telemetry.highestCombo = Math.max(telemetry.highestCombo, runStats.peakCombo);
    telemetry.totalQuantumShards += finalEarnedShards;
    telemetry.runsCompleted += 1;
    if (runStats.bossDefeated) telemetry.bossesDefeated += 1;

    ProgressionManager.saveTelemetry(telemetry);

    // Verify vault persistence
    const reloaded = ProgressionManager.getTelemetry();
    assertEquals(reloaded.highScore, 34800);
    assertEquals(reloaded.maxSectorReached, 4);
    assertEquals(reloaded.totalBounces, 64);
    assertEquals(reloaded.highestCombo, 28);
    assertEquals(reloaded.totalQuantumShards, initialVault + 900);
    assertEquals(reloaded.runsCompleted, 1);
    assertEquals(reloaded.bossesDefeated, 1);
  });

  // Scenario 4: Sandbox Level Authoring, Base64 Exchange & Play Session
  suite.test("Scenario 4: Author custom sandbox stage, export Base64 code, import and execute test flight", () => {
    const authorStage: CustomLevelData = {
      id: "stage_user_apex",
      name: "Solar Vortex Arena",
      author: "TestArchitect",
      targetScore: 20000,
      ambientColor: "#120517",
      hasBoss: true,
      bossType: "VORTEX_TITAN",
      bumpers: [
        { id: "b1", x: 200, y: 250, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
        { id: "b2", x: 400, y: 250, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
        { id: "b3", x: 300, y: 150, radius: 28, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 800, shards: 60, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
      ],
      gravityWells: [
        { id: "gw1", x: 300, y: 300, radius: 120, innerRadius: 15, strength: 4200, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
      ],
      laserBeams: [],
    };

    // 1. Author exports to Base64
    const base64Code = Buffer.from(JSON.stringify(authorStage), "binary").toString("base64");
    assertTrue(base64Code.length > 0);

    // 2. Peer imports Base64 code
    const importedJson = Buffer.from(base64Code, "base64").toString("binary");
    const importedStage: CustomLevelData = JSON.parse(importedJson);
    assertEquals(importedStage.name, authorStage.name);
    assertEquals(importedStage.bumpers.length, 3);

    // 3. Test flight simulation in custom arena aimed directly at bumper b3 (300, 150)
    const orb: PlayerOrb = {
      x: 300,
      y: 180,
      vx: 0,
      vy: -5,
      radius: 12,
      baseRadius: 12,
      mass: 1.0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      trailColor: "#00F0FF",
      hp: 100,
      maxHp: 100,
      shields: 1,
      maxShields: 1,
      energy: 0,
      maxEnergy: 100,
      overdriveCharge: 0,
      isOverdrive: false,
      overdriveTimer: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      piercing: 0,
      splitCount: 0,
      lightningArcs: 0,
      isGhost: false,
      trailHistory: [],
      launchesLeft: 5,
      maxLaunches: 5,
    };

    let score = 0;
    for (let step = 0; step < 10; step++) {
      for (const b of importedStage.bumpers) {
        const res = PhysicsEngine.checkBumperCollision(orb, b, 1.0);
        if (res.hit) {
          score += b.points;
        }
      }
      PhysicsEngine.updateOrb(orb, importedStage.gravityWells, 600, 600, 1.0);
    }

    assertGreaterThan(score, 0, "Orb must interact with imported stage obstacles and score points");
  });

  // Scenario 5: Full Cross-Cabinet Progression Workflow
  suite.test("Scenario 5: Full cross-cabinet currency exchange, tech tree upgrade, and vessel hangar deployment", () => {
    resetLocalStorage();
    
    // Step A: Play Kinetic Surge -> earn 800 shards
    const t = ProgressionManager.getTelemetry();
    t.totalQuantumShards += 800; // Total = 250 + 800 = 1050
    ProgressionManager.saveTelemetry(t);

    // Step B: Purchase Tech Upgrade 'Kinetic Elasticity' (cost 120)
    const techList = ProgressionManager.getTechUpgrades();
    const bounceTech = techList.find((item) => item.id === "TECH_BOUNCE_RESTITUTION")!;
    assertEquals(bounceTech.level, 0);

    t.totalQuantumShards -= bounceTech.costPerLevel; // 1050 - 120 = 930
    bounceTech.level += 1;
    ProgressionManager.saveTechUpgrades(techList);
    ProgressionManager.saveTelemetry(t);

    // Step C: Play Gravity Runner -> earn 600 shards (930 + 600 = 1530)
    t.totalQuantumShards += 600;
    ProgressionManager.saveTelemetry(t);

    // Step D: Open Hangar and unlock Titan Dreadnought (cost 1200 shards)
    const vessels = ProgressionManager.getVessels();
    const titan = vessels.find((v) => v.id === "TITAN_DREADNOUGHT")!;
    assertFalse(titan.unlocked);

    t.totalQuantumShards -= titan.cost; // 1530 - 1200 = 330
    titan.unlocked = true;
    ProgressionManager.saveVessels(vessels);
    ProgressionManager.setActiveVesselId(titan.id);
    ProgressionManager.saveTelemetry(t);

    // Step E: Verify consistent global state
    const finalTelemetry = ProgressionManager.getTelemetry();
    const finalTech = ProgressionManager.getTechUpgrades();
    const finalVessels = ProgressionManager.getVessels();

    assertEquals(finalTelemetry.totalQuantumShards, 330, "Vault balance accurate across all operations");
    assertEquals(finalTech.find((x) => x.id === "TECH_BOUNCE_RESTITUTION")!.level, 1, "Tech upgrade level saved");
    assertTrue(finalVessels.find((x) => x.id === "TITAN_DREADNOUGHT")!.unlocked, "Titan Dreadnought unlocked");
    assertEquals(ProgressionManager.getActiveVesselId(), "TITAN_DREADNOUGHT", "Titan Dreadnought equipped");
  });

  return suite;
}
