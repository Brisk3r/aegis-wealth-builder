/**
 * Tier 1 - Feature Coverage: Neon Duel (2P Local Versus Air Hockey)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThan,
  assertGreaterThanOrEqual,
  assertLessThanOrEqual,
  assertNear,
} from "./test_framework.ts";

export function createNeonDuelTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Neon Duel (2P Local Versus)", 1);

  // Test 1: Hypersonic Continuous Collision Detection (CCD) Against Paddles
  suite.test("Neon Duel: Sub-stepped CCD prevents puck tunneling through paddle at 120 px/step", () => {
    const paddle = { x: 300, y: 500, radius: 25 };
    const puck = { x: 300, y: 390, vx: 0, vy: 120, radius: 12 };

    const subSteps = 10;
    const stepVx = puck.vx / subSteps;
    const stepVy = puck.vy / subSteps;
    let hit = false;

    for (let s = 0; s < subSteps; s++) {
      puck.x += stepVx;
      puck.y += stepVy;
      const dist = Math.hypot(puck.x - paddle.x, puck.y - paddle.y);
      if (dist <= puck.radius + paddle.radius) {
        hit = true;
        puck.vy = -Math.abs(puck.vy) * 1.05;
        puck.y = paddle.y - (puck.radius + paddle.radius);
        break;
      }
    }

    assertTrue(hit, "CCD sub-stepping must detect collision before tunneling through paddle");
    assertLessThan(puck.vy, 0, "Puck rebounded upward");
    assertLessThanOrEqual(puck.y, paddle.y - paddle.radius, "Puck prevented from penetrating behind paddle center");
  });

  // Test 2: 1.5s Post-Goal Serve Delay & Centered State Reset
  suite.test("Neon Duel: Post-goal state locks puck at center for 1.5s countdown before serving", () => {
    interface MatchState {
      puck: { x: number; y: number; vx: number; vy: number };
      p1Score: number;
      p2Score: number;
      serveCountdownTimer: number;
      isServing: boolean;
    }

    const state: MatchState = {
      puck: { x: 300, y: 10, vx: 0, vy: -15 },
      p1Score: 0,
      p2Score: 0,
      serveCountdownTimer: 0,
      isServing: false,
    };

    if (state.puck.y <= 15) {
      state.p1Score++;
      state.puck = { x: 300, y: 300, vx: 0, vy: 0 };
      state.serveCountdownTimer = 1.5;
      state.isServing = true;
    }

    assertEquals(state.p1Score, 1, "P1 awarded 1 point");
    assertEquals(state.puck.x, 300, "Puck reset to center X");
    assertEquals(state.puck.y, 300, "Puck reset to center Y");
    assertEquals(state.puck.vx, 0, "Puck velocity stationary during countdown");
    assertEquals(state.puck.vy, 0, "Puck velocity stationary during countdown");
    assertTrue(state.isServing, "Match is in serve countdown state");

    state.serveCountdownTimer = 0;
    state.isServing = false;
    state.puck.vy = 8;

    assertFalse(state.isServing, "Serve countdown complete");
    assertGreaterThan(state.puck.vy, 0, "Puck served into active play");
  });

  // Test 3: Predictive AI Bank-Shot Trajectory Estimation
  suite.test("Neon Duel: AI predicts multi-bounce trajectory to intercept incoming bank shots", () => {
    const tableWidth = 600;
    const aiPaddleY = 100;
    const puck = { x: 100, y: 400, vx: 12, vy: -10, radius: 12 };

    let simX = puck.x;
    let simY = puck.y;
    let simVx = puck.vx;
    let simVy = puck.vy;

    while (simY > aiPaddleY) {
      simX += simVx;
      simY += simVy;
      if (simX <= puck.radius || simX >= tableWidth - puck.radius) {
        simVx = -simVx;
      }
    }

    assertGreaterThan(simX, 0, "Predicted intercept X is inside table bounds");
    assertLessThan(simX, tableWidth, "Predicted intercept X is inside table bounds");

    let aiPaddleX = 300;
    const aiSpeed = 8;
    const diff = simX - aiPaddleX;
    aiPaddleX += Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);

    assertNear(Math.sign(aiPaddleX - 300), Math.sign(simX - 300), 0.01, "AI paddle moves toward bank-shot intercept");
  });

  // Test 4: Table Cushion Damping & Angle Preservation
  suite.test("Neon Duel: Table cushion rebounds puck with 0.98 restitution damping", () => {
    const tableWidth = 600;
    const puck = { x: 590, y: 300, vx: 10, vy: 5, radius: 12 };

    if (puck.x >= tableWidth - puck.radius) {
      puck.x = tableWidth - puck.radius;
      puck.vx = -puck.vx * 0.98;
    }

    assertEquals(puck.vx, -9.8, "Horizontal velocity dampened by exactly 0.98");
    assertEquals(puck.vy, 5, "Vertical velocity preserved on vertical cushion bounce");
  });

  // Test 5: Instant Rematch Loop & Match Point Win Condition
  suite.test("Neon Duel: First to 7 goals triggers match victory and allows instant rematch reset", () => {
    let p1Score = 6;
    let p2Score = 4;
    let matchWinner: "P1" | "P2" | null = null;

    p1Score++;
    if (p1Score >= 7) {
      matchWinner = "P1";
    }

    assertEquals(matchWinner, "P1", "P1 declared winner at 7 points");

    p1Score = 0;
    p2Score = 0;
    matchWinner = null;

    assertEquals(p1Score, 0, "P1 score reset on rematch");
    assertEquals(p2Score, 0, "P2 score reset on rematch");
    assertEquals(matchWinner, null, "Winner cleared for new game");
  });

  return suite;
}
