"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./games.module.css";
import { getAegisDeals, AegisGame } from "@/lib/aegisEngine";
import { useCurrency } from "@/context/CurrencyContext";

interface UpcomingGame {
  id: string;
  title: string;
  releaseDate: string;
  platform: string;
  developer: string;
  genre: string;
  status: string;
  image: string;
}

const UPCOMING_GAMES: UpcomingGame[] = [
  {
    id: "up-1",
    title: "Grand Theft Auto VI",
    releaseDate: "Q3 2025",
    platform: "PS5, Xbox Series X|S, PC",
    developer: "Rockstar Games",
    genre: "Open World Action",
    status: "Highly Anticipated",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg"
  },
  {
    id: "up-2",
    title: "Monster Hunter Wilds",
    releaseDate: "Feb 28, 2025",
    platform: "PC, PS5, Xbox Series X|S",
    developer: "Capcom",
    genre: "Action RPG",
    status: "Pre-Orders Open",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg"
  },
  {
    id: "up-3",
    title: "Death Stranding 2: On the Beach",
    releaseDate: "Late 2025",
    platform: "PS5, PC",
    developer: "Kojima Productions",
    genre: "Action Adventure",
    status: "In Development",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg"
  },
  {
    id: "up-4",
    title: "Metroid Prime 4: Beyond",
    releaseDate: "2025",
    platform: "Nintendo Switch",
    developer: "Retro Studios / Nintendo",
    genre: "First-Person Adventure",
    status: "Trailer Released",
    image: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,dpr_2.0,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/m/metroid-prime-4-beyond-switch/hero"
  },
  {
    id: "up-5",
    title: "Black Myth: Wukong",
    releaseDate: "Available Now",
    platform: "PC, PS5, Xbox Series X|S",
    developer: "Game Science",
    genre: "Action RPG",
    status: "Top Seller",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg"
  },
  {
    id: "up-6",
    title: "Helldivers 2",
    releaseDate: "Available Now",
    platform: "PC, PS5",
    developer: "Arrowhead Game Studios",
    genre: "Co-Op Shooter",
    status: "Live Service Leader",
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg"
  }
];

export default function GamesPage() {
  const { formatPrice, currency } = useCurrency();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [savedGames, setSavedGames] = useState<AegisGame[]>([]);
  const [activeTab, setActiveTab] = useState<"releases" | "wishlist">("releases");

  useEffect(() => {
    const saved = localStorage.getItem("aegis_wishlist");
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setWishlistIds(ids);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    async function loadWishlistGames() {
      try {
        const allDeals = await getAegisDeals();
        if (wishlistIds.length === 0) {
          setSavedGames(allDeals.slice(0, 3)); // Display featured sample if empty
        } else {
          const matched = allDeals.filter(d => wishlistIds.includes(d.id));
          setSavedGames(matched.length > 0 ? matched : allDeals.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading wishlist games:", err);
      }
    }

    loadWishlistGames();
  }, [wishlistIds]);

  const removeWishlist = (id: string) => {
    const updated = wishlistIds.filter(item => item !== id);
    setWishlistIds(updated);
    localStorage.setItem("aegis_wishlist", JSON.stringify(updated));
  };

  const totalSavedValueUSD = savedGames.reduce((acc, game) => {
    return acc + (game.msrpPriceUSD - game.currentPriceUSD);
  }, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={`${styles.pageHeader} glass`}>
        <div className={styles.headerTitleCol}>
          <span className="badge badge-cyan">** AEGIS GAME TELEMETRY & WISHLIST</span>
          <h1 className={styles.title}>Release Radar & Saved Price Watcher</h1>
          <p className={styles.subtitle}>
            Track upcoming AAA game launches and manage your personalized deal price drop alerts in {currency.code}.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className={`${styles.tabBar} glass`}>
        <button
          onClick={() => setActiveTab("releases")}
          className={`${styles.tabBtn} ${activeTab === "releases" ? styles.activeTab : ""}`}
        >
          [+] Upcoming Release Radar ({UPCOMING_GAMES.length})
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`${styles.tabBtn} ${activeTab === "wishlist" ? styles.activeTab : ""}`}
        >
          ** Saved Wishlist Watcher ({savedGames.length})
        </button>
      </div>

      <div className="content-with-sidebar">
        <div className={styles.mainContent}>
          {activeTab === "releases" ? (
            <div className={styles.releasesGrid}>
              {UPCOMING_GAMES.map((game) => (
                <div key={game.id} className={`${styles.releaseCard} glass`}>
                  <div className={styles.cardImageWrapper}>
                    <img src={game.image} alt={game.title} className={styles.cardImg} />
                    <span className={styles.statusBadge}>{game.status}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.genreTag}>{game.genre}</span>
                      <span className={styles.dateTag}>*** {game.releaseDate}</span>
                    </div>
                    <h3 className={styles.gameTitle}>{game.title}</h3>
                    <p className={styles.developerText}>Developer: {game.developer}</p>
                    <p className={styles.platformText}>Platforms: {game.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.wishlistSection}>
              {/* Savings Meter Header */}
              <div className={`${styles.savingsMeter} glass`}>
                <div className={styles.meterCol}>
                  <span className={styles.meterTitle}>Potential Wishlist Savings ({currency.code})</span>
                  <span className={styles.meterNum}>{formatPrice(totalSavedValueUSD)}</span>
                </div>
                <div className={styles.meterBadge}>
                  {savedGames.length} Deal Alerts Active
                </div>
              </div>

              {savedGames.length === 0 ? (
                <div className={`${styles.emptyWishlist} glass`}>
                  <span style={{ fontSize: "3rem" }}>**</span>
                  <h3>Your Wishlist is Empty</h3>
                  <p>Browse the Game Deals section and click the heart icon to save price drops here!</p>
                  <Link href="/deals" className="btn-primary" style={{ marginTop: "0.75rem" }}>
                    Browse Game Deals *
                  </Link>
                </div>
              ) : (
                <div className={styles.wishlistGrid}>
                  {savedGames.map((game) => {
                    return (
                      <div key={game.id} className={`${styles.wishlistCard} glass`}>
                        <img src={game.coverImage} alt={game.title} className={styles.wishlistThumb} />
                        <div className={styles.wishlistInfo}>
                          <h4 className={styles.wishlistTitle}>{game.title}</h4>
                          <span className={styles.wishlistStore}>{game.primaryStoreIcon} {game.primaryStore}</span>
                        </div>
                        <div className={styles.wishlistPrices}>
                          <span className={styles.wishlistSale}>{formatPrice(game.currentPriceUSD)}</span>
                          <span className={styles.wishlistNormal}>{formatPrice(game.msrpPriceUSD)}</span>
                        </div>
                        <div className={styles.wishlistActions}>
                          <a
                            href={game.affiliateUrl || game.directStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                          >
                            Buy Deal *
                          </a>
                          <button
                            onClick={() => removeWishlist(game.id)}
                            className={styles.removeBtn}
                            title="Remove from wishlist"
                          >
                            ***
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            {/* Mandatory Architectural Sticky Sidebar Ad */}
            <AdSlot type="sidebar" />

            <div className={`${styles.widget} glass`}>
              <h3 className={styles.widgetTitle}>[PC] System Specs Checker</h3>
              <p className={styles.widgetDesc}>
                Quick check if your rig meets upcoming AAA requirements:
              </p>
              <div className={styles.specChecklist}>
                <div className={styles.specItem}>
                  <span>GPU Target:</span>
                  <span className={styles.cyanVal}>RTX 3060 / RX 6700</span>
                </div>
                <div className={styles.specItem}>
                  <span>RAM Recommendation:</span>
                  <span className={styles.cyanVal}>16GB / 32GB DDR5</span>
                </div>
                <div className={styles.specItem}>
                  <span>Storage:</span>
                  <span className={styles.cyanVal}>NVMe SSD Required</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
