import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, NotFoundError } from '@/lib/errors/errors';
import type { SERPResponse, ErrorResponse } from '@/lib/types/api';

/**
 * GET /api/clients/[id]/serp
 * Get SERP positions for client keywords
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const keywordId = request.nextUrl.searchParams.get('keyword_id');
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

    // Build query for SERP results
    let query = supabase
      .from('serp_results')
      .select(`
        *,
        keywords!inner (
          id,
          keyword,
          client_id
        )
      `)
      .eq('keywords.client_id', clientId)
      .order('checked_at', { ascending: false });

    if (keywordId) {
      query = query.eq('keyword_id', keywordId);
    }

    // Get latest result for each keyword
    const { data: allResults, error: resultsError } = await query.limit(1000);

    if (resultsError) {
      logger.error('Failed to fetch SERP results', resultsError);
      throw new AppError('Failed to fetch SERP results', 500);
    }

    // Group by keyword and get latest
    const keywordMap = new Map<string, typeof allResults[0]>();
    for (const result of allResults || []) {
      const keywordId = (result as any).keywords.id;
      if (!keywordMap.has(keywordId)) {
        keywordMap.set(keywordId, result);
      }
    }

    const results = Array.from(keywordMap.values()).map((result: any) => ({
      keyword: result.keywords.keyword,
      position: result.position,
      url: result.url,
      title: result.title,
      snippet: result.snippet,
      checked_at: result.checked_at,
    }));

    return NextResponse.json<SERPResponse>({ results });
  } catch (error) {
    logger.error('Error in GET /api/clients/[id]/serp', error as Error);

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

