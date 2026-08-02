"use client";

import { useState } from "react";
import styles from "./Editor.module.css";
import Image from "next/image";

interface SidebarProps {
  onSelectSvg: (svg: string) => void;
}

const PRESET_SVGS = [
  {
    name: "Layer Stack",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
  },
  {
    name: "Sparkles",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
  },
  {
    name: "Shield Zap",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m13 10-3 5h3l-1 4 4-5h-3z"/></svg>`
  },
  {
    name: "Code Terminal",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`
  },
  {
    name: "Heart Pulse",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14"/></svg>`
  },
  {
    name: "Settings Gear",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
  }
];

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
      <h2 className={styles.sidebarTitle}>SVG Vector Library</h2>
      <p className={styles.sidebarDesc}>Instant offline presets & online icon repository search.</p>

      {/* Preset Vectors Row */}
      <div style={{ marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
          Instant Presets:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
          {PRESET_SVGS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSelectSvg(preset.svg)}
              className={styles.iconButton}
              title={preset.name}
              style={{ padding: "0.4rem" }}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: preset.svg }} 
                style={{ width: "20px", height: "20px", color: "#a5b4fc", display: "flex", alignItems: "center", justifyContent: "center" }}
              />
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input 
          type="text" 
          placeholder="Search 10,000+ icons (e.g. arrow)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>Search</button>
      </form>

      <div className={styles.resultsGrid}>
        {loading ? (
          <p className={styles.muted}>Loading vector repository...</p>
        ) : (
          results.map((icon) => (
            <button 
              key={icon} 
              className={styles.iconButton}
              onClick={() => loadSvg(icon)}
              title={icon}
            >
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
