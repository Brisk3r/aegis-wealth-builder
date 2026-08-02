import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={`glass ${styles.underConstructionCard}`}>
        <div className={styles.brandRow}>
          <Image 
            src="/logo.png" 
            alt="Aegis Hub Logo" 
            width={56} 
            height={56} 
            style={{ borderRadius: "12px", objectFit: "contain" }}
          />
          <span className={styles.brandTitle}>Aegis Hub</span>
        </div>

        <span className={styles.badge}>Platform Upgrade in Progress</span>
        
        <h1 className={styles.title}>Under Construction</h1>
        
        <p className={styles.description}>
          We are currently undergoing a major platform upgrade to deliver a best-in-class developer utility suite. Thank you for your patience while we refine our tools.
        </p>

        <div className={styles.divider} />

        <div className={styles.statusRow}>
          <div className={styles.statusIndicator}>
            <span className={styles.pulseDot} />
            <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Systems Maintenance Active</span>
          </div>
        </div>
      </section>
    </div>
  );
}
