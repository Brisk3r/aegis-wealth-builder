/**
 * Official Steam Storefront Regional Price Integration
 * Fetches real-time localized currency prices directly from Steam Web API.
 */

export interface SteamRegionalPrice {
  appId: string;
  currency: string;
  initialPriceFormatted: string; // e.g. "A$ 89.95"
  finalPriceFormatted: string;   // e.g. "A$ 62.96"
  initialPriceVal: number;
  finalPriceVal: number;
  discountPercent: number;
  isSale: boolean;
}

const STEAM_APP_MAP: Record<string, string> = {
  "balders-gate-3": "1086940",
  "elden-ring": "1245620",
  "cyberpunk-2077-ultimate": "1091500",
  "black-myth-wukong": "2358720",
  "helldivers-2": "553850",
};

/**
 * Fetch live regional pricing directly from Steam API for a given country code (e.g. "AU", "US", "GB", "DE")
 */
export async function fetchSteamRegionalPrice(appId: string, countryCode: string = "AU"): Promise<SteamRegionalPrice | null> {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${countryCode}&filters=price_overview`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (res.ok) {
      const data = await res.json();
      const appData = data[appId];

      if (appData && appData.success && appData.data && appData.data.price_overview) {
        const overview = appData.data.price_overview;
        const initialVal = overview.initial / 100;
        const finalVal = overview.final / 100;

        return {
          appId,
          currency: overview.currency,
          initialPriceFormatted: overview.initial_formatted || `$${initialVal.toFixed(2)}`,
          finalPriceFormatted: overview.final_formatted || `$${finalVal.toFixed(2)}`,
          initialPriceVal: initialVal,
          finalPriceVal: finalVal,
          discountPercent: overview.discount_percent || 0,
          isSale: overview.discount_percent > 0
        };
      }
    }
  } catch (err) {
    console.warn(`Steam price fetch failed for app ${appId}:`, err);
  }

  return null;
}
