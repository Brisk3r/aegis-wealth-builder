import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={`glass ${styles.hero}`}>
        <h1 className={styles.title}>Welcome to Aegis Hub</h1>
        <p className={styles.description}>
          A premium suite of developer utilities and high-value tools.
        </p>
        <div className={styles.actions}>
          <Link href="/svg-editor" className={styles.cta}>
            Launch SVG Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
