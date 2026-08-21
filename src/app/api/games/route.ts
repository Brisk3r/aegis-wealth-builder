import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/GameService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || undefined;
  const query = searchParams.get('query') || undefined;
  const sortBy = (searchParams.get('sortBy') as 'discount' | 'price' | 'metacritic' | 'release') || undefined;

  const games = gameService.getGames({ platform, query, sortBy });
  return NextResponse.json({ games, count: games.length });
}
