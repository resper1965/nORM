/**
 * Backlink Tracker
 * Tracks backlinks using Google Search Console API (FREE)
 * Critical for SEO - backlinks are ~40% of Google ranking
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export interface Backlink {
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText?: string;
  domainAuthority?: number;
  relAttribute?: 'dofollow' | 'nofollow' | 'sponsored' | 'ugc';
  status: 'active' | 'lost' | 'broken' | 'redirect';
  discoveredBy: 'manual' | 'google_search_console' | 'crawler' | 'api';
}

export interface BacklinkStats {
  activeBacklinks: number;
  lostBacklinks: number;
  brokenBacklinks: number;
  dofollowBacklinks: number;
  avgDomainAuthority: number | null;
  newBacklinksLast30Days: number;
  lostBacklinksLast30Days: number;
}

/**
 * Add or update a backlink in the database
 */
export async function trackBacklink(
  clientId: string,
  backlink: Backlink
): Promise<void> {
  const supabase = await createClient();

  try {
    // Check if backlink already exists
    const { data: existing } = await supabase
      .from('backlinks')
      .select('id, status')
      .eq('client_id', clientId)
      .eq('source_url', backlink.sourceUrl)
      .eq('target_url', backlink.targetUrl)
      .single();

    if (existing) {
      // Update existing backlink
      const updateData: any = {
        status: backlink.status,
        last_checked_at: new Date().toISOString(),
      };

      // If link was lost, record when
      if (backlink.status === 'lost' && existing.status === 'active') {
        updateData.lost_at = new Date().toISOString();
      }

      // If link became active again, clear lost_at
      if (backlink.status === 'active' && existing.status === 'lost') {
        updateData.lost_at = null;
      }

      await supabase
        .from('backlinks')
        .update(updateData)
        .eq('id', existing.id);

      logger.info('Updated backlink', {
        clientId,
        sourceUrl: backlink.sourceUrl,
        status: backlink.status,
      });
    } else {
      // Insert new backlink
      await supabase
        .from('backlinks')
        .insert({
          client_id: clientId,
          source_url: backlink.sourceUrl,
          source_domain: backlink.sourceDomain,
          target_url: backlink.targetUrl,
          anchor_text: backlink.anchorText,
          domain_authority: backlink.domainAuthority,
          rel_attribute: backlink.relAttribute,
          is_nofollow: backlink.relAttribute === 'nofollow',
          status: backlink.status,
          discovered_by: backlink.discoveredBy,
        });

      logger.info('Added new backlink', {
        clientId,
        sourceUrl: backlink.sourceUrl,
        targetUrl: backlink.targetUrl,
      });
    }
  } catch (error) {
    logger.error('Failed to track backlink', error as Error, {
      clientId,
      sourceUrl: backlink.sourceUrl,
    });
    throw error;
  }
}

/**
 * Get backlink statistics for a client
 */
export async function getBacklinkStats(clientId: string): Promise<BacklinkStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('backlink_stats')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    logger.error('Failed to get backlink stats', error);
    // Return zero stats if no data
    return {
      activeBacklinks: 0,
      lostBacklinks: 0,
      brokenBacklinks: 0,
      dofollowBacklinks: 0,
      avgDomainAuthority: null,
      newBacklinksLast30Days: 0,
      lostBacklinksLast30Days: 0,
    };
  }

  return {
    activeBacklinks: data.active_backlinks || 0,
    lostBacklinks: data.lost_backlinks || 0,
    brokenBacklinks: data.broken_backlinks || 0,
    dofollowBacklinks: data.dofollow_backlinks || 0,
    avgDomainAuthority: data.avg_domain_authority,
    newBacklinksLast30Days: data.new_backlinks_last_30_days || 0,
    lostBacklinksLast30Days: data.lost_backlinks_last_30_days || 0,
  };
}

/**
 * Get list of backlinks for a client
 */
export async function getBacklinks(
  clientId: string,
  options: {
    status?: 'active' | 'lost' | 'broken' | 'redirect';
    limit?: number;
    orderBy?: 'domain_authority' | 'first_seen_at' | 'last_checked_at';
  } = {}
): Promise<Backlink[]> {
  const supabase = await createClient();

  let query = supabase
    .from('backlinks')
    .select('*')
    .eq('client_id', clientId);

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: false });
  } else {
    query = query.order('last_checked_at', { ascending: false });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to get backlinks', error);
    return [];
  }

  return (data || []).map(b => ({
    sourceUrl: b.source_url,
    sourceDomain: b.source_domain,
    targetUrl: b.target_url,
    anchorText: b.anchor_text,
    domainAuthority: b.domain_authority,
    relAttribute: b.rel_attribute,
    status: b.status,
    discoveredBy: b.discovered_by,
  }));
}

/**
 * Check for new backlinks from Google Search Console
 * This is a placeholder - actual implementation requires Google Search Console API setup
 */
export async function checkGoogleSearchConsole(
  clientId: string,
  siteUrl: string
): Promise<void> {
  // TODO: Implement Google Search Console API integration
  // Steps:
  // 1. Install @google-cloud/search-console or googleapis
  // 2. Authenticate with service account
  // 3. Call searchanalytics.query with dimension: 'page' and filter for links
  // 4. Parse results and call trackBacklink() for each link found

  logger.warn('Google Search Console integration not yet implemented', {
    clientId,
    siteUrl,
  });

  // For now, this is a placeholder
  // In production, you would:
  /*
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      dimensions: ['page'],
      type: 'web',
    },
  });

  // Process response and extract backlinks
  */
}

/**
 * Find unlinked brand mentions (opportunities for link building)
 */
export async function findUnlinkedMentions(
  clientId: string,
  brandName: string
): Promise<Array<{ url: string; title: string; snippet: string }>> {
  // TODO: Implement brand mention search
  // Use Google News API or scraping to find mentions of client name
  // Filter out URLs that are already in backlinks table
  // Return opportunities for outreach

  const supabase = await createClient();

  // Get existing backlinks to avoid duplicates
  const { data: existingBacklinks } = await supabase
    .from('backlinks')
    .select('source_url')
    .eq('client_id', clientId);

  const existingUrls = new Set(
    (existingBacklinks || []).map(b => b.source_url)
  );

  logger.info('Finding unlinked mentions', { clientId, brandName });

  // TODO: Search for brand mentions and filter out existing URLs
  // For now, return empty array
  return [];
}

/**
 * Analyze backlink profile and generate recommendations
 */
export async function analyzeBacklinkProfile(
  clientId: string
): Promise<{
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}> {
  const stats = await getBacklinkStats(clientId);
  const backlinks = await getBacklinks(clientId, { status: 'active' });

  const recommendations: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze backlink count
  if (stats.activeBacklinks < 10) {
    weaknesses.push('Muito poucos backlinks ativos (menos de 10)');
    recommendations.push('Priorize construção de backlinks através de guest posts e parcerias');
  } else if (stats.activeBacklinks > 50) {
    strengths.push(`Boa quantidade de backlinks ativos (${stats.activeBacklinks})`);
  }

  // Analyze dofollow ratio
  const dofollowRatio = stats.activeBacklinks > 0
    ? stats.dofollowBacklinks / stats.activeBacklinks
    : 0;

  if (dofollowRatio < 0.3) {
    weaknesses.push('Poucos backlinks dofollow (menos de 30%)');
    recommendations.push('Busque backlinks dofollow de sites relevantes');
  } else if (dofollowRatio > 0.7) {
    strengths.push(`Boa proporção de backlinks dofollow (${Math.round(dofollowRatio * 100)}%)`);
  }

  // Analyze domain authority
  if (stats.avgDomainAuthority && stats.avgDomainAuthority < 30) {
    weaknesses.push('Domain Authority médio baixo (< 30)');
    recommendations.push('Foque em conseguir backlinks de sites com DA > 40');
  } else if (stats.avgDomainAuthority && stats.avgDomainAuthority > 50) {
    strengths.push(`Ótimo Domain Authority médio (${Math.round(stats.avgDomainAuthority)})`);
  }

  // Analyze backlink loss rate
  if (stats.lostBacklinksLast30Days > stats.newBacklinksLast30Days) {
    weaknesses.push('Perdendo mais backlinks do que ganhando');
    recommendations.push('Investigue backlinks perdidos e tente recuperá-los');
  }

  // Calculate overall score (0-100)
  let score = 0;

  // Backlink count (max 30 points)
  score += Math.min(30, (stats.activeBacklinks / 100) * 30);

  // Dofollow ratio (max 25 points)
  score += dofollowRatio * 25;

  // Domain authority (max 25 points)
  if (stats.avgDomainAuthority) {
    score += (stats.avgDomainAuthority / 100) * 25;
  }

  // Growth trend (max 20 points)
  const netGrowth = stats.newBacklinksLast30Days - stats.lostBacklinksLast30Days;
  score += Math.max(0, Math.min(20, netGrowth * 2));

  return {
    score: Math.round(score),
    recommendations,
    strengths,
    weaknesses,
  };
}
