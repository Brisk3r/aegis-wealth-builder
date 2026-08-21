/**
 * Tier 1 - Cycles 101-200 Verification Test Suite
 * 5-Cabinet Multi-Mode Dynamic Difficulty, 10k Boss AI Stress, and Neon Duel CCD Fuzzing
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertGreaterThan,
  assertTrue,
  assertFalse,
} from "../framework.ts";
import { SimulationBot } from "../../src/lib/gameEngine/simulationBot.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { SECTORS } from "../../src/lib/gameEngine/levels.ts";
import { runCycles101To200 } from "../../scripts/run-cycles-101-200.ts";

export function createCycles101To200TestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Cycles 101-200 Multi-Mode & Boss AI Matrix", 1);

  // Test 1: Dynamic difficulty curves across all 7 sectors and 4 modes
  suite.test("SimulationBot.calibrateDifficultyCurves() evaluates Campaign 1-7, Endless, Boss Rush, and Blitz", () => {
    const cal = SimulationBot.calibrateDifficultyCurves();
    assertEquals(cal.status, "BALANCED");
    assertEquals(cal.campaignSectors.length, 7);
    assertEquals(cal.endlessOverdrive.velocityScalingPerWave, 0.08);
    assertEquals(cal.titanBossRush.totalBosses, 5);
    assertEquals(cal.titanBossRush.totalGauntletHp, 29500);
    assertEquals(cal.quantumBlitz.timeLimitSeconds, 60);
    assertEquals(cal.quantumBlitz.startingLaunches, 99);
    assertEquals(cal.quantumBlitz.frenzyMultiplier, 3.0);

    // Verify sector score progression
    for (let i = 1; i < cal.campaignSectors.length; i++) {
      assertGreaterThan(
        cal.campaignSectors[i].targetScore,
        cal.campaignSectors[i - 1].targetScore,
        `Sector ${i + 1} target score must exceed Sector ${i}`
      );
    }
  });

  // Test 2: Boss AI 10,000-iteration stress testing across all 5 titan bosses
  suite.test("SimulationBot.runBossStressTest10k() verifies 100% enrage rate and 1.80x speed scaling", () => {
    // Run mini-batch of 200 per boss (1,000 total) for fast automated test run
    const report = SimulationBot.runBossStressTest10k(200);
    assertEquals(report.status, "PASS");
    assertEquals(report.allBossesPassed, true);
    assertEquals(report.overallEnrageSuccessRate, 100.0);
    assertTrue(
      Math.abs(report.overallSpeedScalingAccuracy - 1.8) < 0.05,
      "Speed scaling should be 1.80x"
    );

    const bosses = ["VORTEX_TITAN", "SOLAR_HYPERION", "AEGIS_DREADNOUGHT", "CHRONOS_PRIME", "VOID_LEVIATHAN"] as const;
    for (const bType of bosses) {
      const b = report.bossBreakdowns[bType];
      assertEquals(b.status, "PASS");
      assertEquals(b.enrageSuccessRate, 100.0);
      assertEquals(b.deadlocksDetected, 0);
      assertEquals(b.negativeHpAnomalies, 0);
      assertGreaterThan(b.totalCoreHits, 0);
    }
  });

  // Test 3: Neon Duel continuous collision detection (CCD) under extreme ball velocity
  suite.test("PhysicsEngine.checkPaddleCCD() rebounds hypersonic disks without tunneling at 120 px/step", () => {
    const leftPaddle = { x: 35, y: 200, width: 14, height: 80 };
    const rightPaddle = { x: 651, y: 200, width: 14, height: 80 };

    // Test Left Paddle Swept Collision (moving from x=120 to x=-20 with vx=-120)
    const diskLeft = { x: -20, y: 240, vx: -120, vy: 0, radius: 10 };
    const resultLeft = PhysicsEngine.checkPaddleCCD(diskLeft, 120, 240, leftPaddle, true);
    assertEquals(resultLeft.hit, true, "Left paddle swept collision must be detected");
    assertGreaterThan(resultLeft.newVx, 0, "Reflected vx must be positive");
    assertEquals(resultLeft.hitOffset, 0, "Center hit should have 0 hitOffset");

    // Test Right Paddle Swept Collision (moving from x=580 to x=720 with vx=120)
    const diskRight = { x: 720, y: 220, vx: 120, vy: 0, radius: 10 };
    const resultRight = PhysicsEngine.checkPaddleCCD(diskRight, 580, 220, rightPaddle, false);
    assertEquals(resultRight.hit, true, "Right paddle swept collision must be detected");
    assertTrue(resultRight.newVx < 0, "Reflected vx must be negative");

    // Test Angle Deflection mapping
    const diskAngled = { x: -20, y: 270, vx: -100, vy: 0, radius: 10 };
    const resultAngled = PhysicsEngine.checkPaddleCCD(diskAngled, 100, 270, leftPaddle, true);
    assertEquals(resultAngled.hit, true);
    assertGreaterThan(resultAngled.hitOffset, 0, "Lower half hit must produce positive hitOffset");
    assertGreaterThan(resultAngled.newVy, 0, "Lower half hit must deflect downward (positive vy)");
  });

  // Test 4: Neon Duel randomized fuzzing achieves 0.00% tunneling rate
  suite.test("SimulationBot.fuzzNeonDuelPaddleCollisions() verifies 0.00% tunneling anomaly rate", () => {
    const fuzzResult = SimulationBot.fuzzNeonDuelPaddleCollisions(1000);
    assertEquals(fuzzResult.status, "PASS");
    assertEquals(fuzzResult.tunnelingAnomalies, 0);
    assertEquals(fuzzResult.tunnelingRatePercent, 0.0);
    assertEquals(fuzzResult.wallBoundaryBreaches, 0);
    assertGreaterThan(fuzzResult.leftPaddleDeflections + fuzzResult.rightPaddleDeflections, 0);
  });

  // Test 5: Full 100-cycle runner (Cycles 101-200) executes with 100% pass rate
  suite.test("runCycles101To200() executes 100 iterative cycles with 100% pass rate", async () => {
    const cycleRun = await runCycles101To200();
    assertEquals(cycleRun.allPassed, true);
    assertEquals(cycleRun.totalCycles, 100);
    assertEquals(cycleRun.passedCycles, 100);
    assertEquals(cycleRun.failedCycles, 0);
  });

  return suite;
}
