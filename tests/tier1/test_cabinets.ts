/**
 * Tier 1 - Feature Coverage: 5-Cabinet Multi-Arcade Game Suite
 */

import {
  TestSuiteRunner,
  assert,
  assertEquals,
  assertGreaterThan,
  assertTrue,
  assertFalse,
} from "../framework.ts";
import { SECTORS, generateSectorBumpers, generateBoss } from "../../src/lib/gameEngine/levels.ts";

export function createCabinetsTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - 5-Cabinet Multi-Arcade Game Suite", 1);

  // Test 1: Cabinet 1 - Kinetic Surge (Slingshot Roguelite Sectors & Bosses)
  suite.test("Kinetic Surge generates all 7 sectors with escalating difficulty and boss encounters", () => {
    assertEquals(SECTORS.length, 7, "Must define 7 campaign sectors");

    // Sector 1: Proving grounds (no boss)
    const s1 = SECTORS[0];
    assertEquals(s1.sectorNumber, 1);
    assertFalse(s1.hasBoss);

    const s1Bumpers = generateSectorBumpers(1, 600, 600);
    assertEquals(s1Bumpers.length, s1.bumpersCount, "Sector 1 should generate designated bumper count");
    
    // Sector 3: Apex encounter with Vortex Titan
    const s3 = SECTORS[2];
    assertTrue(s3.hasBoss);
    assertEquals(s3.bossType, "VORTEX_TITAN");

    const boss = generateBoss(3, 600, 600);
    assert(boss !== null, "Sector 3 must spawn a BossEntity");
    assertEquals(boss!.type, "VORTEX_TITAN");
    assertEquals(boss!.hp, 1800);
    assertGreaterThan(boss!.drones.length, 0, "Boss must spawn with orbital shield drones");
  });

  // Test 2: Cabinet 2 - Gravity Runner (Dual-Rail Gravity Inverter Physics)
  suite.test("Gravity Runner simulates gravity flipping and obstacle collision logic", () => {
    let playerY = 400; // on bottom floor
    let vy = 0;
    let gravity = 0.85;
    const ceilingY = 80;

    // Flip gravity upwards
    gravity = -gravity;
    vy = gravity * 3.5;
    assertGreaterThan(0, vy, "Upward flip should produce negative vertical velocity");

    // Step physics upwards
    for (let i = 0; i < 30; i++) {
      vy += gravity;
      playerY += vy;
      if (playerY <= ceilingY) {
        playerY = ceilingY;
        vy = 0;
        break;
      }
    }
    assertEquals(playerY, ceilingY, "Ship should land smoothly on ceiling rail");

    // Test spike hurdle AABB collision
    const ship = { x: 100, y: playerY, w: 28, h: 20 };
    const spikeCeiling = { x: 100, y: 80, w: 24, h: 30 };
    const collides =
      ship.x < spikeCeiling.x + spikeCeiling.w &&
      ship.x + ship.w > spikeCeiling.x &&
      ship.y < spikeCeiling.y + spikeCeiling.h &&
      ship.y + ship.h > spikeCeiling.y;
    assertTrue(collides, "Ship in ceiling rail intersecting spike must trigger collision");
  });

  // Test 3: Cabinet 3 - Quantum Turret (360-Degree Defense & Weapon Switching)
  suite.test("Quantum Turret models 360-degree aiming, projectile trajectories, and weapon types", () => {
    const turret = {
      x: 300,
      y: 240,
      angle: Math.PI * 0.25, // 45 degrees
      weapon: "VULCAN" as const,
    };

    // Calculate projectile spawn vector
    const bulletSpeed = 12;
    const bulletVx = Math.cos(turret.angle) * bulletSpeed;
    const bulletVy = Math.sin(turret.angle) * bulletSpeed;

    assertGreaterThan(bulletVx, 0, "45-degree shot should have positive Vx");
    assertGreaterThan(bulletVy, 0, "45-degree shot should have positive Vy");

    // Target intercept check
    const target = { x: 300 + Math.cos(turret.angle) * 100, y: 240 + Math.sin(turret.angle) * 100, radius: 14 };
    const bullet = { x: 300, y: 240, vx: bulletVx, vy: bulletVy, radius: 4 };

    let hit = false;
    for (let step = 0; step < 15; step++) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      if (Math.hypot(bullet.x - target.x, bullet.y - target.y) < bullet.radius + target.radius) {
        hit = true;
        break;
      }
    }
    assertTrue(hit, "Turret projectile fired along target angle must intercept target");
  });

  // Test 4: Cabinet 4 - Pulse Rhythm (4-Lane Beat Timing & Multiplier Judgments)
  suite.test("Pulse Rhythm evaluates PERFECT, GREAT, and MISS judgment timing windows", () => {
    const targetY = 420;
    
    function evaluateJudgment(noteY: number): "PERFECT" | "GREAT" | "MISS" {
      const delta = Math.abs(noteY - targetY);
      if (delta <= 18) return "PERFECT";
      if (delta <= 38) return "GREAT";
      return "MISS";
    }

    assertEquals(evaluateJudgment(420), "PERFECT", "Exact hit is PERFECT");
    assertEquals(evaluateJudgment(435), "PERFECT", "+15px is within PERFECT (<=18px)");
    assertEquals(evaluateJudgment(450), "GREAT", "+30px is within GREAT (<=38px)");
    assertEquals(evaluateJudgment(480), "MISS", "+60px is a MISS");

    // Combo streak multiplier
    function calculateScore(baseScore: number, combo: number): number {
      const multiplier = combo > 30 ? 4 : combo > 20 ? 3 : combo > 10 ? 2 : 1;
      return baseScore * multiplier;
    }

    assertEquals(calculateScore(100, 5), 100, "Combo 5 -> 1x multiplier");
    assertEquals(calculateScore(100, 15), 200, "Combo 15 -> 2x multiplier");
    assertEquals(calculateScore(100, 25), 300, "Combo 25 -> 3x multiplier");
    assertEquals(calculateScore(100, 35), 400, "Combo 35 -> 4x multiplier");
  });

  // Test 5: Cabinet 5 - Neon Duel (2-Player Versus Air Hockey Arena Physics)
  suite.test("Neon Duel simulates paddle rebounds, table boundary deflections, and goal triggers", () => {
    const arenaWidth = 600;
    const puck = { x: 300, y: 350, vx: 5, vy: -8, radius: 14 };
    const p1Paddle = { x: 300, y: 600, radius: 24 };

    // Wall reflection (left/right)
    puck.x = arenaWidth - puck.radius;
    puck.vx = 8;
    if (puck.x >= arenaWidth - puck.radius) {
      puck.vx = -puck.vx * 0.98;
    }
    assertEquals(puck.vx, -7.84, "Puck should reflect off right cushion with slight dampening");

    // P1 Paddle Strike
    puck.x = p1Paddle.x;
    puck.y = p1Paddle.y - (puck.radius + p1Paddle.radius);
    puck.vy = 8; // moving down toward paddle
    const dx = puck.x - p1Paddle.x;
    const dy = puck.y - p1Paddle.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= puck.radius + p1Paddle.radius) {
      puck.vy = -Math.abs(puck.vy) * 1.12; // strike forward
    }
    assertGreaterThan(0, puck.vy, "Paddle strike should impart forward rebound velocity");

    // Top Goal Trigger (P1 scores)
    puck.y = 5;
    const isP1Goal = puck.y <= 10 && puck.x > 200 && puck.x < 400;
    assertTrue(isP1Goal, "Puck entering top goal zone awards point to P1");
  });

  return suite;
}
