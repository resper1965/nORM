import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsForAllClients } from '@/lib/integrations/news-scraper';
import { logger } from '@/lib/utils/logger';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/scrape-news
 * Scrape news mentions for all active clients (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * Searches Google News RSS feeds for client monitoring keywords
 * and stores articles with sentiment analysis
 *
 * Recommended frequency: Every 6-12 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    logger.info('Starting news scraping cron job');

    const stats = await scrapeNewsForAllClients();

    logger.info('News scraping completed', {
      clientsProcessed: stats.clientsProcessed,
      articlesAdded: stats.articlesAdded,
      errors: stats.errors,
    });

    return NextResponse.json({
      status: 'completed',
      clients_processed: stats.clientsProcessed,
      articles_added: stats.articlesAdded,
      errors: stats.errors,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Unauthorized cron job attempt', { error: error.message });
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    logger.error('Error in POST /api/cron/scrape-news', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to start news scraping' },
      { status: 500 }
    );
  }
}

