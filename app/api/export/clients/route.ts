import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClients } from '@/lib/auth/rbac';
import { arrayToCSV, formatDateForCSV } from '@/lib/utils/csv-export';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/clients
 * Export clients data as CSV
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
          'Content-Disposition': 'attachment; filename="clients.csv"',
        },
      });
    }

    // Fetch clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, industry, website, is_active, created_at')
      .in('id', clientIds)
      .order('created_at', { ascending: false });

    if (clientsError) {
      logger.error('Failed to fetch clients for export', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    // Format data for CSV
    const csvData = (clients || []).map((client) => ({
      ID: client.id,
      Name: client.name,
      Industry: client.industry || '',
      Website: client.website || '',
      'Is Active': client.is_active ? 'Yes' : 'No',
      'Created At': formatDateForCSV(client.created_at),
    }));

    // Convert to CSV
    const csv = arrayToCSV(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="clients-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/export/clients', error as Error);

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
