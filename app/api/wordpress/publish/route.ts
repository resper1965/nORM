import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { publishToWordPress } from '@/lib/wordpress/publisher';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError } from '@/lib/errors/errors';
import type { WordPressPublishRequest, WordPressPublishResponse, ErrorResponse } from '@/lib/types/api';
import { z } from 'zod';

const publishSchema = z.object({
  content_id: z.string().uuid(),
  wordpress_site_id: z.string().uuid(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * POST /api/wordpress/publish
 * Publish article to WordPress as draft
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = publishSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const { content_id, wordpress_site_id } = validation.data;

    // Get content to verify access
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('client_id')
      .eq('id', content_id)
      .single();

    if (contentError || !content) {
      throw new AppError('Content not found', 404);
    }

    // Check access
    await requireClientAccess(user.id, content.client_id, 'editor');

    // Publish to WordPress
    const result = await publishToWordPress(content_id, wordpress_site_id);

    return NextResponse.json<WordPressPublishResponse>({
      wordpress_post_id: result.wordpressPostId,
      wordpress_url: result.wordpressUrl,
    });
  } catch (error) {
    logger.error('Error in POST /api/wordpress/publish', error as Error);

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

