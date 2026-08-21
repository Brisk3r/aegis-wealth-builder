import styles from "./AdSlot.module.css";

interface AdSlotProps {
  type?: "banner" | "sidebar" | "in-article";
  className?: string;
}

export default function AdSlot({ type = "banner", className = "" }: AdSlotProps) {
  return (
    <div className={`${styles.adContainer} ${styles[type]} ${className}`}>
      <div className={styles.adHeader}>
        <span className={styles.adBadge}>AD</span>
        <span className={styles.adLabel}>SPONSORED ADVERTISEMENT</span>
      </div>
      <div className={styles.adContent}>
        <ins 
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", width: "100%", height: "100%" }}
          data-ad-client="ca-pub-4750454395006570"
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
