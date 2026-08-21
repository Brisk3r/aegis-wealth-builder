"use client";

import { useEffect, useState } from "react";
import NewsCard from "@/components/news/NewsCard";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./news.module.css";
import { NewsArticle, NEWS_SOURCES } from "@/utils/news";
import { getAegisNews } from "@/lib/aegisEngine";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const aegisNative = await getAegisNews();
        
        // Deduplicate articles by unique ID
        const articleMap = new Map<string, any>();
        aegisNative.forEach(item => articleMap.set(item.id, item));

        let list = Array.from(articleMap.values());

        if (selectedSource !== "all") {
          list = list.filter(a => (a.source || "").toLowerCase().includes(selectedSource.toLowerCase()));
        }
        if (selectedCategory !== "all") {
          list = list.filter(a => (a.category || "").toLowerCase().includes(selectedCategory.toLowerCase()));
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          list = list.filter(a => (a.title || "").toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q));
        }

        setArticles(list as any[]);
      } catch (err) {
        console.error("Failed to fetch news page data:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadNews();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedSource, selectedCategory, searchQuery]);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Hardware", label: "[PC] Hardware" },
    { id: "PC Gaming", label: "*** PC Gaming" },
    { id: "Console", label: "[GAME] Console" },
    { id: "Esports", label: "[TOP] Esports" },
    { id: "Industry", label: "[GLOBAL] Industry" },
  ];

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.headerTitleCol}>
          <span className="badge badge-blue">** AEGIS NEWS RADAR</span>
          <h1 className={styles.title}>Gaming News & Editorial Radar</h1>
          <p className={styles.subtitle}>
            Real-time tech breakdowns, hardware benchmarks, patch notes & industry coverage from top outlets.
          </p>
        </div>
      </section>

      {/* Control & Search Bar */}
      <div className={styles.controlBar}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>[FIND]</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news titles or keywords..."
            className={styles.searchInput}
          />
        </div>

        {/* Categories Tabs */}
        <div className={styles.tabRow}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`${styles.categoryBtn} ${selectedCategory === c.id ? styles.activeCategory : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Main News Stream + Sidebar Controls & Architectural Sidebar Ad */}
      <div className="content-with-sidebar">
        <div className={styles.newsSection}>
          {loading ? (
            <div className={styles.loadingGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`${styles.skeletonCard} glass`} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className={`${styles.emptyState} glass`}>
              <span style={{ fontSize: "3rem" }}>**</span>
              <h3>No news articles match your search</h3>
              <p>Try modifying your keyword or switching outlet filters.</p>
            </div>
          ) : (
            <div className={styles.newsGrid}>
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            {/* Outlet Filter Widget */}
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>** News Outlets</h3>
              <div className={styles.outletList}>
                {NEWS_SOURCES.map(src => (
                  <button
                    key={src.id}
                    onClick={() => setSelectedSource(src.id)}
                    className={`${styles.outletBtn} ${selectedSource === src.id ? styles.activeOutlet : ""}`}
                  >
                    <span>{src.name}</span>
                    {selectedSource === src.id && <span className={styles.activeCheck}>[OK]</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Architectural Sticky Sidebar Ad */}
            <AdSlot type="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
