import { dbRepository } from '@/lib/db';
import { wishlistService } from '@/lib/services/WishlistService';
import { storeIngestionService } from '@/lib/services/StoreIngestionService';
import { NotificationLog } from '@/types/gameHub';

export interface BackgroundJobResult {
  jobId: string;
  queueName: string;
  status: 'COMPLETED' | 'FAILED';
  processedCount: number;
  logs: string[];
  generatedNotifications?: NotificationLog[];
  timestamp: string;
}

/**
 * PriceScraperWorker (Simulates Redis + BullMQ Queue worker for scheduled price scraping)
 */
export class PriceScraperWorker {
  async processJob(jobId: string = `job-scrape-${Date.now()}`): Promise<BackgroundJobResult> {
    const logs: string[] = [];
    logs.push(`[PriceScraperWorker] Starting job ${jobId}`);

    const stores = dbRepository.getStores();
    logs.push(`[PriceScraperWorker] Polling ${stores.length} connected storefront adapters...`);

    let updatedCount = 0;
    // Simulate updating price for demo listings
    const result = dbRepository.updateListingPrice('list-totk-nintendo', 44.99);
    if (result) {
      updatedCount++;
      logs.push(`[PriceScraperWorker] Updated Nintendo eShop TOTK price to $44.99`);
    }

    logs.push(`[PriceScraperWorker] Completed job ${jobId} successfully.`);

    return {
      jobId,
      queueName: 'price-scraper-queue',
      status: 'COMPLETED',
      processedCount: updatedCount,
      logs,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * AlertQueueWorker (Simulates Redis + BullMQ Queue worker for evaluation of user price alerts)
 */
export class AlertQueueWorker {
  async processJob(
    gameId: string = 'game-zelda-totk',
    price: number = 44.99,
    isAllTimeLow: boolean = true,
    jobId: string = `job-alert-${Date.now()}`
  ): Promise<BackgroundJobResult> {
    const logs: string[] = [];
    logs.push(`[AlertQueueWorker] Starting job ${jobId} for gameId=${gameId} price=$${price}`);

    const createdLogs = wishlistService.evaluatePriceDrop(gameId, price, isAllTimeLow);
    logs.push(`[AlertQueueWorker] Dispatched ${createdLogs.length} notifications (EMAIL/PUSH).`);

    return {
      jobId,
      queueName: 'wishlist-alerts-queue',
      status: 'COMPLETED',
      processedCount: createdLogs.length,
      logs,
      generatedNotifications: createdLogs,
      timestamp: new Date().toISOString(),
    };
  }
}

export const priceScraperWorker = new PriceScraperWorker();
export const alertQueueWorker = new AlertQueueWorker();
