import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError } from '@/lib/errors/errors';
import type { ErrorResponse } from '@/lib/types/api';
import { z } from 'zod';

const createKeywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  alert_threshold: z.number().int().positive().optional(),
});

/**
 * POST /api/clients/[id]/keywords
 * Add a keyword to monitor
 */
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

    // Check access (editor or admin)
    await requireClientAccess(user.id, clientId, 'editor');

    // Parse and validate request body
    const body = await request.json();
    const validation = createKeywordSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.errors);
    }

    const { keyword, alert_threshold } = validation.data;

    // Create keyword
    const { data: newKeyword, error: keywordError } = await supabase
      .from('keywords')
      .insert({
        client_id: clientId,
        keyword: keyword.trim(),
        is_active: true,
        alert_threshold: alert_threshold || 5,
      })
      .select()
      .single();

    if (keywordError || !newKeyword) {
      logger.error('Failed to create keyword', keywordError);
      throw new AppError('Failed to create keyword', 500);
    }

    return NextResponse.json({ keyword: newKeyword }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/clients/[id]/keywords', error as Error);

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

