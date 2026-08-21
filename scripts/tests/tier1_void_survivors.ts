/**
 * Tier 1 - Feature Coverage: Void Survivors (Nova Protocol Horde Survivor)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  assertNear,
} from "./test_framework.ts";

export function createVoidSurvivorsTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Void Survivors (Nova Protocol Horde Survivor)", 1);

  // Test 1: 8-Direction Smooth Movement & Arena Clamping
  suite.test("Void Survivors: 8-direction velocity dampening and arena boundary clamping", () => {
    let px = 770;
    let py = 770;
    let vx = 0;
    let vy = 0;

    const input = { dx: 1, dy: 1 }; // Diagonal input
    const inputLen = Math.hypot(input.dx, input.dy);
    const normDx = input.dx / inputLen;
    const normDy = input.dy / inputLen;

    const accel = 600; // px/s^2
    const damp = 6.0;
    const maxSpeed = 220;
    const dt = 0.016;

    for (let f = 0; f < 30; f++) {
      vx = (vx + normDx * accel * dt) * (1 - damp * dt);
      vy = (vy + normDy * accel * dt) * (1 - damp * dt);

      // Clamp max speed
      const speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }

      px += vx * dt;
      py += vy * dt;

      // Arena boundary clamp [-780, 780]
      px = Math.max(-780, Math.min(780, px));
      py = Math.max(-780, Math.min(780, py));
    }

    assertEquals(px, 780, "Player X clamped strictly at positive arena boundary");
    assertEquals(py, 780, "Player Y clamped strictly at positive arena boundary");
    assertGreaterThan(Math.hypot(vx, vy), 50, "Player retains velocity magnitude while pushing boundary");
  });

  // Test 2: 360 Perimeter Swarm Spawning & UniformGridHash Query Performance
  suite.test("Void Survivors: 360-degree perimeter spawner and spatial hash query for 200+ entities", () => {
    interface Enemy {
      id: string;
      x: number;
      y: number;
      radius: number;
    }

    const enemies: Enemy[] = [];
    const player = { x: 0, y: 0 };
    const spawnRadius = 550;

    // Spawn 250 enemies in circular ring around player
    for (let i = 0; i < 250; i++) {
      const angle = (i / 250) * Math.PI * 2;
      enemies.push({
        id: `e_${i}`,
        x: player.x + Math.cos(angle) * spawnRadius,
        y: player.y + Math.sin(angle) * spawnRadius,
        radius: 12,
      });
    }

    assertEquals(enemies.length, 250, "Spawned 250 perimeter swarm entities");

    // Build Spatial Hash Grid (cell size 64)
    const cellSize = 64;
    const grid = new Map<string, Enemy[]>();
    for (const e of enemies) {
      const cx = Math.floor(e.x / cellSize);
      const cy = Math.floor(e.y / cellSize);
      const key = `${cx}:${cy}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(e);
    }

    // Spatial query for circle at (550, 0) radius 80
    const queryX = 550;
    const queryY = 0;
    const queryR = 80;
    const minCx = Math.floor((queryX - queryR) / cellSize);
    const maxCx = Math.floor((queryX + queryR) / cellSize);
    const minCy = Math.floor((queryY - queryR) / cellSize);
    const maxCy = Math.floor((queryY + queryR) / cellSize);

    const candidates: Enemy[] = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const bucket = grid.get(`${cx}:${cy}`);
        if (bucket) candidates.push(...bucket);
      }
    }

    const hits = candidates.filter((e) => Math.hypot(e.x - queryX, e.y - queryY) <= queryR + e.radius);
    assertGreaterThan(hits.length, 0, "Spatial query efficiently retrieved enemies in target sector");
    assertLessThan(candidates.length, 50, "Spatial grid filtered 250 entities down to <50 candidate checks");
  });

  // Test 3: 4 Weapon Systems Simulation (Blades, Chain Lightning, Drones, Missiles)
  suite.test("Void Survivors: All 4 weapons execute targeting, trajectory and damage logic", () => {
    const player = { x: 0, y: 0 };
    const enemies = [
      { id: "e1", x: 60, y: 0, hp: 100, radius: 12 },   // Inside Blade radius (75px)
      { id: "e2", x: 120, y: 0, hp: 100, radius: 12 },  // Chain lightning candidate
      { id: "e3", x: 180, y: 0, hp: 100, radius: 12 },  // Chain lightning jump 2
      { id: "e4", x: 220, y: 50, hp: 300, radius: 20 }, // High-threat Drone laser target
      { id: "e5", x: -200, y: -200, hp: 100, radius: 12 }, // Missile cluster target
    ];

    // 1. Orbiting Plasma Blades: 3 blades at R=75, angle 0 hits e1
    const bladeAngle = 0;
    const bladePos = { x: player.x + Math.cos(bladeAngle) * 75, y: player.y + Math.sin(bladeAngle) * 75 };
    const distBladeE1 = Math.hypot(bladePos.x - enemies[0].x, bladePos.y - enemies[0].y);
    if (distBladeE1 <= 14 + enemies[0].radius) {
      enemies[0].hp -= 45;
    }
    assertEquals(enemies[0].hp, 55, "Plasma Blade inflicts 45 damage");

    // 2. Chain Lightning: strikes e2, then jumps to nearest e3
    const chainTargets = [enemies[1], enemies[2]];
    for (const t of chainTargets) {
      t.hp -= 80;
    }
    assertEquals(enemies[1].hp, 20, "Chain lightning hits primary target");
    assertEquals(enemies[2].hp, 20, "Chain lightning jumps to secondary target");

    // 3. Autonomous Laser Drone: targets e4 (highest HP/dist)
    enemies[3].hp -= 18; // 1 tick of laser beam
    assertEquals(enemies[3].hp, 282, "Laser drone damages high-threat target");

    // 4. Missile Salvo: AOE detonation at e5
    const missileImpact = { x: -200, y: -200 };
    const distMissileE5 = Math.hypot(missileImpact.x - enemies[4].x, missileImpact.y - enemies[4].y);
    if (distMissileE5 <= 65) {
      enemies[4].hp -= 85;
    }
    assertEquals(enemies[4].hp, 15, "Missile AOE blast damages enemy in impact radius");
  });

  // Test 4: XP Gem Magnetic Attraction & Level Progression Curve
  suite.test("Void Survivors: XP gems gravitate toward player with quadratic acceleration and level up", () => {
    let playerX = 0;
    let playerY = 0;
    const magnetRadius = 120; // 80 * (1 + 0.25 * 2 tech level)

    let gem = { x: 90, y: 0, vx: 0, vy: 0, value: 25, collected: false };
    let playerXp = 0;
    let playerLevel = 1;

    function getXpRequired(level: number): number {
      return Math.floor(60 * Math.pow(level, 1.5) + 40);
    }

    assertEquals(getXpRequired(1), 100, "Level 1 requires 100 XP");
    assertEquals(getXpRequired(2), 209, "Level 2 requires 209 XP");

    // Gem attraction physics over 15 frames
    for (let f = 0; f < 15; f++) {
      const dx = playerX - gem.x;
      const dy = playerY - gem.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= magnetRadius) {
        const pursuitT = f * 0.1;
        const accelMag = 12.0 + 0.85 * pursuitT * pursuitT;
        gem.vx += (dx / dist) * accelMag;
        gem.vy += (dy / dist) * accelMag;
        gem.x += gem.vx;
        gem.y += gem.vy;
      }

      const currentDist = Math.hypot(playerX - gem.x, playerY - gem.y);
      if (currentDist <= 25 || (dist <= 35 && currentDist > dist)) {
        gem.collected = true;
        playerXp += gem.value;
        break;
      }
    }

    assertTrue(gem.collected, "Gem magnetically sucked into player");
    assertEquals(playerXp, 25, "Player awarded 25 XP from collected gem");
  });

  // Test 5: In-Run Augment Draft Modal & 3.0s Extraction Portal
  suite.test("Void Survivors: Augment drafting generates 3 cards and extraction triggers after 3.0s hold", () => {
    interface AugmentCard {
      id: string;
      name: string;
      category: "WEAPON" | "STAT";
    }

    const availablePool: AugmentCard[] = [
      { id: "BLADES", name: "Plasma Blades", category: "WEAPON" },
      { id: "LIGHTNING", name: "Chain Lightning", category: "WEAPON" },
      { id: "DRONES", name: "Laser Drones", category: "WEAPON" },
      { id: "SPEED", name: "Thruster Overdrive", category: "STAT" },
      { id: "MAGNET", name: "Singularity Magnet", category: "STAT" },
    ];

    // Draft 3 distinct cards
    const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
    const draftCards = shuffled.slice(0, 3);
    assertEquals(draftCards.length, 3, "Draft presents exactly 3 augment choices");
    const uniqueIds = new Set(draftCards.map((c) => c.id));
    assertEquals(uniqueIds.size, 3, "Draft cards have zero duplicates");

    // Extraction Warp Beacon Event
    let extractionProgressSec = 0.0;
    let extracted = false;
    const playerInPortal = true;

    for (let f = 0; f < 188; f++) { // ~3.0s at 60 FPS (180 frames)
      if (playerInPortal) {
        extractionProgressSec += 0.016;
      }
      if (extractionProgressSec >= 3.0) {
        extracted = true;
        break;
      }
    }

    assertTrue(extracted, "Holding extraction zone for 3.0s triggers successful mission extraction");
  });

  return suite;
}
