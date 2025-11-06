import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, NotFoundError } from '@/lib/errors/errors';
import type { ErrorResponse } from '@/lib/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reputation/trend
 * Get reputation trend data for a client
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!clientId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Bad Request', message: 'client_id is required' },
        { status: 400 }
      );
    }

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

    // Get reputation scores for the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: scores, error: scoresError } = await supabase
      .from('reputation_scores')
      .select('score, calculated_at')
      .eq('client_id', clientId)
      .gte('calculated_at', startDate.toISOString())
      .order('calculated_at', { ascending: true });

    if (scoresError) {
      logger.error('Failed to fetch reputation trend', scoresError);
      throw new AppError('Failed to fetch reputation trend', 500);
    }

    const trendData = (scores || []).map((score) => ({
      date: score.calculated_at,
      score: score.score,
    }));

    return NextResponse.json({ data: trendData });
  } catch (error) {
    logger.error('Error in GET /api/reputation/trend', error as Error);

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

