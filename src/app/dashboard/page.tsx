'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bell, Trash2, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { wishlistService } from '@/lib/services/WishlistService';
import { Wishlist, NotificationLog } from '@/types/gameHub';
import AdSlot from '@/components/layout/AdSlot';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringWorker, setTriggeringWorker] = useState(false);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const loadData = () => {
    setLoading(true);
    const userWishlist = wishlistService.getUserWishlist('usr-1');
    const userLogs = wishlistService.getUserNotificationLogs('usr-1');
    setWishlists(userWishlist);
    setLogs(userLogs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = (gameId: string) => {
    wishlistService.removeFromWishlist(gameId, 'usr-1');
    loadData();
  };

  const handleRunBackgroundWorkers = async () => {
    setTriggeringWorker(true);
    setWorkerMessage(null);
    try {
      const res = await fetch('/api/jobs/scrape', { method: 'POST' });
      const data = await res.json();
      setWorkerMessage(`Background BullMQ Job #${data.scrapeJob?.jobId?.slice(-6)} executed successfully! Checked ${data.scrapeJob?.processedCount} listings.`);
      loadData();
    } catch (err: any) {
      setWorkerMessage(`Worker execution error: ${err.message}`);
    } finally {
      setTriggeringWorker(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Dashboard Header */}
      <div className={`${styles.header} glass`}>
        <div className={styles.headerTitleRow}>
          <div>
            <h1 className={styles.title}>
              ** User Dashboard & <span className="gradient-text">Wishlist Alerts</span>
            </h1>
            <p className={styles.subtitle}>
              Monitor saved games, active target price thresholds, and automated alert logs.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleRunBackgroundWorkers}
            disabled={triggeringWorker}
            style={{ fontSize: '0.85rem' }}
          >
            <Play size={14} className={triggeringWorker ? styles.spin : ''} />
            {triggeringWorker ? 'Running Worker Queue...' : 'Run Mock Scraper Queue'}
          </button>
        </div>

        {workerMessage && (
          <div className={styles.workerNotification}>
            <Sparkles size={16} /> {workerMessage}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="content-with-sidebar">
        <div className={styles.mainContent}>
          {/* Wishlist Items Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Heart size={20} className={styles.iconPurple} /> Saved Wishlist Items ({wishlists.length})
              </h2>
            </div>

            {loading ? (
              <p>Loading Wishlist...</p>
            ) : wishlists.length === 0 ? (
              <div className={`${styles.emptyCard} glass`}>
                <p>Your wishlist is currently empty.</p>
                <Link href="/deals" className="btn-primary" style={{ marginTop: '0.75rem' }}>
                  Browse Live Deals catalog
                </Link>
              </div>
            ) : (
              <div className={styles.wishlistGrid}>
                {wishlists.map(item => {
                  const game = item.game;
                  if (!game) return null;

                  const currentPrice = game.lowestCurrentPrice || 0;
                  const targetPrice = item.targetPrice;
                  const isMet = currentPrice <= targetPrice;
                  const progressPct = Math.min(100, Math.max(0, (targetPrice / (game.highestOriginalPrice || currentPrice)) * 100));

                  return (
                    <div key={item.id} className={`${styles.wishlistCard} glass`}>
                      <div className={styles.thumbCol}>
                        <Image
                          src={game.coverImageUrl}
                          alt={game.title}
                          fill
                          sizes="100px"
                          className={styles.thumbImage}
                        />
                      </div>

                      <div className={styles.infoCol}>
                        <div className={styles.titleRow}>
                          <Link href={`/games/${game.slug}`} className={styles.gameTitle}>
                            {game.title}
                          </Link>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleRemove(game.id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className={styles.priceMetaRow}>
                          <span>Current Lowest: <strong style={{ color: 'var(--accent-green)' }}>{formatPrice(currentPrice)}</strong></span>
                          <span>Target Alert: <strong>{formatPrice(targetPrice)}</strong></span>
                        </div>

                        {/* Progress Bar towards Target Price */}
                        <div className={styles.progressWrapper}>
                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{
                                width: `${progressPct}%`,
                                backgroundColor: isMet ? 'var(--accent-green)' : 'var(--accent-cyan)',
                              }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {isMet ? '[TARGET] Target Price Reached!' : `${formatPrice(currentPrice - targetPrice)} above target`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Active Notifications Feed */}
          <section className={styles.section} style={{ marginTop: '2rem' }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Bell size={20} className={styles.iconCyan} /> Alert Dispatch Logs ({logs.length})
              </h2>
            </div>

            <div className={`${styles.logsContainer} glass`}>
              {logs.length === 0 ? (
                <p className={styles.noLogs}>No alert logs generated yet.</p>
              ) : (
                <div className={styles.logsList}>
                  {logs.map(log => (
                    <div key={log.id} className={styles.logItem}>
                      <div className={styles.logIcon}>
                        <CheckCircle2 size={18} color="var(--accent-green)" />
                      </div>
                      <div className={styles.logContent}>
                        <span className={styles.logTitle}>{log.gameTitle}</span>
                        <span className={styles.logMeta}>
                          Price alert triggered at <strong>{formatPrice(log.price)}</strong> via {log.channel} notification.
                        </span>
                      </div>
                      <span className={styles.logTime}>
                        {new Date(log.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Sticky Ad */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <AdSlot type="sidebar" />
            <div className={`${styles.widget} glass`}>
              <h3 className={styles.widgetTitle}>[EPIC] Redis + BullMQ Queue Status</h3>
              <p className={styles.widgetDesc}>
                Mock Worker processes scheduled jobs every hour to compare current storefront prices against user wishlist targets.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
