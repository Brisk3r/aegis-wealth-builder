"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { Sparkles, Type, Smile, Palette, LayoutTemplate, Layers } from "lucide-react";

export default function Header() {
  const [activeTab, setActiveTab] = useState<string>("symbols");

  useEffect(() => {
    // Listen for tab changes from SymbolStudio
    const handleTabChange = (e: Event) => {
      const custom = e as CustomEvent<{ tab: string }>;
      if (custom.detail?.tab) {
        setActiveTab(custom.detail.tab);
      }
    };

    // Check initial search params on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) setActiveTab(tabParam);
    }

    window.addEventListener("glyphcraft_tab_changed", handleTabChange);
    return () => window.removeEventListener("glyphcraft_tab_changed", handleTabChange);
  }, []);

  const handleNavClick = (tabName: string) => {
    setActiveTab(tabName);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("glyphcraft_nav", {
          detail: { tab: tabName }
        })
      );
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabName);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={styles.headerWrapper}>
      {/* Top Ticker Bar */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerContent}>
          <div className={styles.tickerNewsCol}>
            <span className={styles.tickerPulse} />
            <span className={styles.tickerBadge}>GLYPHCRAFT UNICODE FORGE</span>
            <span className={styles.tickerText}>
              2,000+ Aesthetic Symbols, Kaomoji Combos, 22+ Unicode Fonts & Big ASCII Banners -- 100% Free
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.75rem", color: "#94a3b8" }}>
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>[PRESS &apos;/&apos; TO SEARCH]</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`${styles.mainNav} surface-card`}>
        <div className={styles.navContainer}>
          {/* Brand Logo */}
          <Link href="/" onClick={() => handleNavClick("symbols")} className={styles.brandRow}>
            <div
              className={styles.logoBadge}
              style={{
                background: "linear-gradient(135deg, #a855f7, #38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.1rem",
                width: "36px",
                height: "36px"
              }}
            >
              ✦
            </div>
            <div className={styles.brandTitleCol}>
              <span className={styles.brandTitle}>
                GLYPH<span className={styles.brandHighlight} style={{ color: "#38bdf8" }}>CRAFT</span>
              </span>
              <span className={styles.brandSub}>Cool Symbols, Kaomoji & Font Generator</span>
            </div>
          </Link>

          {/* Navigation Interactive Buttons */}
          <div className={styles.navLinks}>
            <button
              onClick={() => handleNavClick("symbols")}
              className={`${styles.navLink} ${activeTab === "symbols" ? styles.activeLink : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Sparkles size={14} />
              <span>Symbols</span>
            </button>

            <button
              onClick={() => handleNavClick("fonts")}
              className={`${styles.navLink} ${activeTab === "fonts" ? styles.activeLink : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Type size={14} />
              <span>Font Styler</span>
            </button>

            <button
              onClick={() => handleNavClick("banner")}
              className={`${styles.navLink} ${activeTab === "banner" ? styles.activeLink : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Palette size={14} />
              <span>ASCII Banners</span>
            </button>

            <button
              onClick={() => handleNavClick("decorator")}
              className={`${styles.navLink} ${activeTab === "decorator" ? styles.activeLink : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <LayoutTemplate size={14} />
              <span>Text Decorator</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("symbols");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("glyphcraft_nav", {
                      detail: { tab: "symbols", category: "kaomoji" }
                    })
                  );
                }
              }}
              className={`${styles.navLink}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Smile size={14} />
              <span>Kaomoji</span>
            </button>

            <button
              onClick={() => handleNavClick("bio")}
              className={`${styles.navLink} ${activeTab === "bio" ? styles.activeLink : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Layers size={14} />
              <span>Bio Templates</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
