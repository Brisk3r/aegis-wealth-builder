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
            <h3 className={styles.footerBrandTitle}>GLYPH<span className={styles.accentBlue}>CRAFT</span></h3>
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
              <li><Link href="/">Lenny Faces & Meme Kaomoji</Link></li>
              <li><Link href="/">Aesthetic Sparkles & Ribbons</Link></li>
              <li><Link href="/">Stars, Moons & Celestial Glyphs</Link></li>
              <li><Link href="/">Hearts, Flowers & Affection</Link></li>
              <li><Link href="/">Borders, Dividers & Filigree</Link></li>
              <li><Link href="/">Arrows & Directional Icons</Link></li>
            </ul>
          </div>

          {/* Typography & Tools */}
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>GENERATOR SUITES</h4>
            <ul className={styles.linkList}>
              <li><Link href="/">Mathematical Bold & Italic Fonts</Link></li>
              <li><Link href="/">Gothic Fraktur & Cursive Fonts</Link></li>
              <li><Link href="/">3D ASCII Big Text Banner Forge</Link></li>
              <li><Link href="/">Text Decorator & Wrapper Tool</Link></li>
              <li><Link href="/">Social Media Bio Formatter</Link></li>
              <li><Link href="/">Glitch & Zalgo Text Generator</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} GlyphCraft Studio (Aegis Hub). All rights reserved. Powered by Unicode Standards.</p>
          <div className={styles.legalLinks}>
            <Link href="/">Privacy Policy</Link>
            <span>|</span>
            <Link href="/">Terms of Service</Link>
            <span>|</span>
            <Link href="/">About Us</Link>
            <span>|</span>
            <Link href="/">Contact & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
