import { buildAffiliateUrl } from "./affiliate";
import { AegisGame } from "./aegisEngine";

export interface PcDealOption {
  storeName: string;
  storeIcon: string;
  priceUSD: number;
  msrpUSD: number;
  discountPercent: number;
  directUrl: string;
  affiliateUrl: string;
  isStockAvailable: boolean;
}

export const PC_STORES_MAP: Record<string, { name: string; icon: string; domain: string }> = {
  steam: { name: "Steam Store", icon: "[GAME]", domain: "store.steampowered.com" },
  gog: { name: "GOG.com (DRM-Free)", icon: "[GOG]", domain: "gog.com" },
  epic: { name: "Epic Games Store", icon: "[EPIC]", domain: "store.epicgames.com" },
  humble: { name: "Humble Store", icon: "[BOX]", domain: "humblebundle.com" },
  fanatical: { name: "Fanatical", icon: "[HOT]", domain: "fanatical.com" },
};

/**
 * Native First-Party Aegis PC Deals Catalog
 * Exclusively PC & Steam Deck Verified Gaming Deals.
 */
export const AEGIS_PC_DEALS_CATALOG: AegisGame[] = [
  {
    id: "pc-deal-1",
    slug: "cyberpunk-2077-ultimate",
    title: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    platforms: ["PC", "Steam Deck"],
    primaryStore: "Steam Store",
    primaryStoreIcon: "[GAME]",
    currentPriceUSD: 29.99,
    msrpPriceUSD: 59.99,
    discountPercent: 50,
    isHistoricalLow: true,
    historicalLowUSD: 29.99,
    metacriticScore: 89,
    userRating: 4.7,
    releaseDate: "2020-12-10",
    publisher: "CD PROJEKT RED",
    developer: "CD PROJEKT RED",
    description: "An open-world action RPG set in Night City. Enhanced with Ray Tracing Overdrive and DLSS 3.5 support.",
    directStoreUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1091500/Cyberpunk_2077/", "steam"),
    priceHistory: [
      { date: "2023-01", priceUSD: 59.99 },
      { date: "2023-11", priceUSD: 39.99 },
      { date: "2024-07", priceUSD: 29.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store (Live Deal)", storeIcon: "[GAME]", priceUSD: 29.99, msrpUSD: 59.99, discountPercent: 50, directUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1091500/Cyberpunk_2077/", "steam"), isStockAvailable: true },
      { storeName: "Epic Games Store", storeIcon: "[EPIC]", priceUSD: 32.99, msrpUSD: 59.99, discountPercent: 45, directUrl: "https://store.epicgames.com", affiliateUrl: buildAffiliateUrl("https://store.epicgames.com", "epic"), isStockAvailable: true },
      { storeName: "GOG.com (DRM-Free)", storeIcon: "[GOG]", priceUSD: 59.99, msrpUSD: 59.99, discountPercent: 0, directUrl: "https://www.gog.com/en/game/cyberpunk_2077", affiliateUrl: buildAffiliateUrl("https://www.gog.com/en/game/cyberpunk_2077", "gog"), isStockAvailable: true }
    ],
    tags: ["PC Deal", "Cyberpunk", "Steam Deck Verified", "Ray Tracing"]
  },
  {
    id: "pc-deal-2",
    slug: "elden-ring",
    title: "Elden Ring",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    platforms: ["PC", "Steam Deck"],
    primaryStore: "Steam Store",
    primaryStoreIcon: "[GAME]",
    currentPriceUSD: 39.99,
    msrpPriceUSD: 59.99,
    discountPercent: 33,
    isHistoricalLow: true,
    historicalLowUSD: 39.99,
    metacriticScore: 96,
    userRating: 4.9,
    releaseDate: "2022-02-25",
    publisher: "Bandai Namco",
    developer: "FromSoftware",
    description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring on PC & Steam Deck.",
    directStoreUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1245620/ELDEN_RING/", "steam"),
    priceHistory: [
      { date: "2023-01", priceUSD: 59.99 },
      { date: "2023-12", priceUSD: 41.99 },
      { date: "2024-06", priceUSD: 39.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store", storeIcon: "[GAME]", priceUSD: 39.99, msrpUSD: 59.99, discountPercent: 33, directUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1245620/ELDEN_RING/", "steam"), isStockAvailable: true },
      { storeName: "Humble Store", storeIcon: "[BOX]", priceUSD: 42.99, msrpUSD: 59.99, discountPercent: 28, directUrl: "https://www.humblebundle.com/store/elden-ring", affiliateUrl: buildAffiliateUrl("https://www.humblebundle.com/store/elden-ring", "humble"), isStockAvailable: true }
    ],
    tags: ["PC Deal", "Souls-like", "Steam Deck Verified", "GOTY Winner"]
  },
  {
    id: "pc-deal-3",
    slug: "balders-gate-3",
    title: "Baldur's Gate 3",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    platforms: ["PC", "Steam Deck"],
    primaryStore: "Steam Store",
    primaryStoreIcon: "[GAME]",
    currentPriceUSD: 41.15,
    msrpPriceUSD: 58.79,
    discountPercent: 30,
    isHistoricalLow: true,
    historicalLowUSD: 41.15,
    metacriticScore: 96,
    userRating: 4.9,
    releaseDate: "2023-08-03",
    publisher: "Larian Studios",
    developer: "Larian Studios",
    description: "Gather your party and return to the Forgotten Realms in Larian Studios' masterwork RPG. Live Steam Weekend Deal -30% OFF!",
    directStoreUrl: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", "steam"),
    priceHistory: [
      { date: "2023-08", priceUSD: 58.79 },
      { date: "2024-05", priceUSD: 47.00 },
      { date: "2026-08", priceUSD: 41.15 },
    ],
    storeOptions: [
      { storeName: "Steam Store (Weekend Deal -30%)", storeIcon: "[GAME]", priceUSD: 41.15, msrpUSD: 58.79, discountPercent: 30, directUrl: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", "steam"), isStockAvailable: true },
      { storeName: "GOG.com (DRM-Free)", storeIcon: "[GOG]", priceUSD: 41.15, msrpUSD: 58.79, discountPercent: 30, directUrl: "https://www.gog.com", affiliateUrl: buildAffiliateUrl("https://www.gog.com", "gog"), isStockAvailable: true }
    ],
    tags: ["PC Deal", "Weekend Deal", "CRPG", "Steam Deck Verified", "GOTY Winner"]
  },
  {
    id: "pc-deal-4",
    slug: "black-myth-wukong",
    title: "Black Myth: Wukong",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    platforms: ["PC", "Steam Deck"],
    primaryStore: "Steam Store",
    primaryStoreIcon: "[GAME]",
    currentPriceUSD: 53.99,
    msrpPriceUSD: 59.99,
    discountPercent: 10,
    isHistoricalLow: true,
    historicalLowUSD: 53.99,
    metacriticScore: 82,
    userRating: 4.8,
    releaseDate: "2024-08-20",
    publisher: "Game Science",
    developer: "Game Science",
    description: "An action RPG rooted in Chinese mythology. Set out as the Destined One to uncover the obscured truth.",
    directStoreUrl: "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/2358720/Black_Myth_Wukong/", "steam"),
    priceHistory: [
      { date: "2024-08", priceUSD: 59.99 },
      { date: "2024-11", priceUSD: 53.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store", storeIcon: "[GAME]", priceUSD: 53.99, msrpUSD: 59.99, discountPercent: 10, directUrl: "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/2358720/Black_Myth_Wukong/", "steam"), isStockAvailable: true },
      { storeName: "Epic Games Store", storeIcon: "[EPIC]", priceUSD: 59.99, msrpUSD: 59.99, discountPercent: 0, directUrl: "https://store.epicgames.com", affiliateUrl: buildAffiliateUrl("https://store.epicgames.com", "epic"), isStockAvailable: true }
    ],
    tags: ["PC Deal", "Action RPG", "Mythology", "Unreal Engine 5"]
  },
  {
    id: "pc-deal-5",
    slug: "helldivers-2",
    title: "Helldivers 2",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    platforms: ["PC", "Steam Deck"],
    primaryStore: "Steam Store",
    primaryStoreIcon: "[GAME]",
    currentPriceUSD: 31.99,
    msrpPriceUSD: 39.99,
    discountPercent: 20,
    isHistoricalLow: true,
    historicalLowUSD: 31.99,
    metacriticScore: 82,
    userRating: 4.7,
    releaseDate: "2024-02-08",
    publisher: "PlayStation Publishing",
    developer: "Arrowhead Game Studios",
    description: "Join the Helldivers in a third-person co-op shooter against alien threats for Super Earth.",
    directStoreUrl: "https://store.steampowered.com/app/553850/HELLDIVERS_2/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/553850/HELLDIVERS_2/", "steam"),
    priceHistory: [
      { date: "2024-02", priceUSD: 39.99 },
      { date: "2024-07", priceUSD: 31.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store", storeIcon: "[GAME]", priceUSD: 31.99, msrpUSD: 39.99, discountPercent: 20, directUrl: "https://store.steampowered.com/app/553850/HELLDIVERS_2/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/553850/HELLDIVERS_2/", "steam"), isStockAvailable: true },
      { storeName: "Fanatical", storeIcon: "[HOT]", priceUSD: 33.99, msrpUSD: 39.99, discountPercent: 15, directUrl: "https://www.fanatical.com", affiliateUrl: buildAffiliateUrl("https://www.fanatical.com", "fanatical"), isStockAvailable: true }
    ],
    tags: ["PC Deal", "Co-Op", "Steam Deck Playable", "Shooter"]
  }
];

export function getAegisPcDeals(options?: {
  store?: string;
  maxPrice?: number;
  minDiscount?: number;
  search?: string;
}): AegisGame[] {
  let list = [...AEGIS_PC_DEALS_CATALOG];

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(g => g.title.toLowerCase().includes(q) || g.publisher.toLowerCase().includes(q));
  }

  if (options?.store && options.store !== "all") {
    const s = options.store.toLowerCase();
    list = list.filter(g => g.primaryStore.toLowerCase().includes(s) || g.storeOptions.some(so => so.storeName.toLowerCase().includes(s)));
  }

  if (options?.maxPrice && options.maxPrice > 0) {
    list = list.filter(g => g.currentPriceUSD <= options.maxPrice!);
  }

  if (options?.minDiscount && options.minDiscount > 0) {
    list = list.filter(g => g.discountPercent >= options.minDiscount!);
  }

  return list;
}
