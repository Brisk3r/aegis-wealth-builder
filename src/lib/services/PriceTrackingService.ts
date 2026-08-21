import { dbRepository } from '@/lib/db';
import { priceAnalyticsService } from './PriceAnalyticsService';
import { PriceHistory, PriceAnalytics } from '@/types/gameHub';

export class PriceTrackingService {
  getPriceHistories(gameId: string): (PriceHistory & { storeName: string; storeId: string })[] {
    return dbRepository.getPriceHistoriesForGame(gameId);
  }

  getGameAnalytics(gameId: string, storeListingId?: string): PriceAnalytics {
    const game = dbRepository.getGameById(gameId);
    if (!game) {
      return {
        allTimeLow: 0,
        historicalAverage: 0,
        isNewAllTimeLow: false,
      };
    }

    const priceHistories = dbRepository.getPriceHistoriesForGame(gameId);
    return priceAnalyticsService.getGameAnalytics(
      game.storeListings || [],
      priceHistories,
      storeListingId
    );
  }

  getAllTimeLow(gameId: string, storeId?: string): { price: number; recordedAt?: string } {
    const histories = dbRepository.getPriceHistoriesForGame(gameId);
    const filtered = storeId ? histories.filter(h => h.storeId === storeId) : histories;
    return priceAnalyticsService.getAllTimeLow(filtered);
  }

  getHistoricalAverage(gameId: string, days: number = 90): number {
    const histories = dbRepository.getPriceHistoriesForGame(gameId);
    return priceAnalyticsService.getHistoricalAverage(histories, days);
  }

  isNewAllTimeLow(storeListingId: string, currentPrice: number): boolean {
    const listing = dbRepository.getStores(); // check repository listing
    const histories = dbRepository.getPriceHistoriesForGame(storeListingId);
    return priceAnalyticsService.isNewAllTimeLow(histories, storeListingId, currentPrice);
  }
}

export const priceTrackingService = new PriceTrackingService();
