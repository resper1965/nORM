/**
 * Client Content Detector
 * Detects if a URL belongs to client's content (SEO critical)
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Check if a URL belongs to client's content
 * Critical for accurate SERP tracking and reputation score
 */
export async function isClientContent(
  url: string,
  clientId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const urlObj = new URL(url);
    const urlDomain = urlObj.hostname.replace(/^www\./, ''); // Remove www.

    // 1. Check WordPress sites domains
    const { data: wordpressSites } = await supabase
      .from('wordpress_sites')
      .select('site_url')
      .eq('client_id', clientId);

    if (wordpressSites && wordpressSites.length > 0) {
      const wordpressDomains = wordpressSites.map(site => {
        try {
          return new URL(site.site_url).hostname.replace(/^www\./, '');
        } catch {
          return null;
        }
      }).filter(Boolean) as string[];

      if (wordpressDomains.some(domain => domain === urlDomain)) {
        logger.info('URL matched WordPress site', { url, clientId, urlDomain });
        return true;
      }
    }

    // 2. Check generated content URLs
    const { data: generatedContent } = await supabase
      .from('generated_content')
      .select('id, wordpress_url')
      .eq('client_id', clientId)
      .eq('status', 'published')
      .not('wordpress_url', 'is', null);

    if (generatedContent && generatedContent.length > 0) {
      const generatedUrls = generatedContent
        .map(c => c.wordpress_url)
        .filter(Boolean) as string[];

      // Normalize URLs for comparison
      const normalizedUrl = url.toLowerCase().replace(/\/$/, ''); // Remove trailing slash
      const normalizedGenerated = generatedUrls.map(u =>
        u.toLowerCase().replace(/\/$/, '')
      );

      if (normalizedGenerated.includes(normalizedUrl)) {
        logger.info('URL matched generated content', { url, clientId });
        return true;
      }
    }

    // 3. Check client's registered domains (if table exists)
    // Future: add a 'client_domains' table for additional domains
    const { data: client } = await supabase
      .from('clients')
      .select('website_url')
      .eq('id', clientId)
      .single();

    if (client?.website_url) {
      try {
        const clientDomain = new URL(client.website_url).hostname.replace(/^www\./, '');
        if (clientDomain === urlDomain) {
          logger.info('URL matched client website', { url, clientId, urlDomain });
          return true;
        }
      } catch (error) {
        logger.warn('Invalid client website URL', { url: client.website_url });
      }
    }

    return false;
  } catch (error) {
    logger.error('Error detecting client content', error as Error, { url, clientId });
    // Fail open: return false if error
    return false;
  }
}

/**
 * Check if a URL is client content (batch version for performance)
 */
export async function isClientContentBatch(
  urls: string[],
  clientId: string
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  try {
    const supabase = await createClient();

    // Get all client data in one query
    const [wordpressSites, generatedContent, client] = await Promise.all([
      supabase
        .from('wordpress_sites')
        .select('site_url')
        .eq('client_id', clientId),
      supabase
        .from('generated_content')
        .select('wordpress_url')
        .eq('client_id', clientId)
        .eq('status', 'published')
        .not('wordpress_url', 'is', null),
      supabase
        .from('clients')
        .select('website_url')
        .eq('id', clientId)
        .single(),
    ]);

    // Build domain sets
    const clientDomains = new Set<string>();
    const clientUrls = new Set<string>();

    // Add WordPress domains
    if (wordpressSites.data) {
      wordpressSites.data.forEach(site => {
        try {
          const domain = new URL(site.site_url).hostname.replace(/^www\./, '');
          clientDomains.add(domain);
        } catch {}
      });
    }

    // Add generated content URLs
    if (generatedContent.data) {
      generatedContent.data.forEach(content => {
        if (content.wordpress_url) {
          const normalized = content.wordpress_url.toLowerCase().replace(/\/$/, '');
          clientUrls.add(normalized);
        }
      });
    }

    // Add client website domain
    if (client.data?.website_url) {
      try {
        const domain = new URL(client.data.website_url).hostname.replace(/^www\./, '');
        clientDomains.add(domain);
      } catch {}
    }

    // Check each URL
    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const urlDomain = urlObj.hostname.replace(/^www\./, '');
        const normalizedUrl = url.toLowerCase().replace(/\/$/, '');

        const isClient =
          clientDomains.has(urlDomain) ||
          clientUrls.has(normalizedUrl);

        results.set(url, isClient);
      } catch {
        results.set(url, false);
      }
    }

    return results;
  } catch (error) {
    logger.error('Error in batch client content detection', error as Error);
    // Return false for all URLs on error
    urls.forEach(url => results.set(url, false));
    return results;
  }
}

/**
 * Get client content statistics
 */
export async function getClientContentStats(clientId: string) {
  const supabase = await createClient();

  // Count published content
  const { count: publishedCount } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 'published');

  // Count WordPress sites
  const { count: sitesCount } = await supabase
    .from('wordpress_sites')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  // Count SERP results with client content
  // Get keywords for client first, then count SERP results
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_active', true);

  const keywordIds = keywords?.map(k => k.id) || [];
  
  const { count: serpClientContent } = keywordIds.length > 0
    ? await supabase
        .from('serp_results')
        .select('*', { count: 'exact', head: true })
        .eq('is_client_content', true)
        .in('keyword_id', keywordIds)
    : { count: 0 };

  return {
    publishedArticles: publishedCount || 0,
    wordpressSites: sitesCount || 0,
    serpPositionsOwned: serpClientContent || 0,
  };
}
