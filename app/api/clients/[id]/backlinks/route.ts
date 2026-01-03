import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError, NotFoundError } from '@/lib/errors/errors';
import { getBacklinks, getBacklinkStats, analyzeBacklinkProfile } from '@/lib/seo/backlink-tracker';
import type { ErrorResponse } from '@/lib/types/api';
import { z } from 'zod';

interface BacklinksResponse {
  backlinks: Array<{
    source_url: string;
    source_domain: string;
    target_url: string;
    anchor_text?: string;
    domain_authority?: number;
    rel_attribute?: string;
    status: string;
    first_seen_at: string;
    last_checked_at: string;
  }>;
  stats: {
    active_backlinks: number;
    lost_backlinks: number;
    broken_backlinks: number;
    dofollow_backlinks: number;
    avg_domain_authority: number | null;
    new_backlinks_last_30_days: number;
    lost_backlinks_last_30_days: number;
  };
  analysis?: {
    score: number;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  };
}

/**
 * GET /api/clients/[id]/backlinks
 * Get backlinks for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = params.id;

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

    // Check access (viewer can see backlinks)
    await requireClientAccess(user.id, clientId, 'viewer');

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'lost' | 'broken' | 'redirect' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const analyze = searchParams.get('analyze') === 'true';

    // Get backlinks from database
    const { data: backlinksData, error: backlinksError } = await supabase
      .from('backlinks')
      .select('*')
      .eq('client_id', clientId)
      .order('last_checked_at', { ascending: false })
      .limit(limit);

    if (backlinksError) {
      logger.error('Failed to fetch backlinks', backlinksError);
      throw new AppError('Failed to fetch backlinks', 500);
    }

    // Get stats
    const stats = await getBacklinkStats(clientId);

    // Build response
    const response: BacklinksResponse = {
      backlinks: (backlinksData || []).map(b => ({
        source_url: b.source_url,
        source_domain: b.source_domain,
        target_url: b.target_url,
        anchor_text: b.anchor_text,
        domain_authority: b.domain_authority,
        rel_attribute: b.rel_attribute,
        status: b.status,
        first_seen_at: b.first_seen_at,
        last_checked_at: b.last_checked_at,
      })),
      stats: {
        active_backlinks: stats.activeBacklinks,
        lost_backlinks: stats.lostBacklinks,
        broken_backlinks: stats.brokenBacklinks,
        dofollow_backlinks: stats.dofollowBacklinks,
        avg_domain_authority: stats.avgDomainAuthority,
        new_backlinks_last_30_days: stats.newBacklinksLast30Days,
        lost_backlinks_last_30_days: stats.lostBacklinksLast30Days,
      },
    };

    // Add analysis if requested
    if (analyze) {
      const analysis = await analyzeBacklinkProfile(clientId);
      response.analysis = analysis;
    }

    return NextResponse.json<BacklinksResponse>(response);
  } catch (error) {
    logger.error('Error in GET /api/clients/[id]/backlinks', error as Error);

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

const addBacklinkSchema = z.object({
  source_url: z.string().url(),
  target_url: z.string().url(),
  anchor_text: z.string().optional(),
  domain_authority: z.number().int().min(0).max(100).optional(),
  rel_attribute: z.enum(['dofollow', 'nofollow', 'sponsored', 'ugc']).optional(),
});

/**
 * POST /api/clients/[id]/backlinks
 * Manually add a backlink
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = params.id;

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

    // Check access (editor required to add backlinks)
    await requireClientAccess(user.id, clientId, 'editor');

    // Parse and validate request body
    const body = await request.json();
    const validation = addBacklinkSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const { source_url, target_url, anchor_text, domain_authority, rel_attribute } = validation.data;

    // Extract source domain
    const sourceDomain = new URL(source_url).hostname.replace(/^www\./, '');

    // Insert backlink
    const { data, error } = await supabase
      .from('backlinks')
      .insert({
        client_id: clientId,
        source_url,
        source_domain: sourceDomain,
        target_url,
        anchor_text,
        domain_authority,
        rel_attribute,
        is_nofollow: rel_attribute === 'nofollow',
        status: 'active',
        discovered_by: 'manual',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add backlink', error);
      throw new AppError('Failed to add backlink', 500);
    }

    logger.info('Backlink added manually', {
      clientId,
      sourceUrl: source_url,
      targetUrl: target_url,
      userId: user.id,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/clients/[id]/backlinks', error as Error);

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
