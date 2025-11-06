import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClients } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import type { AlertsResponse, ErrorResponse } from '@/lib/types/api';

/**
 * GET /api/alerts
 * Get active alerts for all clients user has access to
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

    // Get user's clients
    const clientIds = await getUserClients(user.id);

    if (clientIds.length === 0) {
      return NextResponse.json<AlertsResponse>({ alerts: [] });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');
    const clientId = searchParams.get('client_id');

    // Build query
    let query = supabase
      .from('alerts')
      .select('*')
      .in('client_id', clientId ? [clientId] : clientIds)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100);

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      logger.error('Failed to fetch alerts', alertsError);
      throw new AppError('Failed to fetch alerts', 500);
    }

    return NextResponse.json<AlertsResponse>({ alerts: alerts || [] });
  } catch (error) {
    logger.error('Error in GET /api/alerts', error as Error);

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

