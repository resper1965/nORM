/**
 * WordPress Publisher
 * Publish generated content to WordPress as drafts
 */

import { createClient } from '@/lib/supabase/server';
import { createDraftPost, testWordPressConnection, type WordPressSiteConfig } from './client';
import { logger } from '@/lib/utils/logger';
import { decrypt } from '@/lib/utils/encryption';
import { NotFoundError, ExternalAPIError } from '@/lib/errors/errors';
import type { GeneratedContent } from '@/lib/types/domain';
import { generateComprehensiveSchema } from '@/lib/seo/schema-generator';
import { injectSchemaMarkup } from '@/lib/seo/schema-injector';

/**
 * Get WordPress site config from database (decrypted)
 */
async function getWordPressConfig(siteId: string): Promise<WordPressSiteConfig> {
  const supabase = await createClient();

  const { data: site, error } = await supabase
    .from('wordpress_sites')
    .select('site_url, username, application_password_encrypted')
    .eq('id', siteId)
    .single();

  if (error || !site) {
    throw new NotFoundError('WordPress site', siteId);
  }

  // Decrypt password
  let applicationPassword: string;
  try {
    applicationPassword = decrypt(site.application_password_encrypted);
  } catch (decryptError) {
    logger.error(`Failed to decrypt WordPress password for site ${siteId}`, decryptError as Error);
    throw new ExternalAPIError('WordPress', 'Failed to decrypt password');
  }

  return {
    siteUrl: site.site_url,
    username: site.username,
    applicationPassword,
  };
}

/**
 * Publish content to WordPress
 */
export async function publishToWordPress(
  contentId: string,
  wordpressSiteId: string
): Promise<{ wordpressPostId: number; wordpressUrl: string }> {
  const supabase = await createClient();

  // Get content
  const { data: content, error: contentError } = await supabase
    .from('generated_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    throw new NotFoundError('Generated content', contentId);
  }

  // Get WordPress config
  const config = await getWordPressConfig(wordpressSiteId);

  // Test connection first
  const connectionTest = await testWordPressConnection(config);
  if (!connectionTest.success) {
    throw new ExternalAPIError('WordPress', connectionTest.message);
  }

  // Get client info for schema
  const { data: client } = await supabase
    .from('clients')
    .select('name, website_url')
    .eq('id', content.client_id)
    .single();

  // Generate schema markup for SEO
  const schemas = generateComprehensiveSchema(content, {
    author: 'Equipe ' + (client?.name || 'Desconhecido'),
    url: config.siteUrl, // Will be updated with actual URL after post creation
    organizationName: client?.name || 'Empresa',
    organizationLogo: undefined, // TODO: Get from client settings
    imageUrl: undefined, // TODO: Get featured image if available
  });

  // Inject schema markup into content
  const contentWithSchema = injectSchemaMarkup(content.content, schemas);

  // Create post
  const result = await createDraftPost(config, {
    title: content.title,
    content: contentWithSchema,
    excerpt: content.meta_description || '',
    categories: [], // Will use default category
    tags: content.target_keywords || [],
  });

  // Update content record with WordPress post ID
  await supabase
    .from('generated_content')
    .update({
      wordpress_post_id: result.id,
      wordpress_site_id: wordpressSiteId,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  logger.info('Content published to WordPress', {
    contentId,
    wordpressPostId: result.id,
  });

  return {
    wordpressPostId: result.id,
    wordpressUrl: result.url,
  };
}

/**
 * Publish multiple articles to WordPress
 */
export async function publishMultipleToWordPress(
  contentIds: string[],
  wordpressSiteId: string
): Promise<Array<{ contentId: string; wordpressPostId: number; wordpressUrl: string; error?: string }>> {
  const results = [];

  for (const contentId of contentIds) {
    try {
      const result = await publishToWordPress(contentId, wordpressSiteId);
      results.push({
        contentId,
        ...result,
      });
    } catch (error) {
      logger.error(`Failed to publish content ${contentId} to WordPress`, error as Error);
      results.push({
        contentId,
        wordpressPostId: 0,
        wordpressUrl: '',
        error: (error as Error).message,
      });
    }
  }

  return results;
}

