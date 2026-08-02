import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.logo}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Image 
            src="/logo.png" 
            alt="Aegis Hub Logo" 
            width={32} 
            height={32} 
            style={{ borderRadius: "6px", objectFit: "contain" }}
          />
          <span>Aegis Hub</span>
        </Link>
      </div>
      <div className={styles.adPlaceholder}>
        <span className={styles.adText}>Advertisement Space</span>
      </div>
    </header>
  );
}
