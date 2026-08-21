/**
 * Aegis Arcade Hub - Master 5-Tier Opaque-Box Test Runner
 * 
 * Executes:
 * - Tier 1: Feature Coverage (>=5 tests per feature across all 7 arcade titles:
 *   Kinetic Surge, Gravity Runner, Quantum Turret, Pulse Rhythm, Neon Duel,
 *   Chrono Drift, Void Survivors, plus Audio, Economy, Editor, Routing, Bots).
 * - Tier 2: Boundary & Corner Cases (Extreme speeds, Zero dt, Arena bounds,
 *   200+ swarm spatial hash, Ghost buffer caps, SAT triangle edges, Precision).
 * - Tier 3: Cross-Feature Combinations (Weapons + Swarm, Drift + Turbo + Checkpoints,
 *   Universal Meta-Economy Shard Banking & Season Pass across 7 games, Fleet traits).
 * - Tier 4: Real-World Application Scenarios (2,000-trial Monte Carlo physics sim,
 *   60+ FPS frame benchmark, 5-minute endurance run, Campaign, Sandbox, Ad Vault).
 * - Tier 5: Adversarial Coverage Hardening (Strict 7-bit ASCII & zero mojibake check,
 *   Next.js App Router build integrity, Economy equilibrium, 10k Boss AI stress,
 *   Drafting pool exhaustion, Hypersonic trajectory fuzzing).
 * 
 * Strict ASCII UI formatting: 100% Windows ANSI-1252 Safe.
 */

import { TestSuiteResult } from "./tests/test_framework.ts";

// Tier 1: 7-Cabinet Arcade Master Suite Coverage
import { createKineticSurgeTestSuite } from "./tests/tier1_kinetic_surge.ts";
import { createGravityRunnerTestSuite } from "./tests/tier1_gravity_runner.ts";
import { createQuantumTurretTestSuite } from "./tests/tier1_quantum_turret.ts";
import { createPulseRhythmTestSuite } from "./tests/tier1_pulse_rhythm.ts";
import { createNeonDuelTestSuite } from "./tests/tier1_neon_duel.ts";
import { createChronoDriftTestSuite } from "./tests/tier1_chrono_drift.ts";
import { createVoidSurvivorsTestSuite } from "./tests/tier1_void_survivors.ts";

// Tier 1: Shared Engine & Subsystem Coverage
import { createPhysicsTestSuite } from "../tests/tier1/test_physics.ts";
import { createAudioTestSuite } from "../tests/tier1/test_audio.ts";
import { createEconomyTestSuite } from "../tests/tier1/test_economy.ts";
import { createCabinetsTestSuite } from "../tests/tier1/test_cabinets.ts";
import { createLevelEditorTestSuite } from "../tests/tier1/test_level_editor.ts";
import { createRoutingTestSuite } from "../tests/tier1/test_routing.ts";
import { createSimulationBotsTestSuite } from "../tests/tier1/test_simulation_bots.ts";
import { createCycles101To200TestSuite } from "../tests/tier1/test_cycles_101_200.ts";
import { createCycles201To300TestSuite } from "../tests/tier1/test_cycles_201_300.ts";
import { createTurbopackMemoryQaTestSuite } from "../tests/tier1/test_turbopack_memory_qa.ts";

// Tier 2: Boundaries
import { createBoundariesTestSuite } from "./tests/tier2_boundaries.ts";

// Tier 3: Cross-Feature Combinations
import { createCombinationsTestSuite } from "./tests/tier3_combinations.ts";

// Tier 4: Real-World Scenarios
import { createScenariosTestSuite } from "./tests/tier4_scenarios.ts";

// Tier 5: Adversarial Hardening & Build Integrity
import { createAdversarialTestSuite } from "./tests/tier5_adversarial.ts";
import { createAdversarialChallenger2TestSuite } from "../tests/tier5_adversarial_challenger_2.ts";

async function runMasterTestSuite() {
  console.log("================================================================================");
  console.log("             AEGIS ARCADE HUB - MASTER 5-TIER TEST RUNNER                       ");
  console.log("================================================================================");
  console.log("[INIT] Initializing test suites across all 5 verification tiers...\n");

  const suites = [
    // Tier 1: 7 Cabinets
    createKineticSurgeTestSuite(),
    createGravityRunnerTestSuite(),
    createQuantumTurretTestSuite(),
    createPulseRhythmTestSuite(),
    createNeonDuelTestSuite(),
    createChronoDriftTestSuite(),
    createVoidSurvivorsTestSuite(),

    // Tier 1: Shared Subsystems
    createPhysicsTestSuite(),
    createAudioTestSuite(),
    createEconomyTestSuite(),
    createCabinetsTestSuite(),
    createLevelEditorTestSuite(),
    createRoutingTestSuite(),
    createSimulationBotsTestSuite(),
    createCycles101To200TestSuite(),
    createCycles201To300TestSuite(),
    createTurbopackMemoryQaTestSuite(),

    // Tier 2: Boundary & Corner Cases
    createBoundariesTestSuite(),

    // Tier 3: Cross-Feature Combinations
    createCombinationsTestSuite(),

    // Tier 4: Real-World Scenarios
    createScenariosTestSuite(),

    // Tier 5: Adversarial Hardening & Build Integrity
    createAdversarialTestSuite(),
    createAdversarialChallenger2TestSuite(),
  ];

  const suiteResults: TestSuiteResult[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const startGlobal = performance.now();

  for (const suite of suites) {
    const result = await suite.run();
    suiteResults.push(result);
    totalTests += result.total;
    totalPassed += result.passed;
    totalFailed += result.failed;

    const tierLabel = `[TIER ${result.tier}]`;
    const statusLabel = result.failed === 0 ? "[PASS]" : "[FAIL]";
    console.log(
      `${statusLabel} ${tierLabel} ${result.suiteName} (${result.passed}/${result.total} passed in ${result.durationMs}ms)`
    );

    for (const tc of result.results) {
      const tcStatus = tc.passed ? "  [+] PASS:" : "  [-] FAIL:";
      console.log(`${tcStatus} ${tc.name} (${tc.durationMs}ms)`);
      if (!tc.passed && tc.error) {
        console.log(`      ERROR: ${tc.error}`);
      }
    }
    console.log("");
  }

  const globalDuration = parseFloat((performance.now() - startGlobal).toFixed(2));

  console.log("================================================================================");
  console.log("                             TEST EXECUTION SUMMARY                             ");
  console.log("================================================================================");
  console.log(`Total Verification Tiers:      5 Tiers`);
  console.log(`Total Test Suites:             ${suites.length} Suites`);
  console.log(`Total Test Cases:              ${totalTests} Test Cases`);
  console.log(`Total Assertions Passed:       ${totalPassed}`);
  console.log(`Total Assertions Failed:       ${totalFailed}`);
  console.log(`Overall Pass Rate:             ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log(`Total Execution Time:          ${globalDuration}ms`);
  console.log("--------------------------------------------------------------------------------");

  // Tier breakdown summary
  const tierMap = new Map<number, { total: number; passed: number; failed: number }>();
  for (const r of suiteResults) {
    const entry = tierMap.get(r.tier) || { total: 0, passed: 0, failed: 0 };
    entry.total += r.total;
    entry.passed += r.passed;
    entry.failed += r.failed;
    tierMap.set(r.tier, entry);
  }

  for (const [tier, data] of tierMap.entries()) {
    const tierName =
      tier === 1
        ? "Tier 1: Feature Coverage (7 Cabinets: Kinetic, Runner, Turret, Pulse, Duel, Drift, Void + Systems)"
        : tier === 2
        ? "Tier 2: Boundary & Corner Cases (Extreme Speeds, Zero dt, Clamps, 200+ Swarm, Ghost Caps, SAT)"
        : tier === 3
        ? "Tier 3: Cross-Feature Combinations (Weapons + Swarm, Drift + Turbo + Gates, Meta-Economy 7 Games)"
        : tier === 4
        ? "Tier 4: Real-World Scenarios (2000-Trial Sim, 60 FPS Bench, 5-Min Endurance, Multi-Sector, Ad Vault)"
        : "Tier 5: Adversarial Hardening (ASCII Mojibake Scan, Route Integrity, Economy Equilibrium, 10k Boss AI)";
    console.log(`  Tier ${tier} -> ${data.passed}/${data.total} passed (${((data.passed / data.total) * 100).toFixed(1)}%) | ${tierName}`);
  }

  console.log("================================================================================");

  if (totalFailed > 0) {
    console.log(`\n[RESULT] TEST RUN FAILED: ${totalFailed} test failure(s) detected.`);
    process.exit(1);
  } else {
    console.log("\n[RESULT] ALL 5 TIERS PASSED WITH 100% SUCCESS RATE. SYSTEM FULLY VERIFIED.");
    process.exit(0);
  }
}

runMasterTestSuite().catch((err) => {
  console.error("[FATAL] Unhandled test runner error:", err);
  process.exit(1);
});
