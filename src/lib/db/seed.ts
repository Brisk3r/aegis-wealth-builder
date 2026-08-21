import { Game, Store, StoreListing, PriceHistory, User, Wishlist, NotificationLog } from '@/types/gameHub';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-steam',
    name: 'Steam',
    slug: 'steam',
    baseUrl: 'https://store.steampowered.com',
    logoUrl: '/stores/steam.png',
    storeType: 'DIGITAL',
    platforms: ['PC'],
  },
  {
    id: 'store-nintendo',
    name: 'Nintendo eShop',
    slug: 'nintendo-eshop',
    baseUrl: 'https://www.nintendo.com/store',
    logoUrl: '/stores/nintendo.png',
    storeType: 'DIGITAL',
    platforms: ['Switch'],
  },
  {
    id: 'store-psn',
    name: 'PlayStation Store',
    slug: 'playstation-store',
    baseUrl: 'https://store.playstation.com',
    logoUrl: '/stores/psn.png',
    storeType: 'DIGITAL',
    platforms: ['PS5'],
  },
  {
    id: 'store-xbox',
    name: 'Xbox Store',
    slug: 'xbox-store',
    baseUrl: 'https://www.xbox.com/games/store',
    logoUrl: '/stores/xbox.png',
    storeType: 'DIGITAL',
    platforms: ['Xbox'],
  },
  {
    id: 'store-gog',
    name: 'GOG.com',
    slug: 'gog',
    baseUrl: 'https://www.gog.com',
    logoUrl: '/stores/gog.png',
    storeType: 'DIGITAL',
    platforms: ['PC'],
  },
  {
    id: 'store-epic',
    name: 'Epic Games Store',
    slug: 'epic-games',
    baseUrl: 'https://store.epicgames.com',
    logoUrl: '/stores/epic.png',
    storeType: 'DIGITAL',
    platforms: ['PC'],
  },
  {
    id: 'store-amazon',
    name: 'Amazon',
    slug: 'amazon',
    baseUrl: 'https://www.amazon.com',
    logoUrl: '/stores/amazon.png',
    storeType: 'PHYSICAL',
    platforms: ['Switch', 'PS5', 'Xbox'],
  },
  {
    id: 'store-bestbuy',
    name: 'Best Buy',
    slug: 'best-buy',
    baseUrl: 'https://www.bestbuy.com',
    logoUrl: '/stores/bestbuy.png',
    storeType: 'PHYSICAL',
    platforms: ['Switch', 'PS5', 'Xbox'],
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    email: 'alex.gamer@aegishub.dev',
    passwordHash: '$2a$12$eXaMpLeHaShF0rUsEr1AegisHubSecuredPass',
    name: 'Alex Mercer',
    role: 'USER',
    createdAt: '2025-11-12T10:00:00Z',
  },
  {
    id: 'usr-admin',
    email: 'admin@aegishub.dev',
    passwordHash: '$2a$12$aDmInHaShF0rAegisHubSecuredAdminPass',
    name: 'Aegis System Admin',
    role: 'ADMIN',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export const INITIAL_GAMES: Game[] = [
  {
    id: 'game-zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    slug: 'the-legend-of-zelda-tears-of-the-kingdom',
    description: 'An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom for Nintendo Switch.',
    coverImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    publisher: 'Nintendo',
    developer: 'Nintendo EPD',
    releaseDate: '2023-05-12T00:00:00Z',
    metacriticScore: 96,
    platforms: ['Switch'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'game-elden-ring',
    title: 'Elden Ring: Shadow of the Erdtree Edition',
    slug: 'elden-ring-shadow-of-the-erdtree',
    description: 'THE CRITICALLY ACCLAIMED ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    coverImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    publisher: 'Bandai Namco Entertainment',
    developer: 'FromSoftware',
    releaseDate: '2022-02-25T00:00:00Z',
    metacriticScore: 96,
    platforms: ['PC', 'PS5', 'Xbox'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'game-cyberpunk-2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077-phantom-liberty',
    description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as V.',
    coverImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    publisher: 'CD PROJEKT RED',
    developer: 'CD PROJEKT RED',
    releaseDate: '2020-12-10T00:00:00Z',
    metacriticScore: 89,
    platforms: ['PC', 'PS5', 'Xbox'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'game-gow-ragnarok',
    title: 'God of War Ragnarok',
    slug: 'god-of-war-ragnarok',
    description: 'Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go in Nine Realms.',
    coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    publisher: 'Sony Interactive Entertainment',
    developer: 'Santa Monica Studio',
    releaseDate: '2022-11-09T00:00:00Z',
    metacriticScore: 94,
    platforms: ['PS5', 'PC'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'game-mario-odyssey',
    title: 'Super Mario Odyssey',
    slug: 'super-mario-odyssey',
    description: 'Explore incredible places far from the Mushroom Kingdom as you join Mario and his ally Cappy on a massive 3D adventure.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
    publisher: 'Nintendo',
    developer: 'Nintendo EPD',
    releaseDate: '2017-10-27T00:00:00Z',
    metacriticScore: 97,
    platforms: ['Switch'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'game-hollow-knight',
    title: 'Hollow Knight: Voidheart Edition',
    slug: 'hollow-knight',
    description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.',
    coverImageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    publisher: 'Team Cherry',
    developer: 'Team Cherry',
    releaseDate: '2017-02-24T00:00:00Z',
    metacriticScore: 90,
    platforms: ['Switch', 'PC', 'PS5', 'Xbox'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
];

export const INITIAL_STORE_LISTINGS: StoreListing[] = [
  // Zelda TOTK
  {
    id: 'list-totk-nintendo',
    gameId: 'game-zelda-totk',
    storeId: 'store-nintendo',
    storeItemUrl: 'https://www.nintendo.com/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/',
    currentPrice: 49.99,
    originalPrice: 69.99,
    discountPercent: 28.5,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'list-totk-amazon',
    gameId: 'game-zelda-totk',
    storeId: 'store-amazon',
    storeItemUrl: 'https://www.amazon.com/dp/B09V3HM44N',
    currentPrice: 44.99,
    originalPrice: 69.99,
    discountPercent: 35.7,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T09:30:00Z',
  },
  {
    id: 'list-totk-bestbuy',
    gameId: 'game-zelda-totk',
    storeId: 'store-bestbuy',
    storeItemUrl: 'https://www.bestbuy.com/site/6414163.p',
    currentPrice: 54.99,
    originalPrice: 69.99,
    discountPercent: 21.4,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T11:00:00Z',
  },

  // Elden Ring
  {
    id: 'list-elden-steam',
    gameId: 'game-elden-ring',
    storeId: 'store-steam',
    storeItemUrl: 'https://store.steampowered.com/app/1245620/ELDEN_RING/',
    currentPrice: 35.99,
    originalPrice: 59.99,
    discountPercent: 40.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:15:00Z',
  },
  {
    id: 'list-elden-psn',
    gameId: 'game-elden-ring',
    storeId: 'store-psn',
    storeItemUrl: 'https://store.playstation.com/en-us/concept/10000350',
    currentPrice: 39.99,
    originalPrice: 59.99,
    discountPercent: 33.3,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:20:00Z',
  },
  {
    id: 'list-elden-xbox',
    gameId: 'game-elden-ring',
    storeId: 'store-xbox',
    storeItemUrl: 'https://www.xbox.com/en-US/games/store/elden-ring/9p3j32cxlrmg',
    currentPrice: 35.99,
    originalPrice: 59.99,
    discountPercent: 40.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:25:00Z',
  },

  // Cyberpunk 2077
  {
    id: 'list-cp-steam',
    gameId: 'game-cyberpunk-2077',
    storeId: 'store-steam',
    storeItemUrl: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
    currentPrice: 29.99,
    originalPrice: 59.99,
    discountPercent: 50.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:30:00Z',
  },
  {
    id: 'list-cp-gog',
    gameId: 'game-cyberpunk-2077',
    storeId: 'store-gog',
    storeItemUrl: 'https://www.gog.com/en/game/cyberpunk_2077',
    currentPrice: 26.99,
    originalPrice: 59.99,
    discountPercent: 55.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:35:00Z',
  },
  {
    id: 'list-cp-epic',
    gameId: 'game-cyberpunk-2077',
    storeId: 'store-epic',
    storeItemUrl: 'https://store.epicgames.com/p/cyberpunk-2077',
    currentPrice: 29.99,
    originalPrice: 59.99,
    discountPercent: 50.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:40:00Z',
  },

  // God of War Ragnarok
  {
    id: 'list-gow-psn',
    gameId: 'game-gow-ragnarok',
    storeId: 'store-psn',
    storeItemUrl: 'https://store.playstation.com/en-us/concept/10001944',
    currentPrice: 34.99,
    originalPrice: 69.99,
    discountPercent: 50.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:45:00Z',
  },
  {
    id: 'list-gow-steam',
    gameId: 'game-gow-ragnarok',
    storeId: 'store-steam',
    storeItemUrl: 'https://store.steampowered.com/app/2322010/God_of_War_Ragnark/',
    currentPrice: 44.99,
    originalPrice: 59.99,
    discountPercent: 25.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:50:00Z',
  },

  // Hollow Knight
  {
    id: 'list-hollow-steam',
    gameId: 'game-hollow-knight',
    storeId: 'store-steam',
    storeItemUrl: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
    currentPrice: 7.49,
    originalPrice: 14.99,
    discountPercent: 50.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T10:55:00Z',
  },
  {
    id: 'list-hollow-eshop',
    gameId: 'game-hollow-knight',
    storeId: 'store-nintendo',
    storeItemUrl: 'https://www.nintendo.com/store/products/hollow-knight-switch/',
    currentPrice: 7.49,
    originalPrice: 15.00,
    discountPercent: 50.0,
    currency: 'USD',
    isAvailable: true,
    lastCheckedAt: '2026-08-05T11:00:00Z',
  },
];

/**
 * Generates 12 months of realistic price history points for Recharts visualizations
 */
export function generatePriceHistories(): PriceHistory[] {
  const histories: PriceHistory[] = [];
  const now = new Date('2026-08-05T12:00:00Z');

  // Helper to create price logs backward in time
  const addLogsForListing = (listingId: string, origPrice: number, points: { monthsAgo: number; price: number }[]) => {
    points.forEach(p => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - p.monthsAgo);
      const discount = parseFloat((((origPrice - p.price) / origPrice) * 100).toFixed(1));

      histories.push({
        id: `hist-${listingId}-${p.monthsAgo}m`,
        storeListingId: listingId,
        price: p.price,
        originalPrice: origPrice,
        discountPercent: Math.max(0, discount),
        currency: 'USD',
        recordedAt: date.toISOString(),
      });
    });
  };

  // TOTK Nintendo eShop history
  addLogsForListing('list-totk-nintendo', 69.99, [
    { monthsAgo: 12, price: 69.99 },
    { monthsAgo: 9, price: 59.99 },
    { monthsAgo: 6, price: 69.99 },
    { monthsAgo: 3, price: 52.49 },
    { monthsAgo: 1, price: 69.99 },
    { monthsAgo: 0, price: 49.99 },
  ]);

  // TOTK Amazon history
  addLogsForListing('list-totk-amazon', 69.99, [
    { monthsAgo: 12, price: 68.99 },
    { monthsAgo: 9, price: 55.00 },
    { monthsAgo: 6, price: 59.99 },
    { monthsAgo: 3, price: 49.99 },
    { monthsAgo: 1, price: 51.99 },
    { monthsAgo: 0, price: 44.99 },
  ]);

  // Elden Ring Steam history
  addLogsForListing('list-elden-steam', 59.99, [
    { monthsAgo: 12, price: 59.99 },
    { monthsAgo: 10, price: 41.99 },
    { monthsAgo: 7, price: 59.99 },
    { monthsAgo: 4, price: 35.99 },
    { monthsAgo: 2, price: 59.99 },
    { monthsAgo: 0, price: 35.99 },
  ]);

  // Cyberpunk GOG history
  addLogsForListing('list-cp-gog', 59.99, [
    { monthsAgo: 12, price: 59.99 },
    { monthsAgo: 8, price: 29.99 },
    { monthsAgo: 5, price: 34.99 },
    { monthsAgo: 2, price: 59.99 },
    { monthsAgo: 0, price: 26.99 },
  ]);

  // Hollow Knight Steam history
  addLogsForListing('list-hollow-steam', 14.99, [
    { monthsAgo: 12, price: 14.99 },
    { monthsAgo: 9, price: 7.49 },
    { monthsAgo: 6, price: 14.99 },
    { monthsAgo: 3, price: 7.49 },
    { monthsAgo: 0, price: 7.49 },
  ]);

  return histories;
}

export const INITIAL_WISHLISTS: Wishlist[] = [
  {
    id: 'wish-1',
    userId: 'usr-1',
    gameId: 'game-zelda-totk',
    targetPrice: 45.00,
    notifyOnAllTimeLow: true,
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'wish-2',
    userId: 'usr-1',
    gameId: 'game-elden-ring',
    targetPrice: 30.00,
    notifyOnAllTimeLow: true,
    createdAt: '2026-06-01T09:00:00Z',
  },
];

export const INITIAL_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    gameId: 'game-zelda-totk',
    price: 44.99,
    sentAt: '2026-08-05T09:31:00Z',
    channel: 'EMAIL',
    gameTitle: 'The Legend of Zelda: Tears of the Kingdom',
    coverImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'notif-2',
    userId: 'usr-1',
    gameId: 'game-cyberpunk-2077',
    price: 26.99,
    sentAt: '2026-08-04T18:20:00Z',
    channel: 'PUSH',
    gameTitle: 'Cyberpunk 2077: Phantom Liberty',
    coverImageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
  },
];
