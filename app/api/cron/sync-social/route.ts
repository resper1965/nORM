import { NextRequest, NextResponse } from 'next/server';
import { syncAllInstagramAccounts } from '@/lib/integrations/instagram-sync';
import { logger } from '@/lib/utils/logger';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/sync-social
 * Synchronize social media accounts (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * Currently supports:
 * - Instagram (via Meta Graph API)
 *
 * TODO: Add support for LinkedIn, Facebook pages, Twitter/X
 *
 * Recommended frequency: Every 1-2 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    logger.info('Starting social media sync cron job');

    // Sync Instagram accounts
    const instagramStats = await syncAllInstagramAccounts();

    // TODO: Add LinkedIn sync
    // const linkedInStats = await syncAllLinkedInAccounts();

    // TODO: Add Facebook sync
    // const facebookStats = await syncAllFacebookAccounts();

    const totalStats = {
      instagram: instagramStats,
      // linkedin: linkedInStats,
      // facebook: facebookStats,
    };

    logger.info('Social media sync completed', totalStats);

    return NextResponse.json({
      status: 'completed',
      platforms: {
        instagram: {
          accounts: instagramStats.accountsProcessed,
          posts_added: instagramStats.postsAdded,
          posts_updated: instagramStats.postsUpdated,
          errors: instagramStats.errors,
        },
      },
      summary: {
        total_accounts: instagramStats.accountsProcessed,
        total_posts_added: instagramStats.postsAdded,
        total_posts_updated: instagramStats.postsUpdated,
        total_errors: instagramStats.errors,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Unauthorized cron job attempt', { error: error.message });
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    logger.error('Error in POST /api/cron/sync-social', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to sync social media' },
      { status: 500 }
    );
  }
}
