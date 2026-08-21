"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { Sparkles, Type, Smile, Palette, LayoutTemplate, Layers } from "lucide-react";

export default function Header() {
  return (
    <header className={styles.headerWrapper}>
      {/* Clean Top Ticker Bar */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerContent}>
          <div className={styles.tickerNewsCol}>
            <span className={styles.tickerPulse} />
            <span className={styles.tickerBadge}>GLYPHCRAFT UNICODE FORGE</span>
            <span className={styles.tickerText}>
              2,000+ Aesthetic Symbols, Kaomoji Combos, 22+ Unicode Fonts & Big ASCII Banners -- 100% Free
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>[PRESS &apos;/&apos; TO SEARCH]</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`${styles.mainNav} surface-card`}>
        <div className={styles.navContainer}>
          {/* Brand Logo */}
          <Link href="/" className={styles.brandRow}>
            <div className={styles.logoBadge} style={{ background: 'linear-gradient(135deg, #a855f7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
              ✦
            </div>
            <div className={styles.brandTitleCol}>
              <span className={styles.brandTitle}>GLYPH<span className={styles.brandHighlight}>CRAFT</span></span>
              <span className={styles.brandSub}>Cool Symbols, Kaomoji & Font Generator</span>
            </div>
          </Link>

          {/* Navigation Links - 100% Symbol Studio */}
          <div className={styles.navLinks}>
            <Link href="/" className={`${styles.navLink} ${styles.activeLink}`}>
              <Sparkles size={14} />
              <span>Symbols</span>
            </Link>
            <Link href="/" className={styles.navLink}>
              <Type size={14} />
              <span>Font Styler</span>
            </Link>
            <Link href="/" className={styles.navLink}>
              <Palette size={14} />
              <span>ASCII Banners</span>
            </Link>
            <Link href="/" className={styles.navLink}>
              <LayoutTemplate size={14} />
              <span>Text Decorator</span>
            </Link>
            <Link href="/" className={styles.navLink}>
              <Smile size={14} />
              <span>Kaomoji</span>
            </Link>
            <Link href="/" className={styles.navLink}>
              <Layers size={14} />
              <span>Bio Templates</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
