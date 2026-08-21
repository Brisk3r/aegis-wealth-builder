"use client";

import { useEffect, useState } from "react";
import LootCard from "@/components/giveaways/LootCard";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./giveaways.module.css";
import { getAegisGiveaways } from "@/lib/aegisEngine";

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    async function loadGiveaways() {
      setLoading(true);
      try {
        const aegisNative = await getAegisGiveaways();
        const res = await fetch(`/api/giveaways?platform=${platform}&type=${type}&sortBy=date`);
        const fallbackData = await res.json();
        
        const combined = Array.isArray(fallbackData) && fallbackData.length > 0 
          ? [...aegisNative, ...fallbackData] 
          : aegisNative;

        let filtered = combined;
        if (platform !== "all") {
          filtered = filtered.filter(g => (g.platforms || "").toLowerCase().includes(platform.toLowerCase()));
        }
        if (type !== "all") {
          filtered = filtered.filter(g => (g.type || "").toLowerCase().includes(type.toLowerCase()));
        }

        setGiveaways(filtered);
      } catch (err) {
        console.error("Failed to fetch giveaways page data:", err);
        const aegisNative = await getAegisGiveaways();
        setGiveaways(aegisNative);
      } finally {
        setLoading(false);
      }
    }

    loadGiveaways();
  }, [platform, type]);

  const platforms = [
    { id: "all", label: "[GLOBAL] All Platforms" },
    { id: "pc", label: "[PC] PC" },
    { id: "epic", label: "[EPIC] Epic Games" },
    { id: "steam", label: "[GAME] Steam" },
    { id: "gog", label: "[GOG] GOG" },
    { id: "playstation", label: "[GAME] PlayStation" },
    { id: "xbox", label: "** Xbox" },
  ];

  return (
    <div className={styles.container}>
      {/* Header Title Bar */}
      <section className={`${styles.pageHeader} glass`}>
        <div className={styles.headerTitleCol}>
          <span className="badge badge-green">[GIFT] AEGIS LOOT RADAR</span>
          <h1 className={styles.title}>100% Free Games & Loot Drops</h1>
          <p className={styles.subtitle}>
            Claim permanent free games, DLC packs, beta access keys, and free weekends across all major platforms.
          </p>
        </div>
      </section>

      {/* Filter Tabs Bar */}
      <div className={`${styles.filterBar} glass`}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Platform:</span>
          <div className={styles.tabList}>
            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`${styles.tabBtn} ${platform === p.id ? styles.activeTab : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type:</span>
          <div className={styles.tabList}>
            {["all", "game", "dlc", "early access"].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`${styles.tabBtn} ${type === t ? styles.activeTab : ""}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout: Main Loot Grid + Architectural Sidebar Ad */}
      <div className="content-with-sidebar">
        <div className={styles.lootSection}>
          {loading ? (
            <div className={styles.loadingGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`${styles.skeletonCard} glass`} />
              ))}
            </div>
          ) : giveaways.length === 0 ? (
            <div className={`${styles.emptyState} glass`}>
              <span style={{ fontSize: "3rem" }}>[GIFT]</span>
              <h3>No free giveaways found for this combination</h3>
              <p>Try selecting 'All Platforms' or 'All Types'.</p>
            </div>
          ) : (
            <div className={styles.lootGrid}>
              {giveaways.map((giveaway, idx) => (
                <LootCard key={giveaway.id || idx} giveaway={giveaway} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            {/* Mandatory Architectural Sticky Sidebar Ad */}
            <AdSlot type="sidebar" />

            {/* Platform Loot Info Widget */}
            <div className={`${styles.widget} glass`}>
              <h3 className={styles.widgetTitle}>[INFO] How Loot Claiming Works</h3>
              <p className={styles.widgetText}>
                All giveaways listed on Aegis Gaming Hub are 100% legal, official promotional drops directly from store providers (Epic Games, Steam, GOG, Prime Gaming).
              </p>
              <ul className={styles.widgetBullets}>
                <li>* Free-to-keep games stay in your library forever once claimed.</li>
                <li>* Free Weekends allow full play during promotional windows.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
