import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import type { ClientsResponse, ErrorResponse } from '@/lib/types/api';

/**
 * GET /api/clients
 * List all clients user has access to
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

    // Get user's clients via client_users table
    const { data: clientUsers, error: clientUsersError } = await supabase
      .from('client_users')
      .select('client_id, role')
      .eq('user_id', user.id);

    if (clientUsersError) {
      logger.error('Failed to fetch client users', clientUsersError);
      throw new AppError('Failed to fetch clients', 500);
    }

    if (!clientUsers || clientUsers.length === 0) {
      return NextResponse.json<ClientsResponse>({ clients: [] });
    }

    const clientIds = clientUsers.map((cu) => cu.client_id);

    // Get clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (clientsError) {
      logger.error('Failed to fetch clients', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    return NextResponse.json<ClientsResponse>({ clients: clients || [] });
  } catch (error) {
    logger.error('Error in GET /api/clients', error as Error);
    
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

