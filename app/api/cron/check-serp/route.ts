import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackClientSERPPositions, detectSERPChanges } from '@/lib/scraping/serp-tracker';
import { checkAlertConditions, getSeverityFromScoreDrop } from '@/lib/reputation/alert-generator';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';

/**
 * POST /api/cron/check-serp
 * Trigger SERP position checks (cron job)
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
      logger.error('Failed to fetch clients for SERP check', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        status: 'completed',
        clients_processed: 0,
        message: 'No active clients found',
      });
    }

    let processed = 0;
    const alertsCreated: string[] = [];

    // Check SERP for each client
    for (const client of clients) {
      try {
        // Track SERP positions
        await trackClientSERPPositions(client.id);

        // Get all keywords for client
        const { data: keywords, error: keywordsError } = await supabase
          .from('keywords')
          .select('id, keyword, alert_threshold')
          .eq('client_id', client.id)
          .eq('is_active', true);

        if (keywordsError || !keywords) {
          continue;
        }

        // Check for position changes and create alerts
        for (const keyword of keywords) {
          const change = await detectSERPChanges(keyword.id, keyword.alert_threshold);
          
          if (change.hasChange) {
            // Create alert
            const severity = getSeverityFromScoreDrop(change.change);
            const { error: alertError } = await supabase
              .from('alerts')
              .insert({
                client_id: client.id,
                alert_type: 'serp_change',
                severity,
                title: `Mudança de posição no Google: ${keyword.keyword}`,
                message: `Posição mudou de ${change.previousPosition} para ${change.currentPosition} (mudança de ${change.change} posições)`,
                status: 'active',
              });

            if (!alertError) {
              alertsCreated.push(`${client.name}: ${keyword.keyword}`);
            }
          }
        }

        processed++;
      } catch (error) {
        logger.error(`Failed to check SERP for client ${client.id}`, error as Error);
        // Continue with other clients
      }
    }

    return NextResponse.json({
      status: 'completed',
      clients_processed: processed,
      total_clients: clients.length,
      alerts_created: alertsCreated.length,
    });
  } catch (error) {
    logger.error('Error in POST /api/cron/check-serp', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to check SERP positions' },
      { status: 500 }
    );
  }
}

