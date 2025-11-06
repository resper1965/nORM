import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, NotFoundError } from '@/lib/errors/errors';
import type { ErrorResponse } from '@/lib/types/api';

/**
 * DELETE /api/clients/[id]/keywords/[keywordId]
 * Delete a keyword
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; keywordId: string } }
) {
  try {
    const clientId = params.id;
    const keywordId = params.keywordId;
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

    // Verify keyword belongs to client
    const { data: keyword, error: keywordError } = await supabase
      .from('keywords')
      .select('id, client_id')
      .eq('id', keywordId)
      .eq('client_id', clientId)
      .single();

    if (keywordError || !keyword) {
      throw new NotFoundError('Keyword', keywordId);
    }

    // Delete keyword (soft delete by setting is_active to false)
    const { error: deleteError } = await supabase
      .from('keywords')
      .update({ is_active: false })
      .eq('id', keywordId);

    if (deleteError) {
      logger.error('Failed to delete keyword', deleteError);
      throw new AppError('Failed to delete keyword', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/clients/[id]/keywords/[keywordId]', error as Error);

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

