import { PriceHistory, StoreListing, PriceAnalytics } from '@/types/gameHub';

export class PriceAnalyticsService {
  /**
   * Computes the all-time low price recorded for a given game across all store listings
   * or for a specific store if storeId is provided.
   */
  getAllTimeLow(
    priceHistories: PriceHistory[],
    storeListingId?: string
  ): { price: number; recordedAt?: string } {
    const relevantLogs = storeListingId
      ? priceHistories.filter(log => log.storeListingId === storeListingId)
      : priceHistories;

    if (relevantLogs.length === 0) {
      return { price: 0 };
    }

    const sortedLogs = [...relevantLogs].sort((a, b) => a.price - b.price);
    const lowest = sortedLogs[0];

    return {
      price: lowest.price,
      recordedAt: lowest.recordedAt,
    };
  }

  /**
   * Computes the moving average historical price for a game over the last N days.
   */
  getHistoricalAverage(
    priceHistories: PriceHistory[],
    days: number = 90
  ): number {
    if (priceHistories.length === 0) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodLogs = priceHistories.filter(
      log => new Date(log.recordedAt) >= cutoffDate
    );

    const targetLogs = periodLogs.length > 0 ? periodLogs : priceHistories;
    const sum = targetLogs.reduce((acc, log) => acc + log.price, 0);

    return parseFloat((sum / targetLogs.length).toFixed(2));
  }

  /**
   * Checks if a new current price constitutes a brand-new all-time low for the store listing.
   */
  isNewAllTimeLow(
    pastHistories: PriceHistory[],
    storeListingId: string,
    currentPrice: number
  ): boolean {
    const listingHistories = pastHistories.filter(
      log => log.storeListingId === storeListingId
    );

    if (listingHistories.length === 0) {
      return true; // First recorded price is technically the initial baseline
    }

    const previousMin = Math.min(...listingHistories.map(h => h.price));
    return currentPrice < previousMin;
  }

  /**
   * Returns a comprehensive price analytics report for a game given its store listings and price logs.
   */
  getGameAnalytics(
    storeListings: StoreListing[],
    priceHistories: PriceHistory[],
    targetStoreListingId?: string
  ): PriceAnalytics {
    const allTimeLow = this.getAllTimeLow(priceHistories, targetStoreListingId);
    const avg90 = this.getHistoricalAverage(priceHistories, 90);
    
    let isNewLow = false;
    if (targetStoreListingId) {
      const activeListing = storeListings.find(l => l.id === targetStoreListingId);
      if (activeListing) {
        isNewLow = this.isNewAllTimeLow(priceHistories, targetStoreListingId, activeListing.currentPrice);
      }
    }

    return {
      allTimeLow: allTimeLow.price,
      allTimeLowRecordedAt: allTimeLow.recordedAt,
      historicalAverage: avg90,
      isNewAllTimeLow: isNewLow,
    };
  }
}

export const priceAnalyticsService = new PriceAnalyticsService();
