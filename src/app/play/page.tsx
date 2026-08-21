import React from "react";
import type { Metadata } from "next";
import ArcadeMasterHub from "@/components/arcade/ArcadeMasterHub";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./play.module.css";

export const metadata: Metadata = {
  title: "Aegis Arcade Universe | Kinetic Surge, Gravity Runner & Retro Cabinets",
  description:
    "Play Aegis Arcade Universe. High-precision orbital physics roguelite, gravity-flipping neon runner, 360 turret defense, 4-lane rhythm matrix, and 2P duel arena. Instant browser play, zero install.",
  keywords: [
    "Aegis Arcade",
    "Kinetic Surge",
    "Gravity Runner",
    "Quantum Turret",
    "Pulse Rhythm",
    "Neon Duel",
    "Orbital Slingshot",
    "Free Roguelite Game",
    "Physics Game",
    "Mobile Web Game",
    "HTML5 Arcade",
  ],
  alternates: {
    canonical: "/play",
  },
  openGraph: {
    title: "Aegis Arcade Universe // 5-Cabinet Retro-Futuristic Arcade Suite",
    description: "Launch kinetic vessels through gravity wells, flip gravity at supersonic speeds, and draft roguelite synergies in neon cyberspace.",
    url: "/play",
    siteName: "Aegis Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis Arcade Universe // 5-Cabinet Retro-Futuristic Arcade Suite",
    description: "Launch kinetic vessels through gravity wells, flip gravity at supersonic speeds, and draft roguelite synergies in neon cyberspace.",
  },
};

export default function PlayPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Aegis Arcade Universe",
    alternateName: "Aegis Arcade Hub",
    description: "High-precision orbital physics roguelite, gravity-flipping runner, 360 turret defense, rhythm matrix, and 2P duel arcade suite.",
    genre: ["Roguelite", "Physics Arcade", "Action", "Runner", "Rhythm", "Versus"],
    gamePlatform: ["Web Browser", "Mobile Browser", "Desktop HTML5", "PWA Standalone"],
    applicationCategory: "Game",
    operatingSystem: "All modern web browsers (Chrome, Firefox, Safari, Edge)",
    inLanguage: "en-US",
    playMode: ["SinglePlayer", "MultiPlayer", "CoOp"],
    numberOfPlayers: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Organization",
      name: "Aegis Hub",
    },
    publisher: {
      "@type": "Organization",
      name: "Aegis Hub",
    },
  };

  return (
    <div className={styles.playPageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Architectural Ad Unit */}
      <div className={styles.headerAdSlot}>
        <AdSlot type="banner" />
      </div>

      {/* Flagship Game Hero Intro */}
      <div className={styles.gameHeroHeader}>
        <div className={styles.heroBadgeRow}>
          <span className={styles.heroLiveBadge}>[PLAY] AEGIS ARCADE CABINETS</span>
          <span className={styles.heroVersionBadge}>VERSION 2.0.0 EXPANDED</span>
        </div>
        <h1 className={styles.heroTitle}>
          AEGIS ARCADE <span className={styles.heroHighlight}>// CYBER UNIVERSE</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Experience high-density physics arcade gameplay. Choose between the tactical orbital slingshot roguelite <strong>Kinetic Surge</strong>, the supersonic reflex <strong>Gravity Runner</strong>, <strong>Quantum Turret</strong>, <strong>Pulse Rhythm</strong>, or <strong>Neon Duel</strong>.
        </p>
      </div>

      {/* Main Interactive Game Arena */}
      <section className={styles.gameArenaSection}>
        <ArcadeMasterHub />
      </section>

      {/* Tactical Strategy & Deep Engineering Guide */}
      <section className={`${styles.tacticalGuideSection} glass`}>
        <div className={styles.guideHeaderCol}>
          <span className={styles.guideCategoryBadge}>PILOT FLIGHT MANUAL</span>
          <h2 className={styles.guideTitle}>TACTICAL DOCTRINE & ORBITAL PHYSICS</h2>
          <p className={styles.guideDesc}>
            Comprehensive operational telemetry, bumper mechanics, and roguelite drafting synergies for high-score extraction.
          </p>
        </div>

        <div className={styles.guideCardsGrid}>
          <div className={styles.guideCard}>
            <span className={styles.guideCardIcon}>[ORBIT]</span>
            <h3 className={styles.guideCardTitle}>Gravitational Slingshots</h3>
            <p className={styles.guideCardText}>
              Gravitational wells exert Newtonian inverse-square force curves on your vessel core. Aligning launch trajectories to graze the outer radius curve converts orbital angular momentum into supersonic velocity multipliers.
            </p>
          </div>

          <div className={styles.guideCard}>
            <span className={styles.guideCardIcon}>[COMBO]</span>
            <h3 className={styles.guideCardTitle}>Harmonic Resonance Stacking</h3>
            <p className={styles.guideCardText}>
              Each continuous bumper collision without falling into the bottom drain advances the procedural musical chord sequence and scales your combo score multiplier up to 5x.
            </p>
          </div>

          <div className={styles.guideCard}>
            <span className={styles.guideCardIcon}>[DRAFT]</span>
            <h3 className={styles.guideCardTitle}>Synergy Drafting Matrix</h3>
            <p className={styles.guideCardText}>
              Stacking <strong>Quantum Fission</strong> with <strong>Tesla Arc</strong> and <strong>Prism Refractor</strong> creates exponential screen-clearing chain reactions that melt Sector Boss shields in seconds.
            </p>
          </div>

          <div className={styles.guideCard}>
            <span className={styles.guideCardIcon}>[BOSS]</span>
            <h3 className={styles.guideCardTitle}>Singularity Titan Tactics</h3>
            <p className={styles.guideCardText}>
              Sector Bosses deploy rotating defensive drone shields. Destroy outer shield drones to expose the vulnerable core crystal before launching Supernova Overdrive blasts.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Architectural Ad Unit */}
      <div className={styles.footerAdSlot}>
        <AdSlot type="banner" />
      </div>
    </div>
  );
}

