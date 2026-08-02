import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import AdSlot from "@/components/AdSlot";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Flagship Banner */}
      <section className={`glass ${styles.hero}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <Image 
            src="/logo.png" 
            alt="Aegis Hub Logo" 
            width={44} 
            height={44} 
            style={{ borderRadius: "8px", objectFit: "contain" }}
          />
          <span className={styles.badge}>Flagship Vector Studio</span>
        </div>

        <h1 className={styles.title}>Interactive SVG Vector Node & Path Studio</h1>
        <p className={styles.description}>
          A state-of-the-art vector editor. Click, drag, and transform path nodes and Bezier control handles live on the canvas.
        </p>

        {/* Hero Graphic Banner */}
        <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", margin: "1rem 0", border: "1px solid var(--glass-border)" }}>
          <Image 
            src="/hero_banner.png" 
            alt="Aegis Vector Studio Graphic" 
            fill 
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className={styles.actions}>
          <Link href="/svg-editor" className={styles.ctaPrimary}>
            📍 Open Interactive Vector Studio
          </Link>
          <Link href="/svg-converter" className={styles.ctaSecondary}>
            ⚡ SVG Optimizer & Exporter
          </Link>
        </div>
      </section>

      {/* Architectural Ad Unit */}
      <AdSlot type="banner" />

      {/* Flagship Feature Highlights */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionHeading}>Vector Node Studio Capabilities</h2>
        <div className={styles.grid}>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📍</span>
              <span className={styles.cardTag}>Interactive Node Dragging</span>
            </div>
            <h3>Real-Time Node & Anchor Dragging</h3>
            <p>Click any path vertex to display interactive anchor points and Bezier control handles. Drag nodes in real-time with zero lag.</p>
            <Link href="/svg-editor" className={styles.cardLink}>
              Launch Node Studio &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>⚙️</span>
              <span className={styles.cardTag}>Precision Editing</span>
            </div>
            <h3>Numeric Coordinate Inspector</h3>
            <p>Inspect exact X/Y coordinates for every vector point. Convert nodes between MoveTo (M), LineTo (L), and Cubic Bezier (C) curves.</p>
            <Link href="/svg-editor" className={styles.cardLink}>
              Inspect Coordinates &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>⚡</span>
              <span className={styles.cardTag}>Multi-Format Export</span>
            </div>
            <h3>HD Raster & React Component Exporter</h3>
            <p>Export modified vector paths to clean SVG, 4K supersampled PNG, WEBP, Data URI, or ready-to-use React JSX/TSX components.</p>
            <Link href="/svg-converter" className={styles.cardLink}>
              Open Exporter &rarr;
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
