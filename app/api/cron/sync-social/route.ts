import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/sync-social
 * Trigger social media sync (cron job)
 * Protected by Vercel Cron secret or service role
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    const supabase = await createClient();

    // Get all active social accounts
    const { data: socialAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, client_id')
      .eq('is_active', true);

    if (accountsError) {
      logger.error('Failed to fetch social accounts for sync', accountsError);
      throw new AppError('Failed to fetch social accounts', 500);
    }

    if (!socialAccounts || socialAccounts.length === 0) {
      return NextResponse.json({
        status: 'completed',
        accounts_synced: 0,
        message: 'No active social accounts found',
      });
    }

    // TODO: Implement actual social media sync
    // This will be implemented in User Story 3
    logger.info('Social media sync triggered', {
      accounts_count: socialAccounts.length,
    });

    return NextResponse.json({
      status: 'started',
      accounts_synced: socialAccounts.length,
      message: 'Social media sync started',
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
      { error: 'Internal Server Error', message: 'Failed to start social sync' },
      { status: 500 }
    );
  }
}

