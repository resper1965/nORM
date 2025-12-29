import { NextRequest, NextResponse } from 'next/server';
import { sendPendingAlerts } from '@/lib/notifications/alert-notifications';
import { logger } from '@/lib/utils/logger';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/send-alerts
 * Send pending alert emails (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * Runs every hour to send grouped alert notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    logger.info('Starting alert email sending cron job');

    const stats = await sendPendingAlerts();

    logger.info('Alert email cron job completed', stats);

    return NextResponse.json({
      status: 'completed',
      ...stats,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Unauthorized cron job attempt', { error: error.message });
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    logger.error('Error in POST /api/cron/send-alerts', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to send alert emails' },
      { status: 500 }
    );
  }
}
