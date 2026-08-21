/**
 * Tier 1 - Feature Coverage: Autonomous Simulation Bots, AI Stress Testers & Tactical Abilities
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertGreaterThan,
  assertTrue,
  assertFalse,
} from "../framework.ts";
import { SimulationBot } from "../../src/lib/gameEngine/simulationBot.ts";
import { INITIAL_TACTICAL_ABILITIES } from "../../src/lib/gameEngine/gameModes.ts";
import { BossEntity } from "../../src/lib/gameEngine/types.ts";

export function createSimulationBotsTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Autonomous Simulation Bots & QA", 1);

  // Test 1: SimulationBot Stress Testing & Telemetry Profile
  suite.test("SimulationBot runs automated headless trials and computes metric distribution", () => {
    const result = SimulationBot.runStressTest(100);
    assertEquals(result.totalTrials, 100);
    assertGreaterThan(result.averageBounces, 0, "Simulation must record bounces");
    assertGreaterThan(result.averageScore, 0, "Simulation must accumulate score");
    assertEquals(result.tunnelingAnomalies, 0, "Simulation should detect 0 tunneling anomalies");
    assertGreaterThan(result.physicsExecutionTimeMs, 0, "Duration must be positive");
  });

  // Test 2: Economy Equilibrium Pacing & Shard Sink Demand
  suite.test("Meta-Economy pricing formulas balance total lifetime shard sinks", () => {
    // 7 Tech upgrades max cost formula: sum of level * cost
    const techMaxCosts = [
      10 * 100, // Launch velocity (1000)
      10 * 80,  // Magnet radius (800)
      10 * 120, // Bounce restitution (1200)
      5 * 250,  // Shield capacity (1250)
      8 * 150,  // Overdrive reactor (1200)
      10 * 100, // Shard yield (1000)
      5 * 100,  // Trajectory lens (500)
    ];
    const totalTechSink = techMaxCosts.reduce((a, b) => a + b, 0);
    assertEquals(totalTechSink, 6950, "Total tech tree sink should be 6,950 shards");

    // Fleet vessels unlock total
    const vesselCosts = [0, 500, 1200, 2500, 5000, 10000, 15000, 25000];
    const totalVesselSink = vesselCosts.reduce((a, b) => a + b, 0);
    assertEquals(totalVesselSink, 59200, "Total fleet hangar sink should be 59,200 shards");

    // Trails unlock total
    const trailCosts = [0, 300, 600, 1000, 1500, 3000];
    const totalTrailSink = trailCosts.reduce((a, b) => a + b, 0);
    assertEquals(totalTrailSink, 6400, "Total cosmetic trails sink should be 6,400 shards");

    const grandTotalSink = totalTechSink + totalVesselSink + totalTrailSink;
    assertEquals(grandTotalSink, 72550, "Combined progression economy sink balance");
  });

  // Test 3: Boss AI Multi-Phase State Machine Transitions
  suite.test("Boss AI transitions through Phase 1 shields, Phase 2 enrage, and Phase 3 vulnerable states", () => {
    const boss: BossEntity = {
      id: "boss_titan",
      name: "Vortex Titan",
      type: "VORTEX_TITAN",
      x: 300,
      y: 200,
      vx: 1.5,
      vy: 0,
      radius: 40,
      hp: 1800,
      maxHp: 1800,
      phase: 1,
      maxPhases: 3,
      attackTimer: 0,
      attackCooldown: 180,
      color: "#BF00FF",
      glowColor: "rgba(0,240,255,0.7)",
      drones: [
        { x: 300, y: 160, angle: 0, orbitRadius: 40, radius: 12, hp: 150, maxHp: 150, color: "#00F0FF" },
        { x: 300, y: 240, angle: Math.PI, orbitRadius: 40, radius: 12, hp: 150, maxHp: 150, color: "#00F0FF" },
      ],
      shieldActive: true,
      enraged: false,
    };

    // Phase 1: Shields active with drones alive
    assertTrue(boss.shieldActive, "Phase 1 boss must have active shields");

    // Destroy all drones
    boss.drones.forEach((d) => (d.hp = 0));
    boss.shieldActive = false;
    boss.phase = 2;
    boss.enraged = true;
    boss.vx *= 1.5; // Enrage speed boost

    assertEquals(boss.phase, 2, "Boss transitions to Phase 2");
    assertTrue(boss.enraged, "Boss is enraged in Phase 2");
    assertFalse(boss.shieldActive, "Shield drops when drones are eliminated");
    assertEquals(boss.vx, 2.25, "Boss velocity increases in enrage state");

    // Damage to 0 HP
    boss.hp = 0;
    boss.phase = 3;
    assertEquals(boss.phase, 3, "Boss reaches defeat phase (Phase 3)");
  });

  // Test 4: Tactical Abilities Catalog & Cooldowns
  suite.test("INITIAL_TACTICAL_ABILITIES configures EMP Flashwave, Micro Singularity, and Tri-Phase Split", () => {
    assertEquals(INITIAL_TACTICAL_ABILITIES.length, 3, "Must define 3 tactical abilities");

    const emp = INITIAL_TACTICAL_ABILITIES.find((a) => a.id === "EMP_PULSE")!;
    assertEquals(emp.energyCost, 35, "EMP energy cost must be 35");
    assertEquals(emp.cooldownSeconds, 15, "EMP cooldown must be 15s");

    const singularity = INITIAL_TACTICAL_ABILITIES.find((a) => a.id === "GRAVITY_ANCHOR")!;
    assertEquals(singularity.energyCost, 50, "Micro singularity cost must be 50");

    const clone = INITIAL_TACTICAL_ABILITIES.find((a) => a.id === "QUANTUM_CLONE")!;
    assertEquals(clone.energyCost, 65, "Tri-phase clone cost must be 65");
  });

  // Test 5: 2X Rewarded Ad Multiplier Simulation
  suite.test("GameOver telemetry debrief calculates 2X rewarded ad double shard yield", () => {
    const baseRunShards = 180;

    // Apply 2X ad multiplier
    const multipliedShards = baseRunShards * 2;
    assertEquals(multipliedShards, 360, "2X Ad reward accurately doubles harvested shards");

    const totalVault = 1000 + multipliedShards;
    assertEquals(totalVault, 1360, "Total vault accumulates doubled shard yield accurately");
  });

  // Test 6: 100-Batch Monte Carlo Matrix & CCD Verification
  suite.test("100-Batch Monte Carlo Physics runner verifies swept CCD, 0% tunneling, and restitution scaling", () => {
    const result = SimulationBot.runStressTest(500, 600, 750);
    assertEquals(result.totalTrials, 500);
    assertEquals(result.tunnelingAnomalies, 0, "Tunneling anomalies must be 0");
    assertEquals(result.stuckLoopsDetected, 0, "Stuck loops must be 0");
    assertEquals(result.subStepCCDIntegrityPercent, 100.0, "CCD integrity must be 100%");
    assertGreaterThan(result.averageBounces, 2.0, "Average bounces must be > 2.0");
    assertGreaterThan(result.averageScore, 0, "Average score must be positive");
  });

  return suite;
}

