'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/game/SearchBar';
import GameCard from '@/components/game/GameCard';
import AdSlot from '@/components/layout/AdSlot';
import { gameService } from '@/lib/services/GameService';
import { Game } from '@/types/gameHub';
import { Filter, SlidersHorizontal, ExternalLink } from 'lucide-react';
import styles from './deals.module.css';

function DealsContent() {
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get('platform') || 'ALL';
  const initialStore = searchParams.get('store') || undefined;

  const [platform, setPlatform] = useState<string>(initialPlatform);
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'metacritic' | 'release'>('discount');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const urlPlatform = searchParams.get('platform');
    if (urlPlatform) {
      setPlatform(urlPlatform);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadedGames = gameService.getGames({
      platform: platform !== 'ALL' ? platform : undefined,
      query: searchQuery || undefined,
      sortBy,
    });

    // If filtered by specific store slug
    if (initialStore) {
      const filteredByStore = loadedGames.filter(g =>
        g.storeListings?.some(l => l.store?.slug === initialStore)
      );
      setGames(filteredByStore);
    } else {
      setGames(loadedGames);
    }
  }, [platform, sortBy, searchQuery, initialStore]);

  const toggleWishlist = (gameId: string) => {
    let updated = [...wishlist];
    if (updated.includes(gameId)) {
      updated = updated.filter(id => id !== gameId);
    } else {
      updated.push(gameId);
    }
    setWishlist(updated);
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.header}>
        <div className={styles.headerTitleRow}>
          <h1 className={styles.title}>
            [HOT] Hardware & Deal <span className="gradient-text">Price Telemetry Radar</span>
          </h1>
          <span className="badge badge-blue">{games.length} Live Discounts</span>
        </div>
        <p className={styles.subtitle}>
          Compare prices across Steam, Nintendo eShop, PlayStation Store, Xbox & GOG.
        </p>

        <div className={styles.searchRow}>
          <SearchBar />
        </div>
      </div>

      {/* Main Layout with Architectural Sidebar */}
      <div className="content-with-sidebar">
        <div className={styles.mainFeed}>
          {/* Filter & Sort Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <Filter size={16} className={styles.icon} />
              <span className={styles.toolbarLabel}>Platform:</span>
              <div className={styles.btnGroup}>
                {['ALL', 'Switch', 'PS5', 'Xbox', 'PC'].map(p => (
                  <button
                    key={p}
                    className={`${styles.filterBtn} ${platform === p ? styles.activeBtn : ''}`}
                    onClick={() => setPlatform(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toolbarGroup}>
              <SlidersHorizontal size={16} className={styles.icon} />
              <span className={styles.toolbarLabel}>Sort By:</span>
              <select
                className={styles.selectInput}
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="discount">Biggest Discount (%)</option>
                <option value="price">Lowest Price ($)</option>
                <option value="metacritic">Metacritic Score</option>
                <option value="release">Release Date</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={styles.grid}>
            {games.map(game => (
              <GameCard
                key={game.id}
                game={game}
                isWishlisted={wishlist.includes(game.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>

        {/* Sidebar with Sticky Architectural Ad */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <AdSlot type="sidebar" />
            
            {/* Direct Official Storefront Links */}
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>[GLOBAL] Direct Console & PC Store Links</h3>
              <div className={styles.widgetList} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="https://store.steampowered.com" target="_blank" rel="noopener noreferrer" className={styles.widgetItem} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>[GAME] Steam Official Store</span>
                  <ExternalLink size={14} />
                </a>
                <a href="https://www.nintendo.com/store" target="_blank" rel="noopener noreferrer" className={styles.widgetItem} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>[LIVE] Nintendo eShop Official</span>
                  <ExternalLink size={14} />
                </a>
                <a href="https://store.playstation.com" target="_blank" rel="noopener noreferrer" className={styles.widgetItem} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>[GAME] PlayStation Store Official</span>
                  <ExternalLink size={14} />
                </a>
                <a href="https://www.xbox.com/games/store" target="_blank" rel="noopener noreferrer" className={styles.widgetItem} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>[ACTIVE] Xbox Store Official</span>
                  <ExternalLink size={14} />
                </a>
                <a href="https://www.gog.com" target="_blank" rel="noopener noreferrer" className={styles.widgetItem} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>** GOG Storefront</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<p>Loading Aegis Deals Catalog...</p>}>
      <DealsContent />
    </Suspense>
  );
}
