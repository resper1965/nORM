import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClients } from '@/lib/auth/rbac';
import { getUnifiedSocialFeed } from '@/lib/social/unified-feed';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import type { SocialMentionsResponse, ErrorResponse } from '@/lib/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/mentions
 * Get aggregated social media mentions
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
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const platform = searchParams.get('platform') as 'instagram' | 'linkedin' | 'facebook' | null;
    const sentiment = searchParams.get('sentiment') as 'positive' | 'neutral' | 'negative' | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get user's clients
    const userClientIds = await getUserClients(user.id);

    if (userClientIds.length === 0) {
      return NextResponse.json<SocialMentionsResponse>({ mentions: [], total: 0 });
    }

    // If client_id specified, verify access
    if (clientId && !userClientIds.includes(clientId)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Forbidden', message: 'Access denied to this client' },
        { status: 403 }
      );
    }

    // Get social mentions
    const targetClientId = clientId || userClientIds[0]; // Use first client if not specified
    const { posts, total } = await getUnifiedSocialFeed(targetClientId, {
      platform: platform || undefined,
      sentiment: sentiment || undefined,
      limit,
      offset,
    });

    return NextResponse.json<SocialMentionsResponse>({
      mentions: posts,
      total,
    });
  } catch (error) {
    logger.error('Error in GET /api/social/mentions', error as Error);

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

