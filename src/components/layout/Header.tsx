"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./Header.module.css";
import AdSlot from "./AdSlot";
import StudioSwitcher from "./StudioSwitcher";
import { useCurrency } from "@/context/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import { Boxes } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const {
    currency,
    setCurrencyCode,
    location,
    detectLocation,
    loadingLocation,
    isLiveScraping,
    toggleLiveScraping,
  } = useCurrency();

  const navLinks = [
    { href: "/", label: "Studio Portfolio", icon: "[+]" },
    { href: "/tools", label: "Developer Suite", icon: "[TOOL]", badge: "Suite" },
    { href: "/research", label: "Research Papers", icon: "[LAB]", badge: "Deep" },
    { href: "/events", label: "Release Chrono", icon: "[LIVE]", badge: "Live" },
    { href: "/play", label: "Simulation Arena", icon: "[PLAY]", badge: "Engine" },
    { href: "/deals", label: "Market Telemetry", icon: "[DEAL]" },
    { href: "/palliative-care", label: "Comfort OS", icon: "[CARE]", badge: "Care" },
    { href: "/news", label: "Editorial", icon: "[NEWS]" },
  ];

  return (
    <header className={styles.headerWrapper}>
      {/* Ticker Bar with Live Telemetry Toggle, Location & Currency Controls */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerContent}>
          <div className={styles.tickerNewsCol}>
            <span className={isLiveScraping ? styles.tickerPulse : styles.tickerPulseOff} />
            <span className={styles.tickerBadge}>SOFTWARE PRODUCTIONS HOUSE</span>
            <span className={styles.tickerText}>
              Aegis Studios Active -- 6 Independent App Divisions, Creative Labs, Simulation Engines & Clinical Systems
            </span>
          </div>

          {/* Controls: Hardware Live Scraping Toggle, Location & Currency */}
          <div className={styles.currencyControls}>
            {/* Live Hardware Telemetry Toggle Switch */}
            <button
              onClick={toggleLiveScraping}
              className={`${styles.telemetryToggleBtn} ${isLiveScraping ? styles.telemetryActive : styles.telemetryInactive}`}
              title={isLiveScraping ? "Live Hardware Scraping is ACTIVE. Click to turn off." : "Live Hardware Scraping is OFF. Click to activate."}
            >
              <span className={isLiveScraping ? styles.liveDot : styles.offDot} />
              <span>{isLiveScraping ? "[*] LIVE SCRAPING: ON" : "[-] CACHED MODE: OFF"}</span>
            </button>

            <button 
              onClick={() => detectLocation()} 
              className={styles.locationBtn} 
              title="Auto-detect location & currency"
            >
              <span>{location ? `[${location.countryCode || "LOC"}]` : "[LOC]"}</span>
              <span>{loadingLocation ? "Locating..." : (location ? location.countryName : "Auto-Locate")}</span>
            </button>

            <select
              value={currency.code}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className={styles.currencySelect}
              title="Select currency"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  [{curr.code}] {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`${styles.mainNav} surface-card`}>
        <div className={styles.navContainer}>
          {/* Logo & Studio Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" className={styles.brandRow}>
              <div className={styles.logoBadge}>
                <Image 
                  src="/logo.png" 
                  alt="Aegis Hub Logo" 
                  width={34} 
                  height={34} 
                  style={{ borderRadius: "8px", objectFit: "contain" }}
                />
              </div>
              <div className={styles.brandTitleCol}>
                <span className={styles.brandTitle}>AEGIS<span className={styles.brandHighlight}>PRODUCTIONS</span></span>
                <span className={styles.brandSub}>Software Productions House & Innovation Forge</span>
              </div>
            </Link>

            <div style={{ width: '1px', height: '26px', background: 'rgba(255, 255, 255, 0.08)' }} />

            <StudioSwitcher />
          </div>

          {/* Navigation Links */}
          <div className={styles.navLinks}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                >
                  <span className={styles.linkIcon}>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && <span className={styles.navBadge}>{link.badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Architectural Header Banner Ad */}
      <div className={styles.headerAdWrapper}>
        <AdSlot type="banner" />
      </div>
    </header>
  );
}


