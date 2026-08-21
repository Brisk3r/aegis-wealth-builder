"use client";

import styles from "./DealFilter.module.css";
import { PC_STORES_MAP } from "@/lib/aegisPcDeals";

interface DealFilterProps {
  searchTitle: string;
  setSearchTitle: (val: string) => void;
  selectedStore: string;
  setSelectedStore: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  sortBy: string;
  setSortBy: (val: any) => void;
  totalDeals: number;
}

export default function DealFilter({
  searchTitle,
  setSearchTitle,
  selectedStore,
  setSelectedStore,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  totalDeals
}: DealFilterProps) {
  return (
    <div className={`${styles.filterPanel} glass`}>
      <div className={styles.filterHeader}>
        <span className={styles.filterIcon}>[FIND]</span>
        <h3 className={styles.filterTitle}>Filter PC Deals</h3>
        <span className={styles.countBadge}>{totalDeals} PC Deals Found</span>
      </div>

      {/* Search Input */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Game Title Search</label>
        <input
          type="text"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          placeholder="e.g. Cyberpunk, Elden Ring, Witcher..."
          className={styles.textInput}
        />
      </div>

      {/* Storefront Selector */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>PC Digital Storefront</label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">[PC] All PC Digital Stores</option>
          {Object.entries(PC_STORES_MAP).map(([id, info]) => (
            <option key={id} value={id}>
              {info.icon} {info.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Threshold Slider */}
      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Max Price Ceiling</label>
          <span className={styles.priceVal}>{maxPrice >= 60 ? "Any Price" : `$${maxPrice}`}</span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className={styles.rangeSlider}
        />
        <div className={styles.presetButtons}>
          <button onClick={() => setMaxPrice(5)} className={styles.presetBtn}>Under $5</button>
          <button onClick={() => setMaxPrice(10)} className={styles.presetBtn}>Under $10</button>
          <button onClick={() => setMaxPrice(20)} className={styles.presetBtn}>Under $20</button>
          <button onClick={() => setMaxPrice(60)} className={styles.presetBtn}>All Prices</button>
        </div>
      </div>

      {/* Sort By Selector */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.selectInput}
        >
          <option value="Deal Rating">* Aegis Index (Best Value)</option>
          <option value="Savings">[HOT] Highest Discount %</option>
          <option value="Price">[$] Lowest Price</option>
          <option value="Metacritic">[TARGET] Metacritic Score</option>
          <option value="Title">** Alphabetical Title</option>
        </select>
      </div>
    </div>
  );
}
