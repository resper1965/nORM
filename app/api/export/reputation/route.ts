import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClients } from '@/lib/auth/rbac';
import { arrayToCSV, formatDateTimeForCSV } from '@/lib/utils/csv-export';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/reputation
 * Export reputation scores data as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's clients
    const clientIds = await getUserClients(user.id);

    if (clientIds.length === 0) {
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="reputation-scores.csv"',
        },
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('reputation_scores')
      .select(`
        id,
        client_id,
        score,
        breakdown,
        calculated_at
      `)
      .in('client_id', clientId ? [clientId] : clientIds)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    const { data: scores, error: scoresError } = await query;

    if (scoresError) {
      logger.error('Failed to fetch reputation scores for export', scoresError);
      throw new AppError('Failed to fetch reputation scores', 500);
    }

    // Fetch client names separately
    const clientIdsToFetch = [...new Set((scores || []).map((s: any) => s.client_id))];
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name')
      .in('id', clientIdsToFetch);

    const clientMap = new Map((clients || []).map((c: any) => [c.id, c.name]));

    // Format data for CSV
    const csvData = (scores || []).map((score: any) => ({
      ID: score.id,
      'Client Name': clientMap.get(score.client_id) || '',
      Score: score.score?.toFixed(2) || '0.00',
      'SERP Score': score.breakdown?.serp?.toFixed(2) || '0.00',
      'News Score': score.breakdown?.news?.toFixed(2) || '0.00',
      'Social Score': score.breakdown?.social?.toFixed(2) || '0.00',
      'Trend Score': score.breakdown?.trend?.toFixed(2) || '0.00',
      'Volume Score': score.breakdown?.volume?.toFixed(2) || '0.00',
      'Calculated At': formatDateTimeForCSV(score.calculated_at),
    }));

    // Convert to CSV
    const csv = arrayToCSV(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="reputation-scores-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/export/reputation', error as Error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
