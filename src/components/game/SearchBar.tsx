'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, X, Tag } from 'lucide-react';
import { Game } from '@/types/gameHub';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/games?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.games || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className={styles.searchWrapper} ref={searchRef}>
      <div className={styles.inputGroup}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search 10,000+ games across Steam, eShop, PS Store, Xbox & GOG..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button className={styles.clearBtn} onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`${styles.dropdown} glass`}>
          <div className={styles.dropdownHeader}>
            <span>{loading ? 'Searching catalog...' : `${results.length} Game Matches Found`}</span>
            <Sparkles size={14} className={styles.sparkleIcon} />
          </div>

          {results.length === 0 && !loading ? (
            <div className={styles.noResults}>
              <p>No matching games found for &quot;{query}&quot;.</p>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {results.map(game => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className={styles.resultItem}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.thumbWrapper}>
                    <Image
                      src={game.coverImageUrl}
                      alt={game.title}
                      fill
                      sizes="48px"
                      className={styles.thumbImage}
                    />
                  </div>

                  <div className={styles.gameInfo}>
                    <div className={styles.gameTitleRow}>
                      <span className={styles.gameTitle}>{game.title}</span>
                      {game.isAllTimeLow && (
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          <Tag size={10} /> ATL
                        </span>
                      )}
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.publisher}>{game.publisher}</span>
                      <span className={styles.platforms}>{game.platforms.join(' * ')}</span>
                    </div>
                  </div>

                  <div className={styles.priceCol}>
                    <span className={styles.currentPrice}>
                      {formatPrice(game.lowestCurrentPrice || 0)}
                    </span>
                    {game.highestOriginalPrice && game.highestOriginalPrice > (game.lowestCurrentPrice || 0) && (
                      <span className={styles.origPrice}>{formatPrice(game.highestOriginalPrice)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
