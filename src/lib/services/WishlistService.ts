import { dbRepository } from '@/lib/db';
import { Wishlist, NotificationLog } from '@/types/gameHub';

export class WishlistService {
  getUserWishlist(userId: string = 'usr-1'): Wishlist[] {
    return dbRepository.getWishlistForUser(userId);
  }

  addToWishlist(
    gameId: string,
    targetPrice: number,
    notifyOnAllTimeLow: boolean = true,
    userId: string = 'usr-1'
  ): Wishlist {
    return dbRepository.addToWishlist(userId, gameId, targetPrice, notifyOnAllTimeLow);
  }

  removeFromWishlist(gameId: string, userId: string = 'usr-1'): boolean {
    return dbRepository.removeFromWishlist(userId, gameId);
  }

  getUserNotificationLogs(userId: string = 'usr-1'): NotificationLog[] {
    return dbRepository.getNotificationLogsForUser(userId);
  }

  /**
   * Evaluates active wishlist entries against a price update to generate notification logs
   * if target price or all-time low criteria are met.
   */
  evaluatePriceDrop(gameId: string, newPrice: number, isAllTimeLow: boolean): NotificationLog[] {
    const wishlists = dbRepository.getWishlistForUser('usr-1').filter(w => w.gameId === gameId);
    const createdLogs: NotificationLog[] = [];

    wishlists.forEach(wish => {
      if (newPrice <= wish.targetPrice || (wish.notifyOnAllTimeLow && isAllTimeLow)) {
        const log = dbRepository.addNotificationLog({
          userId: wish.userId,
          gameId: wish.gameId,
          price: newPrice,
          channel: 'EMAIL',
        });
        createdLogs.push(log);
      }
    });

    return createdLogs;
  }
}

export const wishlistService = new WishlistService();
