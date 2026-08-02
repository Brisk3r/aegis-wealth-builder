import Link from "next/link";
import styles from "./utilities.module.css";

export const metadata = {
  title: "Developer Utilities | Aegis Hub",
  description: "High-value developer utilities: UTM Builder, RegEx Tester, and ROAS Calculator.",
};

export default function UtilitiesHubPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Developer Utilities Suite</h1>
        <p className={styles.description}>
          High-performance tools for developer-founders, marketers, and frontend engineers.
        </p>
      </div>

      <div className={styles.grid}>
        <Link href="/utilities/utm-builder" className={`glass ${styles.card}`}>
          <div className={styles.cardIcon}>🔗</div>
          <h3>UTM Campaign Parameter Builder</h3>
          <p>Generate clean, standardized tracking links for campaign launches across X, Reddit, and ProductHunt.</p>
          <span className={styles.linkText}>Launch Tool &rarr;</span>
        </Link>

        <Link href="/utilities/regex-tester" className={`glass ${styles.card}`}>
          <div className={styles.cardIcon}>⚡</div>
          <h3>RegEx Tester & Debugger</h3>
          <p>Test regular expressions live with instant match highlighting, flags, and regex cheat sheet references.</p>
          <span className={styles.linkText}>Launch Tool &rarr;</span>
        </Link>

        <Link href="/utilities/roas-calculator" className={`glass ${styles.card}`}>
          <div className={styles.cardIcon}>📊</div>
          <h3>ROAS & SaaS Financial Calculator</h3>
          <p>Calculate break-even targets, target customer acquisition costs (CAC), and profit margins for micro-SaaS launches.</p>
          <span className={styles.linkText}>Launch Tool &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
