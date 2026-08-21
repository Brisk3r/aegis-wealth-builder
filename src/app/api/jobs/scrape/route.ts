import { NextResponse } from 'next/server';
import { priceScraperWorker, alertQueueWorker } from '@/lib/jobs/BackgroundWorkers';

export async function POST() {
  const scrapeResult = await priceScraperWorker.processJob();
  const alertResult = await alertQueueWorker.processJob('game-zelda-totk', 44.99, true);

  return NextResponse.json({
    scrapeJob: scrapeResult,
    alertJob: alertResult,
  });
}
