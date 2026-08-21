import { Game, Store, StoreListing, PriceHistory, Wishlist, NotificationLog, User } from '@/types/gameHub';
import {
  INITIAL_GAMES,
  INITIAL_STORES,
  INITIAL_STORE_LISTINGS,
  INITIAL_USERS,
  INITIAL_WISHLISTS,
  INITIAL_NOTIFICATION_LOGS,
  generatePriceHistories,
} from './seed';
import { priceAnalyticsService } from '@/lib/services/PriceAnalyticsService';

// In-memory data store initializing from rich seed data
class DatabaseRepository {
  private games: Game[] = [...INITIAL_GAMES];
  private stores: Store[] = [...INITIAL_STORES];
  private storeListings: StoreListing[] = [...INITIAL_STORE_LISTINGS];
  private priceHistories: PriceHistory[] = generatePriceHistories();
  private users: User[] = [...INITIAL_USERS];
  private wishlists: Wishlist[] = [...INITIAL_WISHLISTS];
  private notificationLogs: NotificationLog[] = [...INITIAL_NOTIFICATION_LOGS];

  // Store methods
  getStores(): Store[] {
    return [...this.stores];
  }

  getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  // Game methods
  getGames(options?: { platform?: string; query?: string; sortBy?: 'discount' | 'price' | 'metacritic' | 'release' }): Game[] {
    let result = this.games.map(game => this.enrichGame(game));

    if (options?.platform && options.platform !== 'ALL') {
      result = result.filter(g => g.platforms.includes(options.platform as any));
    }

    if (options?.query) {
      const q = options.query.toLowerCase().trim();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.publisher.toLowerCase().includes(q) || g.developer.toLowerCase().includes(q));
    }

    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'discount':
          result.sort((a, b) => (b.maxDiscountPercent || 0) - (a.maxDiscountPercent || 0));
          break;
        case 'price':
          result.sort((a, b) => (a.lowestCurrentPrice || 0) - (b.lowestCurrentPrice || 0));
          break;
        case 'metacritic':
          result.sort((a, b) => b.metacriticScore - a.metacriticScore);
          break;
        case 'release':
          result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
          break;
      }
    }

    return result;
  }

  getGameBySlug(slug: string): Game | undefined {
    const game = this.games.find(g => g.slug === slug);
    if (!game) return undefined;
    return this.enrichGame(game);
  }

  getGameById(id: string): Game | undefined {
    const game = this.games.find(g => g.id === id);
    if (!game) return undefined;
    return this.enrichGame(game);
  }

  private enrichGame(game: Game): Game {
    const listings = this.storeListings
      .filter(l => l.gameId === game.id)
      .map(l => ({
        ...l,
        store: this.stores.find(s => s.id === l.storeId),
      }));

    const prices = listings.map(l => l.currentPrice);
    const origPrices = listings.map(l => l.originalPrice);
    const discounts = listings.map(l => l.discountPercent);

    const lowestCurrentPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestOriginalPrice = origPrices.length > 0 ? Math.max(...origPrices) : 0;
    const maxDiscountPercent = discounts.length > 0 ? Math.max(...discounts) : 0;

    const gameHistories = this.priceHistories.filter(h =>
      listings.some(l => l.id === h.storeListingId)
    );

    const analytics = priceAnalyticsService.getAllTimeLow(gameHistories);

    return {
      ...game,
      storeListings: listings,
      lowestCurrentPrice,
      highestOriginalPrice,
      maxDiscountPercent,
      allTimeLowPrice: analytics.price || lowestCurrentPrice,
      allTimeLowDate: analytics.recordedAt,
      isAllTimeLow: lowestCurrentPrice > 0 && lowestCurrentPrice <= (analytics.price || lowestCurrentPrice),
    };
  }

  // Price History methods
  getPriceHistoriesForGame(gameId: string): (PriceHistory & { storeName: string; storeId: string })[] {
    const gameListingIds = this.storeListings
      .filter(l => l.gameId === gameId)
      .map(l => l.id);

    return this.priceHistories
      .filter(h => gameListingIds.includes(h.storeListingId))
      .map(h => {
        const listing = this.storeListings.find(l => l.id === h.storeListingId);
        const store = listing ? this.stores.find(s => s.id === listing.storeId) : undefined;
        return {
          ...h,
          storeName: store?.name || 'Unknown Store',
          storeId: store?.id || 'unknown',
        };
      })
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }

  // Wishlist methods
  getWishlistForUser(userId: string): Wishlist[] {
    return this.wishlists
      .filter(w => w.userId === userId)
      .map(w => ({
        ...w,
        game: this.getGameById(w.gameId),
      }));
  }

  addToWishlist(userId: string, gameId: string, targetPrice: number, notifyOnAllTimeLow: boolean = true): Wishlist {
    const existingIndex = this.wishlists.findIndex(w => w.userId === userId && w.gameId === gameId);
    if (existingIndex >= 0) {
      this.wishlists[existingIndex].targetPrice = targetPrice;
      this.wishlists[existingIndex].notifyOnAllTimeLow = notifyOnAllTimeLow;
      return this.wishlists[existingIndex];
    }

    const newWishlist: Wishlist = {
      id: `wish-${Date.now()}`,
      userId,
      gameId,
      targetPrice,
      notifyOnAllTimeLow,
      createdAt: new Date().toISOString(),
    };

    this.wishlists.push(newWishlist);
    return newWishlist;
  }

  removeFromWishlist(userId: string, gameId: string): boolean {
    const initialLength = this.wishlists.length;
    this.wishlists = this.wishlists.filter(w => !(w.userId === userId && w.gameId === gameId));
    return this.wishlists.length < initialLength;
  }

  // Notification logs methods
  getNotificationLogsForUser(userId: string): NotificationLog[] {
    return this.notificationLogs
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  addNotificationLog(log: Omit<NotificationLog, 'id' | 'sentAt'>): NotificationLog {
    const game = this.getGameById(log.gameId);
    const newLog: NotificationLog = {
      ...log,
      id: `notif-${Date.now()}`,
      sentAt: new Date().toISOString(),
      gameTitle: game?.title || 'Game Alert',
      coverImageUrl: game?.coverImageUrl || '',
    };
    this.notificationLogs.unshift(newLog);
    return newLog;
  }

  // Ingestion / Worker mock update methods
  updateListingPrice(listingId: string, newPrice: number): StoreListing | undefined {
    const listing = this.storeListings.find(l => l.id === listingId);
    if (!listing) return undefined;

    listing.currentPrice = newPrice;
    listing.discountPercent = parseFloat((((listing.originalPrice - newPrice) / listing.originalPrice) * 100).toFixed(1));
    listing.lastCheckedAt = new Date().toISOString();

    // Log history
    this.priceHistories.push({
      id: `hist-${listingId}-${Date.now()}`,
      storeListingId: listingId,
      price: newPrice,
      originalPrice: listing.originalPrice,
      discountPercent: listing.discountPercent,
      currency: listing.currency,
      recordedAt: listing.lastCheckedAt,
    });

    return listing;
  }
}

export const dbRepository = new DatabaseRepository();
