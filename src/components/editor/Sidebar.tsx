"use client";

import { useState } from "react";
import styles from "./Editor.module.css";

import Image from "next/image";

interface SidebarProps {
  onSelectSvg: (svg: string) => void;
}

export default function Sidebar({ onSelectSvg }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=36`);
      const data = await res.json();
      setResults(data.icons || []);
    } catch (error) {
      console.error("Failed to fetch icons", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSvg = async (icon: string) => {
    try {
      const [prefix, name] = icon.split(":");
      const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
      const svgText = await res.text();
      onSelectSvg(svgText);
    } catch (error) {
      console.error("Failed to load SVG", error);
    }
  };

  return (
    <aside className={`${styles.sidebar} glass`}>
      <h2 className={styles.sidebarTitle}>SVG Library</h2>
      <p className={styles.sidebarDesc}>Search open-source icon repositories.</p>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input 
          type="text" 
          placeholder="Search icons (e.g., arrow)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>Search</button>
      </form>
      <div className={styles.resultsGrid}>
        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : (
          results.map((icon) => (
            <button 
              key={icon} 
              className={styles.iconButton}
              onClick={() => loadSvg(icon)}
              title={icon}
            >
              {/* Using white as a base color for the preview to be visible in dark mode */}
              <Image 
                src={`https://api.iconify.design/${icon.replace(':', '/')}.svg?color=white`} 
                alt={icon} 
                width={24} 
                height={24} 
                unoptimized
              />
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
