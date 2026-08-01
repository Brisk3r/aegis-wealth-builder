import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.logo}>
        <Link href="/">
          Aegis Hub
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/svg-editor" className={styles.navLink}>
          SVG Workspace
        </Link>
      </nav>
      {/* Reserved space for AdSense Banner */}
      <div className={styles.adPlaceholder}>
        <span className={styles.adText}>Advertisement Space</span>
      </div>
    </header>
  );
}
