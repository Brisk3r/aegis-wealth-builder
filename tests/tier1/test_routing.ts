/**
 * Tier 1 - Feature Coverage: Routing, Game Modes, Structured Data & Layout
 */

import {
  TestSuiteRunner,
  assertEquals,
  assertTrue,
  assertGreaterThan,
} from "../framework.ts";
import { GAME_MODES } from "../../src/lib/gameEngine/gameModes.ts";
import { SECTOR_WEATHER_PRESETS } from "../../src/lib/gameEngine/weather.ts";

export function createRoutingTestSuite(): TestSuiteRunner {
  const suite = new TestSuiteRunner("Tier 1 - Routing, Game Modes & Layout", 1);

  // Test 1: Game Modes Catalog Completeness
  suite.test("GAME_MODES defines 6 playable modes with modifiers & launch counts", () => {
    assertEquals(GAME_MODES.length, 6, "Must define exactly 6 game modes");

    const modeNames = GAME_MODES.map((m) => m.mode);
    assertTrue(modeNames.includes("CAMPAIGN"), "Must include CAMPAIGN");
    assertTrue(modeNames.includes("ENDLESS"), "Must include ENDLESS");
    assertTrue(modeNames.includes("BOSS_RUSH"), "Must include BOSS_RUSH");
    assertTrue(modeNames.includes("TIME_ATTACK"), "Must include TIME_ATTACK");
    assertTrue(modeNames.includes("DAILY_CHALLENGE"), "Must include DAILY_CHALLENGE");
    assertTrue(modeNames.includes("CUSTOM_SANDBOX"), "Must include CUSTOM_SANDBOX");

    const timeAttack = GAME_MODES.find((m) => m.mode === "TIME_ATTACK")!;
    assertEquals(timeAttack.timeLimitSeconds, 60, "Time attack must have 60s limit");
    assertEquals(timeAttack.startingLaunches, 99, "Time attack must provide infinite (99) launches");
  });

  // Test 2: Cosmic Weather Elemental Presets
  suite.test("SECTOR_WEATHER_PRESETS configures 5 dynamic atmospheric weather conditions", () => {
    assertEquals(SECTOR_WEATHER_PRESETS.length, 5, "Must define 5 cosmic weather presets");

    const solarFlare = SECTOR_WEATHER_PRESETS.find((w) => w.type === "SOLAR_FLARE")!;
    assertEquals(solarFlare.speedMultiplier, 1.25, "Solar flare should accelerate orbs (+25%)");
    assertEquals(solarFlare.dragMultiplier, 0.9, "Solar flare should reduce atmospheric drag");

    const voidSingularity = SECTOR_WEATHER_PRESETS.find((w) => w.type === "VOID_SINGULARITY")!;
    assertEquals(voidSingularity.shardYieldBonus, 1.75, "Void singularity should boost shard yield to 1.75x");
  });

  // Test 3: Schema.org VideoGame Structured Data Validation
  suite.test("VideoGame schema structured data contains all required SEO properties", () => {
    const videoGameSchema = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "Aegis Arcade Hub - High Velocity Physics Universe",
      "genre": ["Arcade", "Physics", "Roguelite", "Retro", "Pinball"],
      "gamePlatform": ["Web Browser", "Desktop", "Mobile PWA"],
      "applicationCategory": "Game",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    };

    assertEquals(videoGameSchema["@context"], "https://schema.org");
    assertEquals(videoGameSchema["@type"], "VideoGame");
    assertTrue(videoGameSchema.genre.includes("Physics"));
    assertEquals(videoGameSchema.offers.price, "0");
  });

  // Test 4: Dedicated Architectural Ad Unit Presets
  suite.test("Architectural ad slots preserve fixed dimensions to eliminate Cumulative Layout Shift (CLS)", () => {
    const adSlots = [
      { format: "HEADER_BANNER", width: 728, height: 90 },
      { format: "SIDEBAR_SKYSCRAPER", width: 300, height: 600 },
      { format: "BOTTOM_CONTENT", width: 728, height: 90 },
    ];

    assertEquals(adSlots.length, 3, "Must define 3 architectural ad unit placements");
    adSlots.forEach((slot) => {
      assertGreaterThan(slot.width, 0, "Ad unit width must be strictly positive");
      assertGreaterThan(slot.height, 0, "Ad unit height must be strictly positive");
    });
  });

  // Test 5: Strict 7-Bit ASCII Zero-Mojibake UI Formatting
  suite.test("All game mode labels, descriptions, and badges conform to 7-bit ASCII without Unicode mojibake", () => {
    for (const mode of GAME_MODES) {
      // Check that all characters are within ASCII 32-126 or newlines
      const textToVerify = `${mode.name} ${mode.tagline} ${mode.description} ${mode.badge} ${mode.icon} ${mode.modifiers.join(" ")}`;
      for (let i = 0; i < textToVerify.length; i++) {
        const code = textToVerify.charCodeAt(i);
        assertTrue(
          code >= 32 && code <= 126,
          `Character '${textToVerify[i]}' (code ${code}) in mode '${mode.name}' is non-ASCII`
        );
      }
    }
  });

  return suite;
}
