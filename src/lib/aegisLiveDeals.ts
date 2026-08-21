import { AegisGame } from "./aegisEngine";
import { AEGIS_PC_DEALS_CATALOG, getAegisPcDeals } from "./aegisPcDeals";

/**
 * First-Party Aegis PC Deals Engine
 * Server-side PC deal fetcher and aggregator.
 */
export async function fetchAegisLiveDeals(options?: {
  platform?: string;
  maxPrice?: number;
  minDiscount?: number;
  historicalLowOnly?: boolean;
  search?: string;
  sortBy?: "discount" | "price" | "rating" | "release";
}): Promise<AegisGame[]> {
  try {
    let deals = getAegisPcDeals({
      store: options?.platform,
      maxPrice: options?.maxPrice,
      minDiscount: options?.minDiscount,
      search: options?.search
    });

    if (options?.sortBy) {
      switch (options.sortBy) {
        case "discount":
          deals.sort((a, b) => b.discountPercent - a.discountPercent);
          break;
        case "price":
          deals.sort((a, b) => a.currentPriceUSD - b.currentPriceUSD);
          break;
        case "rating":
          deals.sort((a, b) => b.metacriticScore - a.metacriticScore);
          break;
      }
    }

    return deals;
  } catch (err) {
    console.warn("Aegis Live PC Deals fetch error:", err);
  }

  return AEGIS_PC_DEALS_CATALOG;
}
