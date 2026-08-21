"use client";

import Image from "next/image";
import styles from "./LootCard.module.css";
import { buildAffiliateUrl } from "@/lib/affiliate";
import { useCurrency } from "@/context/CurrencyContext";

interface LootCardProps {
  giveaway: {
    id: string;
    title: string;
    worth?: string;
    worthUSD?: number;
    image?: string;
    thumbnail?: string;
    description: string;
    type: string;
    platforms: string | string[];
    users?: number;
    claimedUsers?: number;
    open_giveaway_url?: string;
    claimUrl?: string;
    affiliateClaimUrl?: string;
  };
}

function getDirectLootUrl(giveaway: LootCardProps["giveaway"], platformStr: string): string {
  const p = platformStr.toLowerCase();
  const t = (giveaway.title || "").toLowerCase();

  let target = giveaway.affiliateClaimUrl || giveaway.claimUrl || giveaway.open_giveaway_url || "#";

  if (p.includes("epic games")) {
    target = "https://store.epicgames.com/en-US/free-games";
  } else if (p.includes("steam")) {
    target = "https://store.steampowered.com/genre/Free%20to%20Play/";
  } else if (p.includes("gog")) {
    target = "https://www.gog.com";
  } else if (p.includes("prime") || t.includes("prime gaming")) {
    target = "https://gaming.amazon.com";
  }

  return buildAffiliateUrl(target);
}

export default function LootCard({ giveaway }: LootCardProps) {
  const { formatPrice } = useCurrency();
  const platformStr = Array.isArray(giveaway.platforms) 
    ? giveaway.platforms.join(", ") 
    : (giveaway.platforms || "PC");

  const claimUrl = getDirectLootUrl(giveaway, platformStr);
  const imageSrc = giveaway.image || giveaway.thumbnail || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80";
  const userCount = giveaway.users || giveaway.claimedUsers || 1000;
  const worthText = giveaway.worthUSD ? `Valued ${formatPrice(giveaway.worthUSD)}` : (giveaway.worth !== "N/A" && giveaway.worth ? `Valued ${giveaway.worth}` : "Priceless");

  return (
    <article className={`${styles.card} glass`} aria-label={`Giveaway for ${giveaway.title}`}>
      {/* Thumbnail */}
      <div className={styles.imageWrapper}>
        <Image
          src={imageSrc}
          alt={`Thumbnail for ${giveaway.title}`}
          fill
          unoptimized
          className={styles.thumbImage}
        />
        <div className={styles.freeBadge}>
          100% FREE
        </div>
        <div className={styles.worthBadge}>
          {worthText}
        </div>
      </div>

      {/* Content */}
      <div className={styles.cardBody}>
        <div className={styles.metaHeader}>
          <span className={styles.typeTag}>{giveaway.type}</span>
          <span className={styles.platformTag}>{platformStr}</span>
        </div>

        <h3 className={styles.title}>{giveaway.title}</h3>
        <p className={styles.desc}>{giveaway.description}</p>

        {/* Claim Footer */}
        <div className={styles.footerRow}>
          <div className={styles.claimedCount}>
            <span>**</span> {userCount.toLocaleString()} Claimed
          </div>
          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            aria-label={`Claim ${giveaway.title} 100 percent free`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.95rem" }}
          >
            Claim Free [GIFT]
          </a>
        </div>
      </div>
    </article>
  );
}
