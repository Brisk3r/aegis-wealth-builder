import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} glass`}>
        <p>&copy; {new Date().getFullYear()} Aegis Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
