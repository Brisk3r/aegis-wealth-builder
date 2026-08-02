import styles from "./AdSlot.module.css";

interface AdSlotProps {
  type?: "banner" | "sidebar" | "in-article";
  className?: string;
}

export default function AdSlot({ type = "banner", className = "" }: AdSlotProps) {
  return (
    <div className={`${styles.adContainer} ${styles[type]} ${className}`}>
      <span className={styles.adLabel}>Sponsored Advertisement Space</span>
      <div className={styles.adContent}>
        {/* Placeholder for live Google AdSenseins tag */}
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
