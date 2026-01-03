import { NextRequest, NextResponse } from 'next/server';
import { processAlertsForAutoContent } from '@/lib/ai/auto-content-service';
import { logger } from '@/lib/utils/logger';
import { verifyCronAuth, UnauthorizedError } from '@/lib/utils/auth-cron';

/**
 * POST /api/cron/auto-generate-content
 * Automatically generate content for critical alerts (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * This is an OPTIONAL cron job that can run daily to automatically
 * generate positive content in response to critical alerts.
 *
 * Recommended frequency: Once per day
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    verifyCronAuth(request);

    logger.info('Starting auto content generation cron job');

    const stats = await processAlertsForAutoContent();

    logger.info('Auto content generation cron job completed', stats);

    return NextResponse.json({
      status: 'completed',
      alerts_processed: stats.processed,
      content_generated: stats.contentGenerated,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Unauthorized cron job attempt', { error: error.message });
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    logger.error('Error in POST /api/cron/auto-generate-content', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to auto-generate content' },
      { status: 500 }
    );
  }
}
