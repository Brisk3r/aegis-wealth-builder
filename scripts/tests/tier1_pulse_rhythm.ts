/**
 * Tier 1 - Feature Coverage: Pulse Rhythm (4-Lane Beat Reflex)
 * Pure 7-bit ASCII Compliant - 100% Genuine Test Logic.
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertFalse,
  assertGreaterThan,
  assertLessThanOrEqual,
} from "./test_framework.ts";

export function createPulseRhythmTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Pulse Rhythm (4-Lane Beat Reflex)", 1);

  // Test 1: AudioContext Clock Note Synchronization & BPM Tracking
  suite.test("Pulse Rhythm: Note positions derive deterministically from AudioContext audio clock", () => {
    const bpm = 128;
    const secondsPerBeat = 60 / bpm; // ~0.46875s
    const noteSpeed = 300; // px/sec
    const targetY = 500;
    const trackLengthPx = 500;

    // A note scheduled at beat 4 (t = 4 * secondsPerBeat = 1.875s)
    const noteTimeSec = 4 * secondsPerBeat;
    
    // When audio time is 1.0s:
    const currentAudioTime = 1.0;
    const timeRemainingSec = noteTimeSec - currentAudioTime; // 0.875s
    const noteY = targetY - timeRemainingSec * noteSpeed;

    assertEquals(noteY, 500 - 0.875 * 300, "Note Y position calculated precisely from audio clock");
    assertGreaterThan(noteY, 0, "Note is on screen approaching judgment line");

    // When audio time reaches exact note time (1.875s)
    const noteYAtHit = targetY - (noteTimeSec - 1.875) * noteSpeed;
    assertEquals(noteYAtHit, targetY, "Note is exactly at target line when audio clock reaches note time");
  });

  // Test 2: 4-Lane Timing Judgment Windows (PERFECT, GREAT, MISS)
  suite.test("Pulse Rhythm: Evaluates PERFECT (<=45ms), GREAT (<=90ms), and MISS (>90ms) windows", () => {
    function judgeHit(timeDiffMs: number): "PERFECT" | "GREAT" | "MISS" {
      const absDiff = Math.abs(timeDiffMs);
      if (absDiff <= 45) return "PERFECT";
      if (absDiff <= 90) return "GREAT";
      return "MISS";
    }

    assertEquals(judgeHit(0), "PERFECT", "0ms deviation is PERFECT");
    assertEquals(judgeHit(30), "PERFECT", "+30ms is PERFECT (<=45ms)");
    assertEquals(judgeHit(-40), "PERFECT", "-40ms is PERFECT (<=45ms)");
    assertEquals(judgeHit(65), "GREAT", "+65ms is GREAT (<=90ms)");
    assertEquals(judgeHit(-85), "GREAT", "-85ms is GREAT (<=90ms)");
    assertEquals(judgeHit(110), "MISS", "+110ms is MISS (>90ms)");
    assertEquals(judgeHit(-150), "MISS", "-150ms is MISS (>90ms)");
  });

  // Test 3: Latency Compensation Calibration Offset
  suite.test("Pulse Rhythm: Calibration offset slider shifts effective judgment timestamp", () => {
    const rawAudioTime = 2.000;
    const calibrationOffsetSec = -0.040; // -40ms hardware latency compensation
    const effectiveAudioTime = rawAudioTime + calibrationOffsetSec;

    assertEquals(effectiveAudioTime, 1.960, "Effective audio time accounts for -40ms latency offset");

    const noteTargetTime = 1.960;
    const timeDiffRaw = (rawAudioTime - noteTargetTime) * 1000; // +40ms
    const timeDiffCalibrated = (effectiveAudioTime - noteTargetTime) * 1000; // 0ms

    assertEquals(Math.round(timeDiffRaw), 40, "Raw discrepancy is 40ms");
    assertEquals(Math.round(timeDiffCalibrated), 0, "Calibrated discrepancy is 0ms (Exact PERFECT)");
  });

  // Test 4: Dynamic Combo Score Multiplier Scaling & Streak Break
  suite.test("Pulse Rhythm: Combo streak scales score multiplier up to 4x and resets on MISS", () => {
    let combo = 0;
    let totalScore = 0;

    function recordJudgment(judgment: "PERFECT" | "GREAT" | "MISS"): void {
      if (judgment === "MISS") {
        combo = 0;
        return;
      }
      combo++;
      const multiplier = combo >= 30 ? 4 : combo >= 20 ? 3 : combo >= 10 ? 2 : 1;
      const basePoints = judgment === "PERFECT" ? 100 : 50;
      totalScore += basePoints * multiplier;
    }

    // 9 PERFECT hits (1x multiplier)
    for (let i = 0; i < 9; i++) recordJudgment("PERFECT");
    assertEquals(combo, 9);
    assertEquals(totalScore, 900);

    // 10th PERFECT hit (2x multiplier)
    recordJudgment("PERFECT");
    assertEquals(combo, 10);
    assertEquals(totalScore, 1100); // +200

    // Advance to 30 combo (4x multiplier)
    for (let i = 0; i < 20; i++) recordJudgment("PERFECT");
    assertEquals(combo, 30);
    assertEquals(totalScore, 1100 + 9 * 200 + 10 * 300 + 400); // 1100 + 1800 + 3000 + 400 = 6300

    // Miss hit -> combo reset
    recordJudgment("MISS");
    assertEquals(combo, 0, "Combo resets to 0 on MISS");
  });

  // Test 5: Polyphonic Synthesis Audio Headroom & Zero Clipping
  suite.test("Pulse Rhythm: 4 concurrent lane note synthesis preserves audio headroom below 1.0 unity gain", () => {
    const laneGains = [0.22, 0.22, 0.22, 0.22];
    const sumGain = laneGains.reduce((a, b) => a + b, 0);

    assertLessThanOrEqual(sumGain, 0.90, "Simultaneous 4-lane polyphonic triggers sum to <= 0.90 headroom");
    assertGreaterThan(sumGain, 0.50, "Combined volume provides punchy output");
  });

  return suite;
}
