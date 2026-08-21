"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./AegisCard.module.css";
import { AegisGame } from "@/lib/aegisEngine";
import { useCurrency } from "@/context/CurrencyContext";
import PriceHistoryChart from "./PriceHistoryChart";

interface AegisCardProps {
  game: AegisGame;
  onSaveWishlist?: (game: AegisGame) => void;
  isWishlisted?: boolean;
}

export default function AegisCard({ game, onSaveWishlist, isWishlisted = false }: AegisCardProps) {
  const { formatPrice, currency } = useCurrency();
  const [showChart, setShowChart] = useState(false);

  return (
    <article className={`${styles.card} glass`} aria-label={`Game deal for ${game.title}`}>
      {/* Cover Image & Badges */}
      <div className={styles.imageContainer}>
        <Image
          src={game.coverImage}
          alt={`Cover image for ${game.title}`}
          fill
          unoptimized
          className={styles.coverImg}
        />
        {game.isHistoricalLow && (
          <div className={styles.historyLowBadge} aria-label="All time low price badge">
            [HOT] ALL-TIME LOW
          </div>
        )}
        <div className={styles.discountTag} aria-label={`${game.discountPercent} percent discount`}>
          -{game.discountPercent}%
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <div className={styles.platformRow} aria-label="Platforms and metacritic rating">
          {game.platforms.map(p => (
            <span key={p} className={styles.platformPill}>
              {p}
            </span>
          ))}
          <span className={styles.metacriticBadge} aria-label={`Metacritic rating ${game.metacriticScore}`}>
            [TARGET] {game.metacriticScore}
          </span>
        </div>

        <h3 className={styles.gameTitle}>{game.title}</h3>
        <span className={styles.publisherText}>{game.publisher}</span>

        {/* Pricing Block */}
        <div className={styles.priceContainer}>
          <div className={styles.priceCol}>
            <span className={styles.currentPrice} aria-label={`Sale price ${formatPrice(game.currentPriceUSD)}`}>
              {formatPrice(game.currentPriceUSD)}
            </span>
            <div className={styles.subPriceRow}>
              <span className={styles.msrpPrice} aria-label={`MSRP regular price ${formatPrice(game.msrpPriceUSD)}`}>
                {formatPrice(game.msrpPriceUSD)}
              </span>
              {currency.code !== "USD" && (
                <span className={styles.usdBase}>(${game.currentPriceUSD} USD)</span>
              )}
            </div>
          </div>

          <div className={styles.actionsGroup}>
            <button
              onClick={() => setShowChart(!showChart)}
              className={styles.chartToggleBtn}
              aria-expanded={showChart}
              aria-label={`Toggle price history telemetry chart for ${game.title}`}
              title="Toggle Price History Chart"
            >
              [UP]
            </button>

            {onSaveWishlist && (
              <button
                onClick={() => onSaveWishlist(game)}
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
                aria-label={isWishlisted ? `Remove ${game.title} from price watcher` : `Save ${game.title} to price watcher`}
                title={isWishlisted ? "Saved to Price Watcher" : "Save to Price Watcher"}
              >
                {isWishlisted ? "**" : "**"}
              </button>
            )}

            <a
              href={game.affiliateUrl || game.directStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`Buy ${game.title} on ${game.primaryStore}`}
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
            >
              {game.primaryStoreIcon} Get Deal *
            </a>
          </div>
        </div>

        {/* Store Options Matrix */}
        <div className={styles.storeMatrix} aria-label="Direct retailer options">
          <span className={styles.matrixTitle}>Direct Retailers:</span>
          <div className={styles.storeRow}>
            {game.storeOptions.map((opt, idx) => (
              <a
                key={idx}
                href={opt.affiliateUrl || opt.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeOptionChip}
                aria-label={`Buy ${game.title} on ${opt.storeName} for ${formatPrice(opt.priceUSD)}`}
              >
                <span>{opt.storeIcon} {opt.storeName}</span>
                <span className={styles.chipPrice}>{formatPrice(opt.priceUSD)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Collapsible Aegis Price History Telemetry Chart */}
        {showChart && (
          <div className={styles.chartDrawer} aria-label={`Price history telemetry chart for ${game.title}`}>
            <PriceHistoryChart priceHistory={game.priceHistory} msrpUSD={game.msrpPriceUSD} />
          </div>
        )}
      </div>
    </article>
  );
}
