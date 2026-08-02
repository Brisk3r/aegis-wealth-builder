import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={`glass ${styles.hero}`}>
        <span className={styles.badge}>Aegis Developer Hub</span>
        <h1 className={styles.title}>The Ultimate Suite of Developer & Design Utilities</h1>
        <p className={styles.description}>
          High-performance, zero-friction tools for frontend engineers, UI designers, and developer-founders.
        </p>
        <div className={styles.actions}>
          <Link href="/svg-editor" className={styles.ctaPrimary}>
            Launch SVG Studio
          </Link>
          <Link href="/svg-converter" className={styles.ctaSecondary}>
            SVG Converter & Optimizer
          </Link>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionHeading}>Featured Utility Suites</h2>
        <div className={styles.grid}>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🎨</span>
              <span className={styles.cardTag}>Vector Suite</span>
            </div>
            <h3>SVG Studio & Code Editor</h3>
            <p>Search thousands of vector icons, transform paths live, customize fills/strokes, edit XML code 2-way, and export to SVG or React JSX.</p>
            <Link href="/svg-editor" className={styles.cardLink}>
              Open SVG Studio &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>⚡</span>
              <span className={styles.cardTag}>Vector Suite</span>
            </div>
            <h3>SVG Converter & Optimizer</h3>
            <p>Batch clean SVG metadata, minify XML code, and rasterize vectors to HD PNG, WEBP, JPEG, React TSX, or Vue 3 SFC components.</p>
            <Link href="/svg-converter" className={styles.cardLink}>
              Open Converter &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🌊</span>
              <span className={styles.cardTag}>Generators</span>
            </div>
            <h3>Wave & Pattern Generators</h3>
            <p>Design responsive SVG section wave dividers, seamless background grids, isometric diamonds, and dot matrix patterns.</p>
            <Link href="/svg-generators" className={styles.cardLink}>
              Open Generators &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🔗</span>
              <span className={styles.cardTag}>Utilities</span>
            </div>
            <h3>UTM Campaign Builder</h3>
            <p>Generate clean, standardized campaign tracking URLs for product launches across Reddit, Twitter, and email newsletters.</p>
            <Link href="/utilities/utm-builder" className={styles.cardLink}>
              Build UTM Link &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📊</span>
              <span className={styles.cardTag}>Utilities</span>
            </div>
            <h3>ROAS & SaaS Financial Calculator</h3>
            <p>Calculate break-even targets, target acquisition costs (CAC), and net profit margins for micro-SaaS launches.</p>
            <Link href="/utilities/roas-calculator" className={styles.cardLink}>
              Open Calculator &rarr;
            </Link>
          </div>

          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📚</span>
              <span className={styles.cardTag}>Education</span>
            </div>
            <h3>Developer Guides & Tutorials</h3>
            <p>In-depth technical guides on vector performance optimization, React component pipelines, and modern glassmorphic UI filters.</p>
            <Link href="/guides" className={styles.cardLink}>
              Read Articles &rarr;
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
