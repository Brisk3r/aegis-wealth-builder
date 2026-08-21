"use client";

import Image from "next/image";
import styles from "./DealCard.module.css";
import { PC_STORES_MAP } from "@/lib/aegisPcDeals";
import { useCurrency } from "@/context/CurrencyContext";

export interface Deal {
  dealID: string;
  title: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore?: string;
  steamRatingPercent?: string;
  steamRatingText?: string;
  thumb: string;
  steamAppID?: string;
  dealRating?: string;
}

interface DealCardProps {
  deal: Deal;
  onSaveWishlist?: (deal: Deal) => void;
  isWishlisted?: boolean;
}

export default function DealCard({ deal, onSaveWishlist, isWishlisted = false }: DealCardProps) {
  const { formatPrice, currency } = useCurrency();
  const store = PC_STORES_MAP[deal.storeID] || { name: "PC Store", icon: "[GAME]" };
  const savingsPct = Math.round(parseFloat(deal.savings || "0"));
  const ratingNum = parseFloat(deal.dealRating || "8.5");
  
  const directUrl = deal.steamAppID && deal.steamAppID !== "0"
    ? `https://store.steampowered.com/app/${deal.steamAppID}`
    : "https://store.steampowered.com";

  return (
    <div className={`${styles.card} glass`}>
      {/* Top Banner / Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={deal.thumb}
          alt={deal.title}
          fill
          unoptimized
          className={styles.thumbImage}
        />
        <div className={styles.discountBadge}>
          -{savingsPct}%
        </div>
        <div className={styles.storeBadge}>
          <span>{store.icon}</span>
          <span>{store.name}</span>
        </div>
      </div>

      {/* Body Info */}
      <div className={styles.cardBody}>
        <h3 className={styles.title} title={deal.title}>{deal.title}</h3>

        {/* Ratings Row */}
        <div className={styles.ratingsRow}>
          {deal.steamRatingPercent && deal.steamRatingPercent !== "0" && (
            <span className={styles.ratingPill} title={`Steam User Reviews: ${deal.steamRatingText || ""}`}>
              ** {deal.steamRatingPercent}%
            </span>
          )}
          {deal.metacriticScore && deal.metacriticScore !== "0" && (
            <span className={styles.metacriticPill} title="Metacritic Score">
              [TARGET] {deal.metacriticScore}
            </span>
          )}
          <span className={styles.dealRatingPill} title="Aegis Value Rating">
            * {ratingNum.toFixed(1)}/10
          </span>
        </div>

        {/* Price & Action Row */}
        <div className={styles.priceRow}>
          <div className={styles.priceCol}>
            <span className={styles.salePrice}>{formatPrice(deal.salePrice)}</span>
            <div className={styles.priceSubRow}>
              <span className={styles.normalPrice}>{formatPrice(deal.normalPrice)}</span>
              {currency.code !== "USD" && (
                <span className={styles.rawUsdLabel}>(${deal.salePrice} USD)</span>
              )}
            </div>
          </div>

          <div className={styles.actionButtons}>
            {onSaveWishlist && (
              <button 
                onClick={() => onSaveWishlist(deal)} 
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isWishlisted ? "**" : "**"}
              </button>
            )}
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
            >
              Get PC Deal *
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
