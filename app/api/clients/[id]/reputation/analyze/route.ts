/**
 * POST /api/clients/[id]/reputation/analyze
 * Analyze reputation data using AI agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, NotFoundError } from '@/lib/errors/errors';
import type { ErrorResponse } from '@/lib/types/api';
import { orchestrateReputationAnalysis, createAgentContext } from '@/lib/ai/agents/orchestrator';
import { calculateReputationScore } from '@/lib/reputation/calculator';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new NotFoundError('Client', clientId);
    }

    // Get period from query params or use default (last 30 days)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Calculate current and previous scores
    const { score: currentScore } = await calculateReputationScore({
      clientId,
      periodStart,
      periodEnd,
    });

    const previousPeriodEnd = periodStart;
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const { score: previousScore } = await calculateReputationScore({
      clientId,
      periodStart: previousPeriodStart,
      periodEnd: previousPeriodEnd,
    });

    // Fetch SERP positions
    const { data: serpResults } = await supabase
      .from('serp_results')
      .select('*, keywords(keyword)')
      .eq('client_id', clientId)
      .gte('checked_at', periodStart.toISOString())
      .order('checked_at', { ascending: false })
      .limit(100);

    // Calculate position changes
    const serpPositionsRaw = (serpResults ?? []).reduce<Array<{ keyword: string; position: number | null; change: number; checked_at?: string }>>((acc, result) => {
      const keyword = (result.keywords as any)?.keyword;
      if (!keyword) return acc;

      const existing = acc.find(p => p.keyword === keyword);
      if (existing) {
        const hasNewerData = existing.checked_at ? result.checked_at > existing.checked_at : true;
        if (result.position !== null && (existing.position === null || hasNewerData)) {
          existing.position = result.position;
          existing.checked_at = result.checked_at;
        }
      } else {
        acc.push({
          keyword,
          position: result.position,
          change: 0, // Will calculate later
          checked_at: result.checked_at,
        });
      }
      return acc;
    }, []);

    // Remove helper property before returning
    const serpPositions = serpPositionsRaw.map(({ checked_at, ...rest }) => rest);

    // Fetch mentions
    const { data: newsMentions } = await supabase
      .from('news_mentions')
      .select('sentiment, title, url')
      .eq('client_id', clientId)
      .gte('scraped_at', periodStart.toISOString())
      .limit(100);

    // Get social accounts for this client
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_active', true);

    const socialAccountIds = socialAccounts?.map(acc => acc.id) || [];

    const { data: socialPosts } = socialAccountIds.length > 0
      ? await supabase
          .from('social_posts')
          .select('sentiment, content')
          .in('social_account_id', socialAccountIds)
          .gte('scraped_at', periodStart.toISOString())
          .limit(100)
      : { data: null };

    const mentions = [
      ...(newsMentions?.map(m => ({
        type: 'news' as const,
        sentiment: (m.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
        title: m.title,
        url: m.url,
      })) || []),
      ...(socialPosts?.map(p => ({
        type: 'social' as const,
        sentiment: (p.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
        title: p.content?.substring(0, 100),
      })) || []),
    ];

    // Create agent context
    const context = createAgentContext(clientId, client.name, user.id);

    // Run reputation analysis
    const analysisInput = {
      currentScore,
      previousScore,
      serpPositions,
      mentions,
      periodStart,
      periodEnd,
    };

    const result = await orchestrateReputationAnalysis(context, analysisInput);

    if (!result.success || !result.data) {
      throw new AppError(result.results[0]?.error || 'Reputation analysis failed', 500);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Error in POST /api/clients/[id]/reputation/analyze', error as Error);

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

