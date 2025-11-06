import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateReputationScore } from '@/lib/reputation/calculator';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';

/**
 * POST /api/cron/calculate-reputation
 * Recalculate reputation scores (cron job)
 * Protected by Vercel Cron secret or service role
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Verify cron secret or service role

    const supabase = await createClient();

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('is_active', true);

    if (clientsError) {
      logger.error('Failed to fetch clients for reputation calculation', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        status: 'completed',
        clients_processed: 0,
        message: 'No active clients found',
      });
    }

    // Calculate period (last 30 days)
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    let processed = 0;
    const errors: string[] = [];

    // Calculate score for each client
    for (const client of clients) {
      try {
        const { score, breakdown } = await calculateReputationScore({
          clientId: client.id,
          periodStart,
          periodEnd,
        });

        // Save to database
        const { error: insertError } = await supabase
          .from('reputation_scores')
          .insert({
            client_id: client.id,
            score,
            score_breakdown: breakdown,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
          });

        if (insertError) {
          logger.error(`Failed to save reputation score for client ${client.id}`, insertError);
          errors.push(`Client ${client.name}: ${insertError.message}`);
        } else {
          processed++;
        }
      } catch (error) {
        logger.error(`Failed to calculate reputation for client ${client.id}`, error as Error);
        errors.push(`Client ${client.name}: ${(error as Error).message}`);
      }
    }

    return NextResponse.json({
      status: 'completed',
      clients_processed: processed,
      total_clients: clients.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Error in POST /api/cron/calculate-reputation', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to calculate reputation scores' },
      { status: 500 }
    );
  }
}

