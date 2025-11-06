import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError } from '@/lib/errors/errors';
import type { ClientsResponse, ErrorResponse, ClientResponse } from '@/lib/types/api';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industry: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  keywords: z.array(z.string()).optional(),
});

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

/**
 * POST /api/clients
 * Create a new client
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
    const validation = createClientSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const { name, industry, website, keywords } = validation.data;

    // Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name,
        industry: industry || null,
        website: website || null,
        is_active: true,
      })
      .select()
      .single();

    if (clientError || !client) {
      if (clientError) {
        logger.error('Failed to create client', new Error(clientError.message));
      }
      throw new AppError('Failed to create client', 500);
    }

    // Add user as admin of the client
    const { error: clientUserError } = await supabase
      .from('client_users')
      .insert({
        client_id: client.id,
        user_id: user.id,
        role: 'admin',
      });

    if (clientUserError) {
      logger.error('Failed to create client_user relationship', clientUserError);
      // Continue anyway, client was created
    }

    // Add keywords if provided
    if (keywords && keywords.length > 0) {
      const keywordsToInsert = keywords.map((keyword) => ({
        client_id: client.id,
        keyword: keyword.trim(),
        is_active: true,
        alert_threshold: 5, // Default threshold
      }));

      const { error: keywordsError } = await supabase
        .from('keywords')
        .insert(keywordsToInsert);

      if (keywordsError) {
        logger.error('Failed to create keywords', keywordsError);
        // Continue anyway, client was created
      }
    }

    return NextResponse.json<ClientResponse>({ client }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/clients', error as Error);
    
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

