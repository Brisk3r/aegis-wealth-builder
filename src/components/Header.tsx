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
          SVG Studio
        </Link>
        <Link href="/svg-converter" className={styles.navLink}>
          Converter
        </Link>
        <Link href="/svg-generators" className={styles.navLink}>
          Generators
        </Link>
        <Link href="/utilities" className={styles.navLink}>
          Utilities
        </Link>
        <Link href="/guides" className={styles.navLink}>
          Guides
        </Link>
      </nav>
      {/* Reserved space for AdSense Banner */}
      <div className={styles.adPlaceholder}>
        <span className={styles.adText}>Advertisement Space</span>
      </div>
    </header>
  );
}
