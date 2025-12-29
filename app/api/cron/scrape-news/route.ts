import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/scrape-news
 * Trigger news scraping (cron job)
 * Protected by Vercel Cron secret or service role
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    const supabase = await createClient();

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('is_active', true);

    if (clientsError) {
      logger.error('Failed to fetch clients for news scraping', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        status: 'completed',
        clients_processed: 0,
        message: 'No active clients found',
      });
    }

    // TODO: Implement actual news scraping
    // This will be implemented in Phase 11 (News Monitoring)
    logger.info('News scraping triggered', {
      clients_count: clients.length,
    });

    return NextResponse.json({
      status: 'started',
      clients_processed: clients.length,
      message: 'News scraping started',
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

