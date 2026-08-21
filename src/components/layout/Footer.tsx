"use client";

import React from "react";
import styles from "./Footer.module.css";
import AdSlot from "./AdSlot";

export default function Footer() {
  const handleFooterNav = (tab: string, category?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("glyphcraft_nav", {
          detail: { tab, category: category || "all" }
        })
      );
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      if (category) url.searchParams.set("category", category);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenPolicy = (policy: "privacy" | "terms" | "about" | "contact") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("glyphcraft_open_policy", {
          detail: { policy }
        })
      );
    }
  };

  return (
    <footer className={styles.footerWrapper}>
      {/* Mandatory Architectural Footer Banner Ad */}
      <div className={styles.footerAdContainer}>
        <AdSlot type="banner" />
      </div>

      <div className={`${styles.footerMain} surface-card`}>
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <h3 className={styles.footerBrandTitle}>
              GLYPH<span className={styles.accentBlue} style={{ color: "#38bdf8" }}>CRAFT</span>
            </h3>
            <p className={styles.footerDesc}>
              The ultimate 1-click clipboard forge for over 2,000+ aesthetic symbols, Lenny faces, fancy Unicode font styles, Big ASCII banners, and social bio generators. Free and privacy-friendly.
            </p>
            <div className={styles.storeBadges}>
              <span className={styles.storeTag}>2,000+ Glyphs</span>
              <span className={styles.storeTag}>22+ Font Styles</span>
              <span className={styles.storeTag}>Kaomoji Arena</span>
              <span className={styles.storeTag}>ASCII Banners</span>
              <span className={styles.storeTag}>Client-Side</span>
            </div>
          </div>

          {/* Quick Tool Links */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>POPULAR CATEGORIES</h4>
            <ul className={styles.linkList}>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "kaomoji")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Lenny Faces & Meme Kaomoji
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "aesthetic")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Aesthetic Sparkles & Ribbons
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "stars")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Stars, Moons & Celestial Glyphs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "hearts")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Hearts, Flowers & Affection
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "borders")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Borders, Dividers & Filigree
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("symbols", "arrows")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Arrows & Directional Icons
                </button>
              </li>
            </ul>
          </div>

          {/* Typography & Tools */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>GENERATOR SUITES</h4>
            <ul className={styles.linkList}>
              <li>
                <button
                  onClick={() => handleFooterNav("fonts")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Mathematical Bold & Italic Fonts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("fonts")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Gothic Fraktur & Cursive Fonts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("banner")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  3D ASCII Big Text Banner Forge
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("decorator")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Text Decorator & Wrapper Tool
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("bio")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Social Media Bio Formatter
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav("fonts")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                >
                  Glitch & Zalgo Text Generator
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} GlyphCraft Studio (Aegis Hub). All rights reserved. Powered by Unicode Standards.</p>
          <div className={styles.legalLinks}>
            <button
              onClick={() => handleOpenPolicy("privacy")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
            >
              Privacy Policy
            </button>
            <span>|</span>
            <button
              onClick={() => handleOpenPolicy("terms")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
            >
              Terms of Service
            </button>
            <span>|</span>
            <button
              onClick={() => handleOpenPolicy("about")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
            >
              About Us
            </button>
            <span>|</span>
            <button
              onClick={() => handleOpenPolicy("contact")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
            >
              Contact & Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
