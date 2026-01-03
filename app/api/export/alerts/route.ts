import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClients } from '@/lib/auth/rbac';
import { arrayToCSV, formatDateTimeForCSV } from '@/lib/utils/csv-export';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/alerts
 * Export alerts data as CSV
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
          'Content-Disposition': 'attachment; filename="alerts.csv"',
        },
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');
    const clientId = searchParams.get('client_id');

    // Build query
    let query = supabase
      .from('alerts')
      .select(`
        id,
        client_id,
        alert_type,
        severity,
        title,
        message,
        status,
        email_sent,
        created_at
      `)
      .in('client_id', clientId ? [clientId] : clientIds)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      logger.error('Failed to fetch alerts for export', alertsError);
      throw new AppError('Failed to fetch alerts', 500);
    }

    // Fetch client names separately
    const clientIdsToFetch = [...new Set((alerts || []).map((a: any) => a.client_id))];
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name')
      .in('id', clientIdsToFetch);

    const clientMap = new Map((clients || []).map((c: any) => [c.id, c.name]));

    // Format data for CSV
    const csvData = (alerts || []).map((alert: any) => ({
      ID: alert.id,
      'Client Name': clientMap.get(alert.client_id) || '',
      'Alert Type': alert.alert_type,
      Severity: alert.severity,
      Title: alert.title,
      Message: alert.message,
      Status: alert.status,
      'Email Sent': alert.email_sent ? 'Yes' : 'No',
      'Created At': formatDateTimeForCSV(alert.created_at),
    }));

    // Convert to CSV
    const csv = arrayToCSV(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="alerts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/export/alerts', error as Error);

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
