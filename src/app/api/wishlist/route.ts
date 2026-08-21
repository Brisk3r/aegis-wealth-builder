import { NextRequest, NextResponse } from 'next/server';
import { wishlistService } from '@/lib/services/WishlistService';

export async function GET() {
  const wishlists = wishlistService.getUserWishlist('usr-1');
  const logs = wishlistService.getUserNotificationLogs('usr-1');
  return NextResponse.json({ wishlists, notificationLogs: logs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, targetPrice, notifyOnAllTimeLow } = body;

    if (!gameId || typeof targetPrice !== 'number') {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const item = wishlistService.addToWishlist(gameId, targetPrice, notifyOnAllTimeLow);
    return NextResponse.json({ success: true, wishlist: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId parameter' }, { status: 400 });
    }

    const success = wishlistService.removeFromWishlist(gameId, 'usr-1');
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
