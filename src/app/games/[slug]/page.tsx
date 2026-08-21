'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Calendar, Building2, Tag, ArrowLeft } from 'lucide-react';
import { gameService } from '@/lib/services/GameService';
import { priceTrackingService } from '@/lib/services/PriceTrackingService';
import { wishlistService } from '@/lib/services/WishlistService';
import PriceComparisonTable from '@/components/game/PriceComparisonTable';
import PriceHistoryChart from '@/components/game/PriceHistoryChart';
import WishlistModal from '@/components/game/WishlistModal';
import AdSlot from '@/components/layout/AdSlot';
import { useCurrency } from '@/context/CurrencyContext';
import { Game, PriceHistory } from '@/types/gameHub';
import styles from './gameDetail.module.css';

export default function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [histories, setHistories] = useState<(PriceHistory & { storeName: string; storeId: string })[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const loadedGame = gameService.getGameBySlug(slug);
    if (!loadedGame) return;

    setGame(loadedGame);
    const loadedHistories = priceTrackingService.getPriceHistories(loadedGame.id);
    setHistories(loadedHistories);

    const gameAnalytics = priceTrackingService.getGameAnalytics(loadedGame.id);
    setAnalytics(gameAnalytics);

    const userWishlist = wishlistService.getUserWishlist('usr-1');
    const existing = userWishlist.find(w => w.gameId === loadedGame.id);
    if (existing) {
      setIsWishlisted(true);
    }
  }, [slug]);

  if (!game) {
    return (
      <div className={styles.loadingContainer}>
        <Link href="/deals" className="btn-secondary" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Deals
        </Link>
        <p>Loading Aegis Game Telemetry...</p>
      </div>
    );
  }

  const lowestPrice = game.lowestCurrentPrice || 0;
  const originalPrice = game.highestOriginalPrice || lowestPrice;
  const maxDiscount = game.maxDiscountPercent || 0;

  const handleSaveWishlist = (targetPrice: number, notifyOnAllTimeLow: boolean) => {
    wishlistService.addToWishlist(game.id, targetPrice, notifyOnAllTimeLow);
    setIsWishlisted(true);
  };

  return (
    <div className={styles.container}>
      {/* Navigation Breadcrumb */}
      <div>
        <Link href="/deals" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={14} /> Back to Deals Catalog
        </Link>
      </div>

      {/* Hero Metadata Block */}
      <div className={`${styles.heroCard} glass`}>
        <div className={styles.coverWrapper}>
          <Image
            src={game.coverImageUrl}
            alt={game.title}
            fill
            priority
            sizes="320px"
            className={styles.coverImage}
          />
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.badgeRow}>
            <span className="badge badge-cyan">{game.platforms.join(' * ')}</span>
            {game.metacriticScore > 0 && (
              <span className="badge badge-purple">
                <Star size={12} fill="currentColor" /> Metacritic: {game.metacriticScore}/100
              </span>
            )}
            {game.isAllTimeLow && (
              <span className="badge badge-green">
                <Tag size={12} /> All-Time Low Price!
              </span>
            )}
          </div>

          <h1 className={styles.title}>{game.title}</h1>

          <div className={styles.metaDetails}>
            <span className={styles.metaItem}>
              <Building2 size={14} /> Publisher: {game.publisher}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={14} /> Released: {new Date(game.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <p className={styles.description}>{game.description}</p>

          {/* Pricing Highlight & Wishlist Action */}
          <div className={styles.actionBanner}>
            <div className={styles.priceHighlight}>
              <span className={styles.priceLabel}>Best Current Price:</span>
              <div className={styles.priceValGroup}>
                <span className={styles.lowestPrice}>{formatPrice(lowestPrice)}</span>
                {maxDiscount > 0 && (
                  <>
                    <span className={styles.origPrice}>{formatPrice(originalPrice)}</span>
                    <span className={styles.discountBadge}>-{Math.round(maxDiscount)}%</span>
                  </>
                )}
              </div>
            </div>

            <button
              className={isWishlisted ? 'btn-secondary' : 'btn-primary'}
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Heart size={18} fill={isWishlisted ? 'var(--accent-purple)' : 'none'} />
              {isWishlisted ? 'Wishlisted (Edit Alert)' : 'Add to Wishlist Alert'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Architectural Header Banner Ad Slot */}
      <AdSlot type="banner" />

      {/* Main Grid: Store Price Comparison + Architectural Sidebar Ad */}
      <div className="content-with-sidebar">
        <div className={styles.leftCol}>
          {/* Store Price Matrix Table */}
          <PriceComparisonTable storeListings={game.storeListings || []} lowestPrice={lowestPrice} />

          {/* Interactive Recharts Price History Graph */}
          <PriceHistoryChart
            histories={histories}
            allTimeLow={analytics?.allTimeLow}
            historicalAverage={analytics?.historicalAverage}
          />
        </div>

        {/* Sidebar Sticky Ad */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <AdSlot type="sidebar" />
            <div className={`${styles.widget} glass`}>
              <h3 className={styles.widgetTitle}>[AEGIS] Aegis Price Guarantee</h3>
              <p className={styles.widgetDesc}>
                We poll digital and physical stores continuously to verify genuine price drops and historical lows.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Wishlist Configuration Modal */}
      <WishlistModal
        game={game}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWishlist}
        currentWishlistTarget={lowestPrice}
      />
    </div>
  );
}
