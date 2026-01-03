import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/utils/encryption';
import { testWordPressConnection, type WordPressSiteConfig } from '@/lib/wordpress/client';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError } from '@/lib/errors/errors';
import { z } from 'zod';

const createSiteSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  site_url: z.string().url(),
  username: z.string().min(1),
  application_password: z.string().min(1),
});

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  site_url: z.string().url().optional(),
  username: z.string().min(1).optional(),
  application_password: z.string().min(1).optional(),
});

/**
 * GET /api/wordpress/sites
 * List WordPress sites for current user's clients
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
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get client_id from query params (optional)
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('wordpress_sites')
      .select('id, client_id, name, site_url, username, is_active, created_at, updated_at');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: sites, error } = await query;

    if (error) {
      logger.error('Failed to fetch WordPress sites', error);
      throw new AppError('Failed to fetch sites', 500);
    }

    return NextResponse.json({ sites: sites || [] });
  } catch (error) {
    logger.error('Error in GET /api/wordpress/sites', error as Error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.code || 'ERROR', message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wordpress/sites
 * Create a new WordPress site connection
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
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createSiteSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const { client_id, name, site_url, username, application_password } = validation.data;

    // Test WordPress connection before saving
    const testConfig: WordPressSiteConfig = {
      siteUrl: site_url,
      username,
      applicationPassword: application_password,
    };

    const connectionTest = await testWordPressConnection(testConfig);

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          error: 'Connection Failed',
          message: `Failed to connect to WordPress: ${connectionTest.message}`,
        },
        { status: 400 }
      );
    }

    // Encrypt password
    const encryptedPassword = encrypt(application_password);

    // Create site
    const { data: site, error } = await supabase
      .from('wordpress_sites')
      .insert({
        client_id,
        name,
        site_url,
        username,
        application_password_encrypted: encryptedPassword,
        is_active: true,
      })
      .select('id, client_id, name, site_url, username, is_active, created_at')
      .single();

    if (error) {
      logger.error('Failed to create WordPress site', error);
      throw new AppError('Failed to create site', 500);
    }

    logger.info('WordPress site created successfully', { siteId: site.id, clientId: client_id });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/wordpress/sites', error as Error);

    if (error instanceof AppError || error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.code || 'ERROR', message: error.message },
        { status: error instanceof AppError ? error.statusCode : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
