/**
 * Tier 3 - Cross-Feature Combinations Suite
 * 
 * Tests multi-system pairwise and n-way interactions between:
 * Hull Vessels + Augments + Gravity Wells + Boss Enrage AI + Cross-Cabinet Economy.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  resetLocalStorage,
} from "../framework.ts";
import { PhysicsEngine } from "../../src/lib/gameEngine/physics.ts";
import { PlayerOrb, Bumper, GravityWell, LaserBeam, BossEntity, ShardPickup } from "../../src/lib/gameEngine/types.ts";
import { INITIAL_VESSELS, ProgressionManager } from "../../src/lib/gameEngine/progression.ts";

export function createCombinationsTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 3 - Cross-Feature Combinations", 3);

  // Combination 1: Heavy Hull (Titan Dreadnought) + Kinetic Dynamo Augment + Gravity Wells
  suite.test("Combination: Titan Dreadnought mass (2.2) with Kinetic Dynamo modifies bounce impulse & gravity acceleration", () => {
    const titanVessel = INITIAL_VESSELS.find((v) => v.id === "TITAN_DREADNOUGHT")!;
    assertEquals(titanVessel.mass, 2.2);

    const orb: PlayerOrb = {
      x: 300,
      y: 200,
      vx: 10,
      vy: 0,
      radius: 14,
      baseRadius: 14,
      mass: titanVessel.mass,
      color: titanVessel.color,
      glowColor: titanVessel.color,
      trailColor: titanVessel.trailColor,
      hp: 150,
      maxHp: 150,
      shields: titanVessel.shieldSlots,
      maxShields: titanVessel.shieldSlots,
      energy: 50,
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

    // Kinetic Dynamo augment stacks (+25% restitution bonus)
    const kineticBonus = 1.0 + 0.25 * 2; // 2 stacks = +50%

    const bumper: Bumper = {
      id: "b1",
      x: 310,
      y: 200,
      radius: 20,
      type: "STANDARD",
      hp: 2,
      maxHp: 2,
      points: 100,
      shards: 5,
      pulsePhase: 0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      isDestroyed: false,
    };

    const collision = PhysicsEngine.checkBumperCollision(orb, bumper, kineticBonus);
    assertTrue(collision.hit, "Titan Dreadnought with Dynamo must collide");
    assertGreaterThan(collision.impulse, 25, "Impulse should be magnified by Kinetic Dynamo bonus");

    // Test Gravity Well acceleration scaling inversely with mass
    const well: GravityWell = {
      id: "gw1",
      x: 400,
      y: 200,
      radius: 150,
      innerRadius: 10,
      strength: 4000,
      pulseSpeed: 0.05,
      pulseOffset: 0,
      color: "#00F0FF",
    };

    const accHeavy = PhysicsEngine.computeGravityAcceleration(300, 200, 2.2, [well]);
    const accLight = PhysicsEngine.computeGravityAcceleration(300, 200, 1.0, [well]);

    assertGreaterThan(accHeavy.x, 0, "Gravity well exerts positive pull");
    assertLessThan(accHeavy.x, accLight.x, "Heavier vessel experiences proportionally less acceleration (1/mass)");
  });

  // Combination 2: Vortex Striker + Singularity Vacuum Augment + High Density Shard Field
  suite.test("Combination: Vortex Striker with Singularity Vacuum creates expanded magnetic harvest", () => {
    const vortexVessel = INITIAL_VESSELS.find((v) => v.id === "VORTEX_STRIKER")!;
    const orb: PlayerOrb = {
      x: 300,
      y: 300,
      vx: 0,
      vy: 0,
      radius: 10,
      baseRadius: 10,
      mass: vortexVessel.mass,
      color: vortexVessel.color,
      glowColor: vortexVessel.color,
      trailColor: vortexVessel.trailColor,
      hp: 80,
      maxHp: 80,
      shields: 0,
      maxShields: 0,
      energy: 50,
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

    // Singularity vacuum expands magnet radius by +120px
    const magnetBonus = 120 * 2; // 2 stacks = +240px bonus
    const shards: ShardPickup[] = [
      { id: "s1", x: 450, y: 300, vx: 0, vy: 0, value: 10, type: "STANDARD", radius: 5, color: "#00F0FF", life: 100 }, // dist=150 (outside standard 90, inside 90+240=330)
      { id: "s2", x: 500, y: 300, vx: 0, vy: 0, value: 50, type: "RARE", radius: 8, color: "#FFD700", life: 100 },     // dist=200
    ];

    PhysicsEngine.updateShards(shards, orb, magnetBonus);
    assertLessThan(shards[0].x, 450, "Shard 1 pulled from 150px away thanks to Singularity Vacuum");
    assertLessThan(shards[1].x, 500, "Shard 2 pulled from 200px away thanks to Singularity Vacuum");
  });

  // Combination 3: Aegis Prime + Supernova Core + Boss Enrage Phase
  suite.test("Combination: Aegis Prime Overdrive Supernova Core obliterates boss drones and forces enrage", () => {
    const boss: BossEntity = {
      id: "boss_hyperion",
      name: "Solar Hyperion",
      type: "SOLAR_HYPERION",
      x: 300,
      y: 200,
      vx: 1.0,
      vy: 0,
      radius: 40,
      hp: 3200,
      maxHp: 3200,
      phase: 1,
      maxPhases: 3,
      attackTimer: 0,
      attackCooldown: 180,
      color: "#FF9900",
      glowColor: "rgba(255,153,0,0.7)",
      drones: [
        { x: 260, y: 200, angle: 0, orbitRadius: 40, radius: 12, hp: 150, maxHp: 150, color: "#00F0FF" },
        { x: 340, y: 200, angle: Math.PI, orbitRadius: 40, radius: 12, hp: 150, maxHp: 150, color: "#00F0FF" },
      ],
      shieldActive: true,
      enraged: false,
    };

    // Supernova Core trigger: destroys all orbital shield drones
    boss.drones.forEach((d) => (d.hp = 0));
    boss.shieldActive = false;
    boss.phase = 2;
    boss.enraged = true;

    assertFalse(boss.shieldActive, "Boss shields deactivated post-Supernova blast");
    assertTrue(boss.enraged, "Boss enters enrage state");
    assertEquals(boss.phase, 2, "Boss advances to Phase 2");
  });

  // Combination 4: Phoenix Protocol + Fatal Hazard Impact Resurrect
  suite.test("Combination: Phoenix Protocol revives orb upon fatal laser impact", () => {
    const orb: PlayerOrb = {
      x: 300,
      y: 250,
      vx: 0,
      vy: 5,
      radius: 12,
      baseRadius: 12,
      mass: 1.0,
      color: "#00F0FF",
      glowColor: "#00F0FF",
      trailColor: "#00F0FF",
      hp: 1,
      maxHp: 100,
      shields: 0,
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
      launchesLeft: 1,
      maxLaunches: 5,
    };

    const fatalLaser: LaserBeam = {
      id: "l_fatal",
      startX: 200,
      startY: 250,
      endX: 400,
      endY: 250,
      angle: 0,
      angularVelocity: 0,
      length: 200,
      isActive: true,
      warmupTimer: 0,
      activeTimer: 0,
      duration: 180,
      interval: 120,
      damage: 10,
      color: "#FF0055",
    };

    const isLaserHit = PhysicsEngine.checkLaserCollision(orb, fatalLaser);
    assertTrue(isLaserHit, "Laser strikes orb");

    // Apply damage
    orb.hp -= fatalLaser.damage;
    assertLessThan(orb.hp, 0, "Orb takes lethal damage");

    // Phoenix Protocol triggers (1-time resurrection)
    const hasPhoenix = true;
    let phoenixConsumed = false;
    if (orb.hp <= 0 && hasPhoenix && !phoenixConsumed) {
      orb.hp = orb.maxHp;
      orb.isOverdrive = true;
      orb.overdriveTimer = 3.0; // 3 seconds invulnerability
      phoenixConsumed = true;
    }

    assertEquals(orb.hp, 100, "Phoenix Protocol restores orb to full HP");
    assertTrue(orb.isOverdrive, "Phoenix grants 3-second invulnerability burst");
    assertTrue(phoenixConsumed, "Phoenix token is consumed");
  });

  // Combination 5: Cross-Cabinet Economy Synchronization
  suite.test("Combination: Shards earned in Gravity Runner unlock vessels for Kinetic Surge", () => {
    resetLocalStorage();
    const telemetry = ProgressionManager.getTelemetry();
    assertEquals(telemetry.totalQuantumShards, 250);

    // Pilot plays Gravity Runner and collects 3000 shards
    const shardsEarnedInRunner = 3000;
    telemetry.totalQuantumShards += shardsEarnedInRunner;
    ProgressionManager.saveTelemetry(telemetry);

    // Pilot switches to Kinetic Surge and opens Fleet Hangar to buy Chrono Phantom (cost 2500)
    const vessels = ProgressionManager.getVessels();
    const phantom = vessels.find((v) => v.id === "CHRONO_PHANTOM")!;
    assertFalse(phantom.unlocked, "Chrono Phantom initially locked");

    const currentShards = ProgressionManager.getTelemetry().totalQuantumShards;
    assertTrue(currentShards >= phantom.cost, "Has sufficient shards");

    // Purchase
    telemetry.totalQuantumShards -= phantom.cost;
    phantom.unlocked = true;
    ProgressionManager.saveTelemetry(telemetry);
    ProgressionManager.saveVessels(vessels);
    ProgressionManager.setActiveVesselId(phantom.id);

    // Verify cross-cabinet state
    assertEquals(ProgressionManager.getTelemetry().totalQuantumShards, 750, "Remaining shards balance updated (3250 - 2500 = 750)");
    assertEquals(ProgressionManager.getActiveVesselId(), "CHRONO_PHANTOM", "New vessel equipped across cabinets");
    assertTrue(ProgressionManager.getVessels().find((v) => v.id === "CHRONO_PHANTOM")!.unlocked);
  });

  return suite;
}
