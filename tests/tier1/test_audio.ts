/**
 * Tier 1 - Feature Coverage: Procedural Web Audio API & Synthesizers
 */

import {
  TestSuiteRunner,
  assert,
  assertEquals,
  assertNear,
  assertTrue,
  assertGreaterThan,
  setupBrowserEnvironment,
} from "../framework.ts";
import { soundManager } from "../../src/lib/gameEngine/audio.ts";

interface SoundEngineInternal {
  PENTATONIC_SCALE: number[];
  sfxVolume: number;
  musicVolume: number;
  droneNodes: unknown;
}

export function createAudioTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Procedural Web Audio & Synthesizers", 1);

  // Test 1: Pentatonic Scale Calibration (C4 to C7)
  suite.test("SoundEngine calibrates 16 ascending pentatonic frequencies", () => {
    setupBrowserEnvironment();
    soundManager.init();
    const internal = soundManager as unknown as SoundEngineInternal;
    const scale = internal.PENTATONIC_SCALE;
    assertEquals(scale.length, 16, "Must define exactly 16 pentatonic notes (C4 to C7)");
    assertNear(scale[0], 261.63, 0.01, "C4 base note should be 261.63 Hz");
    assertNear(scale[scale.length - 1], 2093.00, 0.01, "C7 peak note should be 2093.00 Hz");

    // Monotonically strictly ascending
    for (let i = 1; i < scale.length; i++) {
      assertGreaterThan(scale[i], scale[i - 1], `Note ${i} must be higher frequency than note ${i - 1}`);
    }
  });

  // Test 2: Master, SFX and Music Volume Gain Clamping
  suite.test("SoundEngine clamps volume ranges within [0.0, 1.0]", () => {
    setupBrowserEnvironment();
    soundManager.init();
    const internal = soundManager as unknown as SoundEngineInternal;
    
    // SFX volume clamping
    soundManager.setSfxVolume(1.5);
    assertEquals(internal.sfxVolume, 1.0, "SFX volume above 1.0 should clamp to 1.0");

    soundManager.setSfxVolume(-0.2);
    assertEquals(internal.sfxVolume, 0.0, "SFX volume below 0.0 should clamp to 0.0");

    soundManager.setSfxVolume(0.75);
    assertEquals(internal.sfxVolume, 0.75, "SFX volume within [0,1] should be set exactly");

    // Music volume clamping
    soundManager.setMusicVolume(2.0);
    assertEquals(internal.musicVolume, 1.0, "Music volume above 1.0 should clamp to 1.0");

    soundManager.setMusicVolume(0.4);
    assertEquals(internal.musicVolume, 0.4, "Music volume set correctly");
  });

  // Test 3: Audio Mute Toggle and State Consistency
  suite.test("SoundEngine toggles mute status and syncs gain", () => {
    setupBrowserEnvironment();
    soundManager.init();
    const initialMuted = soundManager.getMuted();
    
    const toggled1 = soundManager.toggleMute();
    assertEquals(toggled1, !initialMuted, "Mute toggle should invert state");
    assertEquals(soundManager.getMuted(), toggled1, "getMuted() must reflect inverted state");

    const toggled2 = soundManager.toggleMute();
    assertEquals(toggled2, initialMuted, "Second toggle returns to initial state");
    assertEquals(soundManager.getMuted(), initialMuted, "getMuted() matches restored state");
  });

  // Test 4: Procedural Sound Effect Generators
  suite.test("SoundEngine synthesizes launch, bumper, shard, and explosion audio graphs", () => {
    setupBrowserEnvironment();
    soundManager.init();
    
    // Execute all synthesis routines in mock environment
    soundManager.playLaunch(0.8);
    soundManager.playBumperHit(1, "STANDARD");
    soundManager.playBumperHit(5, "BOUNCE_SUPER");
    soundManager.playBumperHit(10, "GOLDEN_CORE");
    soundManager.playBumperHit(15, "PRISM_LASER");
    soundManager.playShardCollect();
    soundManager.playExplosion("SMALL");
    soundManager.playExplosion("MEDIUM");
    soundManager.playExplosion("MASSIVE");
    soundManager.playShieldDeflect();
    soundManager.playOverdriveActivate();
    soundManager.playDraftSelect();
    soundManager.playGameOver();

    assertTrue(true, "All procedural synthesis routines execute cleanly without exceptions");
  });

  // Test 5: Continuous Ambient Binaural Drone Pad Lifecycle
  suite.test("SoundEngine starts and stops continuous ambient binaural drone pad", () => {
    setupBrowserEnvironment();
    soundManager.init();
    const internal = soundManager as unknown as SoundEngineInternal;
    
    soundManager.startAmbientDrone();
    assert(internal.droneNodes !== null, "Ambient drone nodes must be active");

    soundManager.stopAmbientDrone();
    assertEquals(internal.droneNodes, null, "Ambient drone nodes must be cleared to null");
  });

  // Test 6: Web Vibration API Haptic Feedback Pattern Mapping
  suite.test("SoundEngine triggers haptic vibration pulses", () => {
    setupBrowserEnvironment();
    let capturedPattern: number | number[] | null = null;
    const nav = (globalThis as unknown as { navigator?: { vibrate?: (p: number | number[]) => boolean } }).navigator;
    if (nav) {
      nav.vibrate = (pattern: number | number[]): boolean => {
        capturedPattern = pattern;
        return true;
      };
    }

    soundManager.triggerHaptic(25);
    assertEquals(capturedPattern, 25, "Haptic pulse scalar delivered to navigator.vibrate");

    soundManager.triggerHaptic([30, 20, 50]);
    assertEquals(JSON.stringify(capturedPattern), JSON.stringify([30, 20, 50]), "Haptic pulse array delivered");
  });

  return suite;
}
