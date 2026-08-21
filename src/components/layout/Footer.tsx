import Link from "next/link";
import styles from "./Footer.module.css";
import AdSlot from "./AdSlot";

export default function Footer() {
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
            <h3 className={styles.footerBrandTitle}>AEGIS<span className={styles.accentBlue}>HUB</span></h3>
            <p className={styles.footerDesc}>
              High-density digital platform engineering developer utilities, deep technical whitepapers, interactive simulation physics, and real-time market telemetry.
            </p>
            <div className={styles.storeBadges}>
              <span className={styles.storeTag}>[DEV] Utilities</span>
              <span className={styles.storeTag}>[LAB] Research</span>
              <span className={styles.storeTag}>[SIM] Physics</span>
              <span className={styles.storeTag}>[RADAR] Telemetry</span>
              <span className={styles.storeTag}>[CARE] Comfort OS</span>
            </div>
          </div>

          {/* Quick Hub Links */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>PLATFORM PILLARS</h4>
            <ul className={styles.linkList}>
              <li><Link href="/tools">Developer Utilities Suite</Link></li>
              <li><Link href="/research">Deep Technical Research</Link></li>
              <li><Link href="/events">Scheduled Events Calendar</Link></li>
              <li><Link href="/play">Simulation & Arcade Arena</Link></li>
              <li><Link href="/deals">Price & Hardware Radar</Link></li>
              <li><Link href="/palliative-care">Palliative Care Comfort OS</Link></li>
            </ul>
          </div>

          {/* Technical Documentation & Tools */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>KEY WORKBENCHES</h4>
            <ul className={styles.linkList}>
              <li><Link href="/tools/svg-studio">SVG Studio Pro</Link></li>
              <li><Link href="/tools/regex-lab">Regex Intelligence Lab</Link></li>
              <li><Link href="/tools/asset-converter">Smart Asset Converter</Link></li>
              <li><Link href="/tools/web-optimizer">Code Optimizer Lab</Link></li>
              <li><Link href="/tools/telemetry-deals">Telemetry Deals Engine</Link></li>
              <li><Link href="/guides">Architecture Guides</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>(c) {new Date().getFullYear()} Aegis Digital Platform. Engineered for zero slop and maximum utility.</p>
          <div className={styles.legalLinks}>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Service</span>
            <span>|</span>
            <span>Affiliate Disclosure</span>
            <span>|</span>
            <span>Telemetry Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

