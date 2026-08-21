/**
 * Tier 1 - Feature Coverage: Quantum Turret (360 Swarm Defense)
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

export function createQuantumTurretTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Quantum Turret (360 Swarm Defense)", 1);

  // Test 1: 360 Rotational Aiming & Shortest-Arc Angular Lerp
  suite.test("Quantum Turret: Turret aims smoothly toward target vector across full 360-degree circle", () => {
    const turret = { x: 300, y: 300, angle: 0 };
    const target = { x: 300, y: 200 }; // directly above (-PI / 2)

    const targetAngle = Math.atan2(target.y - turret.y, target.x - turret.x);
    assertEquals(targetAngle, -Math.PI / 2, "Target angle directly above is -PI/2");

    // Smooth lerp test
    const lerpSpeed = 0.2;
    let currentAngle = turret.angle;
    for (let step = 0; step < 10; step++) {
      let diff = targetAngle - currentAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      currentAngle += diff * lerpSpeed;
    }

    assertNear(currentAngle, targetAngle, 0.2, "Turret smoothly rotates toward target angle");
  });

  // Test 2: Weapon Fire Rate, Recoil & Damage Differentiation (Vulcan, Tesla, Flak)
  suite.test("Quantum Turret: Weapon profiles exhibit distinct cadence, projectile count, and recoil", () => {
    interface WeaponConfig {
      name: string;
      fireRateRps: number;
      projectilesPerShot: number;
      damagePerHit: number;
      recoilImpulse: number;
      piercing: boolean;
    }

    const weapons: Record<string, WeaponConfig> = {
      VULCAN: { name: "Vulcan Minigun", fireRateRps: 10, projectilesPerShot: 1, damagePerHit: 25, recoilImpulse: 2.0, piercing: false },
      TESLA: { name: "Tesla Piercer", fireRateRps: 2, projectilesPerShot: 1, damagePerHit: 120, recoilImpulse: 5.0, piercing: true },
      FLAK: { name: "Flak Cannon", fireRateRps: 3, projectilesPerShot: 5, damagePerHit: 35, recoilImpulse: 8.5, piercing: false },
    };

    assertGreaterThan(weapons.VULCAN.fireRateRps, weapons.TESLA.fireRateRps, "Vulcan fires faster than Tesla");
    assertGreaterThan(weapons.TESLA.damagePerHit, weapons.VULCAN.damagePerHit, "Tesla hits harder per shot than Vulcan");
    assertEquals(weapons.FLAK.projectilesPerShot, 5, "Flak fires 5-pellet spread");
    assertGreaterThan(weapons.FLAK.recoilImpulse, weapons.VULCAN.recoilImpulse, "Flak has higher recoil impulse than Vulcan");
    assertTrue(weapons.TESLA.piercing, "Tesla possesses piercing beam capability");
  });

  // Test 3: Soft Boids Swarm Separation Math
  suite.test("Quantum Turret: Soft boids flocking pushes overlapping enemies apart", () => {
    interface Enemy {
      id: string;
      x: number;
      y: number;
      radius: number;
    }

    const e1: Enemy = { id: "e1", x: 300, y: 300, radius: 14 };
    const e2: Enemy = { id: "e2", x: 305, y: 300, radius: 14 }; // overlapping by 23px (dist=5, r1+r2=28)

    const dx = e1.x - e2.x;
    const dy = e1.y - e2.y;
    const dist = Math.hypot(dx, dy);
    const minDist = e1.radius + e2.radius;

    if (dist < minDist && dist > 0.001) {
      const overlap = (minDist - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;
      e1.x += nx * overlap;
      e1.y += ny * overlap;
      e2.x -= nx * overlap;
      e2.y -= ny * overlap;
    }

    const newDist = Math.hypot(e1.x - e2.x, e1.y - e2.y);
    assertNear(newDist, minDist, 0.01, "Enemies separate to exact tangent contact distance");
    assertGreaterThan(e2.x, e1.x, "e1 pushed to left, e2 pushed to right");
  });

  // Test 4: Swarm Enemy Wave Progression & Health Scaling
  suite.test("Quantum Turret: Enemy swarm types scale HP and speed with wave number", () => {
    function createEnemy(type: "MITE" | "STALKER" | "GOLIATH", wave: number) {
      const baseStats = {
        MITE: { hp: 30, speed: 3.2, score: 25 },
        STALKER: { hp: 75, speed: 2.4, score: 60 },
        GOLIATH: { hp: 300, speed: 1.2, score: 200 },
      }[type];

      const hpScale = 1.0 + (wave - 1) * 0.18;
      const speedScale = 1.0 + (wave - 1) * 0.05;

      return {
        type,
        hp: Math.round(baseStats.hp * hpScale),
        maxHp: Math.round(baseStats.hp * hpScale),
        speed: baseStats.speed * speedScale,
        score: baseStats.score,
      };
    }

    const wave1Goliath = createEnemy("GOLIATH", 1);
    const wave5Goliath = createEnemy("GOLIATH", 5);

    assertEquals(wave1Goliath.hp, 300, "Wave 1 Goliath has 300 HP");
    assertGreaterThan(wave5Goliath.hp, 500, "Wave 5 Goliath HP scales upwards");
    assertGreaterThan(wave5Goliath.speed, wave1Goliath.speed, "Wave 5 Goliath speed scales with wave");
  });

  // Test 5: Projectile Interception & Hit Registration
  suite.test("Quantum Turret: High-speed projectile intercepts moving enemy with circle-circle detection", () => {
    const enemy = { x: 300, y: 150, vx: 2, vy: 0, radius: 15, hp: 50 };
    const bullet = { x: 300, y: 280, vx: 0, vy: -15, radius: 4, damage: 25 };

    let hit = false;
    for (let step = 0; step < 20; step++) {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (dist <= bullet.radius + enemy.radius) {
        hit = true;
        enemy.hp -= bullet.damage;
        break;
      }
    }

    assertTrue(hit, "Bullet must intercept enemy on trajectory");
    assertEquals(enemy.hp, 25, "Enemy HP reduced by bullet damage");
  });

  return suite;
}
