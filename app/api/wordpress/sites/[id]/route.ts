import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/utils/crypto';
import { testWordPressConnection, type WordPressSiteConfig } from '@/lib/wordpress/client';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError } from '@/lib/errors/errors';
import { z } from 'zod';

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  site_url: z.string().url().optional(),
  username: z.string().min(1).optional(),
  application_password: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/wordpress/sites/[id]
 * Get a single WordPress site
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get site
    const { data: site, error } = await supabase
      .from('wordpress_sites')
      .select('id, client_id, name, site_url, username, is_active, created_at, updated_at')
      .eq('id', params.id)
      .single();

    if (error || !site) {
      return NextResponse.json(
        { error: 'Not Found', message: 'WordPress site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ site });
  } catch (error) {
    logger.error('Error in GET /api/wordpress/sites/[id]', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/wordpress/sites/[id]
 * Update a WordPress site
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validation = updateSiteSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const data = validation.data;

    // If updating credentials, test connection first
    if (data.site_url || data.username || data.application_password) {
      // Get current site data
      const { data: currentSite, error: fetchError } = await supabase
        .from('wordpress_sites')
        .select('site_url, username, application_password_encrypted')
        .eq('id', params.id)
        .single();

      if (fetchError || !currentSite) {
        return NextResponse.json(
          { error: 'Not Found', message: 'WordPress site not found' },
          { status: 404 }
        );
      }

      // Build test config with new values
      const testConfig: WordPressSiteConfig = {
        siteUrl: data.site_url || currentSite.site_url,
        username: data.username || currentSite.username,
        applicationPassword: data.application_password || currentSite.application_password_encrypted,
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
    }

    // Prepare update data
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Encrypt password if provided
    if (data.application_password) {
      updateData.application_password_encrypted = encrypt(data.application_password);
      delete updateData.application_password;
    }

    // Update site
    const { data: site, error } = await supabase
      .from('wordpress_sites')
      .update(updateData)
      .eq('id', params.id)
      .select('id, client_id, name, site_url, username, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Failed to update WordPress site', error);
      throw new AppError('Failed to update site', 500);
    }

    logger.info('WordPress site updated successfully', { siteId: params.id });

    return NextResponse.json({ site });
  } catch (error) {
    logger.error('Error in PUT /api/wordpress/sites/[id]', error as Error);

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

/**
 * DELETE /api/wordpress/sites/[id]
 * Delete a WordPress site
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete site
    const { error } = await supabase
      .from('wordpress_sites')
      .delete()
      .eq('id', params.id);

    if (error) {
      logger.error('Failed to delete WordPress site', error);
      throw new AppError('Failed to delete site', 500);
    }

    logger.info('WordPress site deleted successfully', { siteId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/wordpress/sites/[id]', error as Error);

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
