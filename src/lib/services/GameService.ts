import { dbRepository } from '@/lib/db';
import { Game } from '@/types/gameHub';

export class GameService {
  getGames(options?: { platform?: string; query?: string; sortBy?: 'discount' | 'price' | 'metacritic' | 'release' }): Game[] {
    return dbRepository.getGames(options);
  }

  getGameBySlug(slug: string): Game | undefined {
    return dbRepository.getGameBySlug(slug);
  }

  getGameById(id: string): Game | undefined {
    return dbRepository.getGameById(id);
  }

  getFeaturedDeals(): Game[] {
    return dbRepository.getGames({ sortBy: 'discount' }).slice(0, 6);
  }

  getTopPriceDrops(): Game[] {
    return dbRepository.getGames({ sortBy: 'discount' }).filter(g => (g.maxDiscountPercent || 0) >= 30);
  }

  searchGames(query: string): Game[] {
    if (!query || query.trim().length < 2) return [];
    return dbRepository.getGames({ query: query.trim() });
  }
}

export const gameService = new GameService();
