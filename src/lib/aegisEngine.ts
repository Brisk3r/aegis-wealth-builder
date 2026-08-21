import { buildAffiliateUrl } from "./affiliate";
import { fetchAegisLiveDeals } from "./aegisLiveDeals";

export interface PricePoint {
  date: string; // YYYY-MM
  priceUSD: number;
}

export interface StorePriceOption {
  storeName: string;
  storeIcon: string;
  priceUSD: number;
  msrpUSD: number;
  discountPercent: number;
  directUrl: string;
  affiliateUrl: string;
  isStockAvailable: boolean;
}

export interface AegisGame {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  bannerImage: string;
  platforms: ("Switch" | "Steam Deck" | "PC" | "PS5" | "Xbox Series X")[];
  primaryStore: string;
  primaryStoreIcon: string;
  currentPriceUSD: number;
  msrpPriceUSD: number;
  discountPercent: number;
  isHistoricalLow: boolean;
  historicalLowUSD: number;
  metacriticScore: number;
  userRating: number;
  releaseDate: string;
  publisher: string;
  developer: string;
  description: string;
  directStoreUrl: string;
  affiliateUrl: string;
  priceHistory: PricePoint[];
  storeOptions: StorePriceOption[];
  tags: string[];
}

export interface AegisGiveaway {
  id: string;
  title: string;
  worthUSD: number;
  image: string;
  description: string;
  instructions: string;
  claimUrl: string;
  affiliateClaimUrl: string;
  publishedDate: string;
  type: "Game" | "Free Weekend" | "DLC" | "Beta Key";
  platforms: string[];
  endDate: string;
  claimedUsers: number;
}

export interface AegisNewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceBadge: string;
  category: "Hardware" | "PC Gaming" | "Console" | "Esports" | "Reviews" | "Industry";
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  isHot?: boolean;
}

export const AEGIS_GAMES_CATALOG: AegisGame[] = [
  {
    id: "aegis-1",
    slug: "zelda-tears-of-the-kingdom",
    title: "The Legend of Zelda: Tears of the Kingdom",
    coverImage: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,dpr_2.0,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero",
    bannerImage: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,dpr_2.0,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero",
    platforms: ["Switch"],
    primaryStore: "Nintendo eShop",
    primaryStoreIcon: "[LIVE]",
    currentPriceUSD: 49.99,
    msrpPriceUSD: 69.99,
    discountPercent: 29,
    isHistoricalLow: true,
    historicalLowUSD: 49.99,
    metacriticScore: 96,
    userRating: 4.9,
    releaseDate: "2023-05-12",
    publisher: "Nintendo",
    developer: "Nintendo EPD",
    description: "An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom.",
    directStoreUrl: "https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/",
    affiliateUrl: buildAffiliateUrl("https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/", "nintendo"),
    priceHistory: [
      { date: "2023-05", priceUSD: 69.99 },
      { date: "2023-11", priceUSD: 59.99 },
      { date: "2024-03", priceUSD: 69.99 },
      { date: "2024-08", priceUSD: 49.99 },
    ],
    storeOptions: [
      { storeName: "Nintendo eShop", storeIcon: "[LIVE]", priceUSD: 49.99, msrpUSD: 69.99, discountPercent: 29, directUrl: "https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/", affiliateUrl: buildAffiliateUrl("https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/"), isStockAvailable: true },
      { storeName: "Amazon", storeIcon: "[BOX]", priceUSD: 52.99, msrpUSD: 69.99, discountPercent: 24, directUrl: "https://www.amazon.com/dp/B097AYJA84", affiliateUrl: buildAffiliateUrl("https://www.amazon.com/dp/B097AYJA84", "amazon"), isStockAvailable: true },
      { storeName: "Best Buy", storeIcon: "[TAG]", priceUSD: 54.99, msrpUSD: 69.99, discountPercent: 21, directUrl: "https://www.bestbuy.com", affiliateUrl: buildAffiliateUrl("https://www.bestbuy.com", "bestbuy"), isStockAvailable: true }
    ],
    tags: ["Action", "Adventure", "Open World", "Exclusive"]
  },
  {
    id: "aegis-2",
    slug: "elden-ring-shadow-of-the-erdtree",
    title: "Elden Ring: Shadow of the Erdtree Edition",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    platforms: ["Steam Deck", "PC", "PS5", "Xbox Series X"],
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
    publisher: "FromSoftware / Bandai Namco",
    developer: "FromSoftware",
    description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    directStoreUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1245620/ELDEN_RING/", "steam"),
    priceHistory: [
      { date: "2023-01", priceUSD: 59.99 },
      { date: "2023-06", priceUSD: 41.99 },
      { date: "2023-12", priceUSD: 39.99 },
      { date: "2024-06", priceUSD: 39.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store", storeIcon: "[GAME]", priceUSD: 39.99, msrpUSD: 59.99, discountPercent: 33, directUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1245620/ELDEN_RING/"), isStockAvailable: true },
      { storeName: "PlayStation Store", storeIcon: "[GAME]", priceUSD: 41.99, msrpUSD: 59.99, discountPercent: 30, directUrl: "https://store.playstation.com", affiliateUrl: buildAffiliateUrl("https://store.playstation.com"), isStockAvailable: true },
      { storeName: "GOG.com", storeIcon: "[GOG]", priceUSD: 59.99, msrpUSD: 59.99, discountPercent: 0, directUrl: "https://www.gog.com", affiliateUrl: buildAffiliateUrl("https://www.gog.com", "gog"), isStockAvailable: true }
    ],
    tags: ["Souls-like", "RPG", "Open World", "Masterpiece"]
  },
  {
    id: "aegis-3",
    slug: "cyberpunk-2077-ultimate",
    title: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    platforms: ["Steam Deck", "PC", "PS5", "Xbox Series X"],
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
    description: "An open-world, action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    directStoreUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1091500/Cyberpunk_2077/", "steam"),
    priceHistory: [
      { date: "2022-01", priceUSD: 59.99 },
      { date: "2022-11", priceUSD: 39.99 },
      { date: "2023-09", priceUSD: 35.99 },
      { date: "2024-07", priceUSD: 29.99 },
    ],
    storeOptions: [
      { storeName: "Steam Store (Live Deal)", storeIcon: "[GAME]", priceUSD: 29.99, msrpUSD: 59.99, discountPercent: 50, directUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1091500/Cyberpunk_2077/", "steam"), isStockAvailable: true },
      { storeName: "Epic Games Store", storeIcon: "[EPIC]", priceUSD: 32.99, msrpUSD: 59.99, discountPercent: 45, directUrl: "https://store.epicgames.com", affiliateUrl: buildAffiliateUrl("https://store.epicgames.com", "epic"), isStockAvailable: true },
      { storeName: "GOG.com (Full Price)", storeIcon: "[GOG]", priceUSD: 59.99, msrpUSD: 59.99, discountPercent: 0, directUrl: "https://www.gog.com/en/game/cyberpunk_2077", affiliateUrl: buildAffiliateUrl("https://www.gog.com/en/game/cyberpunk_2077", "gog"), isStockAvailable: true }
    ],
    tags: ["Cyberpunk", "RPG", "Open World", "Ray Tracing"]
  },
  {
    id: "aegis-4",
    slug: "super-mario-bros-wonder",
    title: "Super Mario Bros. Wonder",
    coverImage: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,dpr_2.0,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/s/super-mario-bros-wonder-switch/hero",
    bannerImage: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,dpr_2.0,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/s/super-mario-bros-wonder-switch/hero",
    platforms: ["Switch"],
    primaryStore: "Nintendo eShop",
    primaryStoreIcon: "[LIVE]",
    currentPriceUSD: 44.99,
    msrpPriceUSD: 59.99,
    discountPercent: 25,
    isHistoricalLow: true,
    historicalLowUSD: 44.99,
    metacriticScore: 92,
    userRating: 4.8,
    releaseDate: "2023-10-20",
    publisher: "Nintendo",
    developer: "Nintendo EPD",
    description: "Classic Mario side-scrolling gameplay is turned on its head with Wonder Flowers in Super Mario Bros. Wonder!",
    directStoreUrl: "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
    affiliateUrl: buildAffiliateUrl("https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/", "nintendo"),
    priceHistory: [
      { date: "2023-10", priceUSD: 59.99 },
      { date: "2024-02", priceUSD: 54.99 },
      { date: "2024-06", priceUSD: 44.99 },
    ],
    storeOptions: [
      { storeName: "Nintendo eShop", storeIcon: "[LIVE]", priceUSD: 44.99, msrpUSD: 59.99, discountPercent: 25, directUrl: "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/", affiliateUrl: buildAffiliateUrl("https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/"), isStockAvailable: true },
      { storeName: "Target", storeIcon: "[TARGET]", priceUSD: 46.99, msrpUSD: 59.99, discountPercent: 22, directUrl: "https://www.target.com", affiliateUrl: buildAffiliateUrl("https://www.target.com", "target"), isStockAvailable: true }
    ],
    tags: ["Platformer", "Co-Op", "Family", "Exclusive"]
  },
  {
    id: "aegis-5",
    slug: "balders-gate-3",
    title: "Baldur's Gate 3",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    bannerImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    platforms: ["Steam Deck", "PC", "PS5", "Xbox Series X"],
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
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Live Steam Weekend Deal -30% OFF!",
    directStoreUrl: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
    affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", "steam"),
    priceHistory: [
      { date: "2023-08", priceUSD: 58.79 },
      { date: "2024-05", priceUSD: 47.00 },
      { date: "2026-08", priceUSD: 41.15 },
    ],
    storeOptions: [
      { storeName: "Steam Store (Weekend Deal -30%)", storeIcon: "[GAME]", priceUSD: 41.15, msrpUSD: 58.79, discountPercent: 30, directUrl: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/", affiliateUrl: buildAffiliateUrl("https://store.steampowered.com/app/1086940/Baldurs_Gate_3/"), isStockAvailable: true },
      { storeName: "GOG.com", storeIcon: "[GOG]", priceUSD: 41.15, msrpUSD: 58.79, discountPercent: 30, directUrl: "https://www.gog.com", affiliateUrl: buildAffiliateUrl("https://www.gog.com", "gog"), isStockAvailable: true }
    ],
    tags: ["CRPG", "D&D", "Weekend Deal", "GOTY Winner"]
  }
];

const NATIVE_GIVEAWAYS: AegisGiveaway[] = [
  {
    id: "aegis-giveaway-1",
    title: "Death Stranding Director's Cut (Epic Games Freebie)",
    worthUSD: 39.99,
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg",
    description: "Claim Death Stranding Director's Cut 100% free on Epic Games Store! Added permanently to your library.",
    instructions: "Log in to your Epic Games account and hit 'Get' to claim permanently.",
    claimUrl: "https://store.epicgames.com/en-US/free-games",
    affiliateClaimUrl: buildAffiliateUrl("https://store.epicgames.com/en-US/free-games", "epic"),
    publishedDate: "2026-08-01",
    type: "Game",
    platforms: ["PC", "Epic Games Store"],
    endDate: "2026-08-14",
    claimedUsers: 54120
  },
  {
    id: "aegis-giveaway-2",
    title: "Steam Free Weekend: Warhammer 40,000 Space Marine 2",
    worthUSD: 59.99,
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1649080/header.jpg",
    description: "Play Space Marine 2 free all weekend on Steam with co-op multiplayer unlocked!",
    instructions: "Open Steam desktop client and click Play Game.",
    claimUrl: "https://store.steampowered.com/app/1649080/",
    affiliateClaimUrl: buildAffiliateUrl("https://store.steampowered.com/app/1649080/", "steam"),
    publishedDate: "2026-08-04",
    type: "Free Weekend",
    platforms: ["PC", "Steam"],
    endDate: "2026-08-10",
    claimedUsers: 31200
  },
  {
    id: "aegis-giveaway-3",
    title: "Prime Gaming: Fallout 4 GOTY Edition GOG Key",
    worthUSD: 39.99,
    image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg",
    description: "Amazon Prime members can claim a full GOG code for Fallout 4 Game of the Year Edition.",
    instructions: "Log in to Prime Gaming, click Claim Code, and redeem on GOG.com.",
    claimUrl: "https://gaming.amazon.com",
    affiliateClaimUrl: buildAffiliateUrl("https://gaming.amazon.com", "amazon"),
    publishedDate: "2026-08-02",
    type: "Game",
    platforms: ["PC", "GOG"],
    endDate: "2026-08-30",
    claimedUsers: 68400
  }
];

const NATIVE_NEWS: AegisNewsArticle[] = [
  {
    id: "aegis-news-1",
    title: "NVIDIA RTX 5090 Architecture Deep Dive: DLSS 4 & 4K 240Hz Ray Tracing Benchmarks Revealed",
    summary: "Hardware engineers dissect NVIDIA's next-generation Blackwell flagship GPU architecture, showcasing breakthrough neural rendering efficiency and GDDR7 memory speeds.",
    url: "https://www.pcgamer.com",
    source: "PC Gamer",
    sourceBadge: "[PC] PC Gamer",
    category: "Hardware",
    publishedAt: "2026-08-05T12:30:00Z",
    readTime: "6 min read",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
    isHot: true
  },
  {
    id: "aegis-news-2",
    title: "Grand Theft Auto VI New Gameplay Breakdown: Vice City Map Scale, AI Physics & Customization",
    summary: "Rockstar Games drops fresh details on GTA VI's reactive dynamic NPC AI, realistic water fluid physics, and expanded vehicle customization systems across Vice City.",
    url: "https://www.ign.com",
    source: "IGN",
    sourceBadge: "[LIVE] IGN",
    category: "Console",
    publishedAt: "2026-08-05T10:15:00Z",
    readTime: "8 min read",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
    isHot: true
  },
  {
    id: "aegis-news-3",
    title: "Unreal Engine 5.5 Tech Demo Pushes Photorealistic Lighting & Automated Mesh LODs",
    summary: "Epic Games releases Unreal Engine 5.5 preview featuring Nanite foliage upgrades, Subsurface Scattering 2.0, and instant procedural terrain generation tools for developers.",
    url: "https://www.eurogamer.net",
    source: "Eurogamer",
    sourceBadge: "[ACTIVE] Eurogamer",
    category: "Industry",
    publishedAt: "2026-08-04T18:45:00Z",
    readTime: "5 min read",
    imageUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg"
  }
];

export async function getAegisDeals(options?: {
  platform?: string;
  maxPrice?: number;
  minDiscount?: number;
  historicalLowOnly?: boolean;
  search?: string;
  sortBy?: "discount" | "price" | "rating" | "release";
}): Promise<AegisGame[]> {
  return fetchAegisLiveDeals(options);
}

export async function getAegisGiveaways(): Promise<AegisGiveaway[]> {
  return NATIVE_GIVEAWAYS;
}

export async function getAegisNews(): Promise<AegisNewsArticle[]> {
  return NATIVE_NEWS;
}

export function getAegisGameBySlug(slug: string): AegisGame | undefined {
  return AEGIS_GAMES_CATALOG.find(g => g.slug === slug || g.id === slug);
}
