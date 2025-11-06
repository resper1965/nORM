import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { calculateReputationScore, calculateTrend } from '@/lib/reputation/calculator';
import { logger } from '@/lib/utils/logger';
import { AppError, NotFoundError } from '@/lib/errors/errors';
import type { ReputationResponse, ErrorResponse } from '@/lib/types/api';

/**
 * GET /api/clients/[id]/reputation
 * Get current reputation score for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check access
    await requireClientAccess(user.id, clientId);

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new NotFoundError('Client', clientId);
    }

    // Calculate current period (last 30 days)
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    // Calculate current score
    const { score, breakdown } = await calculateReputationScore({
      clientId,
      periodStart,
      periodEnd,
    });

    // Get previous period score for trend
    const previousPeriodEnd = periodStart;
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const { score: previousScore } = await calculateReputationScore({
      clientId,
      periodStart: previousPeriodStart,
      periodEnd: previousPeriodEnd,
    });

    const trend = calculateTrend(score, previousScore);
    const change = score - previousScore;

    const response: ReputationResponse = {
      score,
      breakdown,
      trend,
      change: Math.round(change * 100) / 100,
      calculated_at: new Date(),
      period_start: periodStart,
      period_end: periodEnd,
    };

    return NextResponse.json<ReputationResponse>(response);
  } catch (error) {
    logger.error('Error in GET /api/clients/[id]/reputation', error as Error);

    if (error instanceof AppError) {
      return NextResponse.json<ErrorResponse>(
        { error: error.code || 'ERROR', message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json<ErrorResponse>(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

