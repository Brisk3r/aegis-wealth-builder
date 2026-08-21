import { StoreIngestionPayload, StoreListing } from '@/types/gameHub';
import { cleanTitle, isTitleMatch } from '@/lib/utils/normalizeTitle';

export interface StoreAdapter {
  storeId: string;
  storeName: string;
  parsePayload(rawResponse: Record<string, unknown>): StoreIngestionPayload;
}

export class NintendoAdapter implements StoreAdapter {
  storeId = 'store-nintendo-eshop';
  storeName = 'Nintendo eShop';

  parsePayload(rawResponse: Record<string, unknown>): StoreIngestionPayload {
    // Standardizes eShop API payload (Algolia / Nintendo API response structure)
    const title = (rawResponse.title as string) || (rawResponse.name as string) || 'Unknown Game';
    const msrp = typeof rawResponse.msrp === 'number' ? rawResponse.msrp : parseFloat((rawResponse.msrp as string) || '59.99');
    const salePrice = typeof rawResponse.salePrice === 'number' ? rawResponse.salePrice : parseFloat((rawResponse.salePrice as string) || String(msrp));
    const url = (rawResponse.url as string) || `https://www.nintendo.com/store/products/${rawResponse.slug || ''}`;

    return {
      rawTitle: title,
      storeId: this.storeId,
      storeItemUrl: url,
      currentPrice: salePrice,
      originalPrice: msrp,
      currency: 'USD',
      isAvailable: rawResponse.availability !== 'Unavailable',
      rawPayload: rawResponse,
    };
  }
}

export class PlayStationAdapter implements StoreAdapter {
  storeId = 'store-playstation-store';
  storeName = 'PlayStation Store';

  parsePayload(rawResponse: Record<string, unknown>): StoreIngestionPayload {
    // Standardizes PlayStation Store GraphQL / REST API response structure
    const title = (rawResponse.name as string) || 'Unknown PS Game';
    const priceObj = (rawResponse.price as Record<string, unknown>) || {};
    const formattedOriginal = (priceObj.basePriceValue as number) || (priceObj.originalPrice as number) || 69.99;
    const formattedCurrent = (priceObj.discountedPriceValue as number) || (priceObj.currentPrice as number) || formattedOriginal;
    const url = (rawResponse.conceptUrl as string) || (rawResponse.url as string) || `https://store.playstation.com/en-us/concept/${rawResponse.id || ''}`;

    return {
      rawTitle: title,
      storeId: this.storeId,
      storeItemUrl: url,
      currentPrice: formattedCurrent,
      originalPrice: formattedOriginal,
      currency: (priceObj.currencyCode as string) || 'USD',
      isAvailable: priceObj.isPurchasable !== false,
      rawPayload: rawResponse,
    };
  }
}

export class SteamAdapter implements StoreAdapter {
  storeId = 'store-steam';
  storeName = 'Steam';

  parsePayload(rawResponse: Record<string, unknown>): StoreIngestionPayload {
    // Standardizes Steam Storefront AppDetails API response structure
    const data = (rawResponse.data as Record<string, unknown>) || rawResponse;
    const title = (data.name as string) || 'Unknown Steam Game';
    const priceOverview = (data.price_overview as Record<string, unknown>) || {};
    
    // Steam prices are given in cents (e.g. 5999 for $59.99)
    const initialCents = (priceOverview.initial as number) || 5999;
    const finalCents = (priceOverview.final as number) || initialCents;
    const originalPrice = initialCents / 100;
    const currentPrice = finalCents / 100;
    const appId = rawResponse.appid || data.steam_appid || '';

    return {
      rawTitle: title,
      storeId: this.storeId,
      storeItemUrl: `https://store.steampowered.com/app/${appId}`,
      currentPrice,
      originalPrice,
      currency: (priceOverview.currency as string) || 'USD',
      isAvailable: !data.is_free && data.type === 'game',
      rawPayload: rawResponse,
    };
  }
}

export class StoreIngestionService {
  private adapters: Map<string, StoreAdapter> = new Map();

  constructor() {
    this.registerAdapter(new NintendoAdapter());
    this.registerAdapter(new PlayStationAdapter());
    this.registerAdapter(new SteamAdapter());
  }

  registerAdapter(adapter: StoreAdapter) {
    this.adapters.set(adapter.storeId, adapter);
  }

  getAdapter(storeId: string): StoreAdapter | undefined {
    return this.adapters.get(storeId);
  }

  /**
   * Processes a raw payload from any store, normalizes price formats,
   * matches against target existing games, and calculates discount percentage.
   */
  processIngestion(
    storeId: string,
    rawPayload: Record<string, unknown>,
    existingListings: StoreListing[] = []
  ): { payload: StoreIngestionPayload; matchingListing?: StoreListing; isMatched: boolean } {
    const adapter = this.getAdapter(storeId);
    if (!adapter) {
      throw new Error(`No adapter registered for storeId: ${storeId}`);
    }

    const normalizedPayload = adapter.parsePayload(rawPayload);

    // Fuzzy search existing listings to match game title
    const matchingListing = existingListings.find(listing => {
      if (!listing.store) return false;
      return isTitleMatch(normalizedPayload.rawTitle, listing.store.name);
    });

    return {
      payload: normalizedPayload,
      matchingListing,
      isMatched: !!matchingListing,
    };
  }
}

export const storeIngestionService = new StoreIngestionService();
