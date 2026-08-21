'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Tag, TrendingDown, Star } from 'lucide-react';
import { Game } from '@/types/gameHub';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  isWishlisted?: boolean;
  onToggleWishlist?: (gameId: string) => void;
}

export default function GameCard({ game, isWishlisted = false, onToggleWishlist }: GameCardProps) {
  const [wished, setWished] = useState(isWishlisted);
  const { formatPrice } = useCurrency();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished(!wished);
    if (onToggleWishlist) {
      onToggleWishlist(game.id);
    }
  };

  const lowestPrice = game.lowestCurrentPrice || 0;
  const originalPrice = game.highestOriginalPrice || lowestPrice;
  const discountPercent = game.maxDiscountPercent || 0;

  return (
    <div className={`${styles.card} glass-card`}>
      <Link href={`/games/${game.slug}`} className={styles.cardLink}>
        {/* Cover Image Wrapper */}
        <div className={styles.imageWrapper}>
          <Image
            src={game.coverImageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={styles.coverImage}
          />
          <div className={styles.imageOverlay} />

          {/* Badges Overlay */}
          <div className={styles.badgeRow}>
            {discountPercent > 0 && (
              <span className={styles.discountBadge}>
                <TrendingDown size={12} /> -{Math.round(discountPercent)}%
              </span>
            )}
            {game.isAllTimeLow && (
              <span className={styles.atlBadge}>
                <Tag size={10} /> ALL-TIME LOW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className={`${styles.wishlistBtn} ${wished ? styles.wished : ''}`}
            onClick={handleWishlist}
            title={wished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={wished ? 'var(--accent-purple)' : 'none'} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.cardBody}>
          <div className={styles.platformRow}>
            <span className={styles.platformTags}>{game.platforms.join(' * ')}</span>
            {game.metacriticScore > 0 && (
              <span className={styles.metacriticBadge}>
                <Star size={10} fill="currentColor" /> {game.metacriticScore}
              </span>
            )}
          </div>

          <h3 className={styles.title}>{game.title}</h3>

          <div className={styles.storeListingsSummary}>
            <span>{game.storeListings?.length || 1} Stores Tracked</span>
          </div>

          {/* Price Footer */}
          <div className={styles.priceRow}>
            <div className={styles.priceCol}>
              <span className={styles.currentPrice}>{formatPrice(lowestPrice)}</span>
              {discountPercent > 0 && (
                <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
              )}
            </div>

            <span className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              Deals *
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
