/**
 * SERP Tracker Service
 * Tracks SERP positions and detects changes
 */

import { createClient } from '@/lib/supabase/server';
import { checkSERPPosition, checkSERPPositionsBatch } from './serp';
import { logger } from '@/lib/utils/logger';
import { batchCheckClientContent } from '@/lib/utils/domain-matcher';
import type { SERPResult as SERPResultType } from './serp';
import type { SERPResult as DBSERPResult } from '@/lib/types/domain';

/**
 * Track SERP position for a keyword
 */
export async function trackSERPPosition(
  keywordId: string,
  keyword: string,
  clientId?: string
): Promise<DBSERPResult[]> {
  const supabase = await createClient();

  try {
    // Get client website to detect client content
    const { data: keywordData } = await supabase
      .from('keywords')
      .select('client_id, clients!inner(website)')
      .eq('id', keywordId)
      .single();

    // Handle both array and object responses from Supabase
    const clientsData = keywordData?.clients;
    const clientWebsite = Array.isArray(clientsData) 
      ? clientsData[0]?.website 
      : (clientsData as any)?.website;
    let clientDomain: string | null = null;
    
    if (clientWebsite) {
      try {
        const url = new URL(clientWebsite.startsWith('http') ? clientWebsite : `https://${clientWebsite}`);
        clientDomain = url.hostname.replace('www.', '');
      } catch {
        // Invalid URL, ignore
      }
    }

    // Check current SERP position
    const serpResponse = await checkSERPPosition(keyword);

    // Batch check which URLs belong to client
    const urls = serpResponse.results
      .map(r => r.url)
      .filter((url): url is string => Boolean(url));
    const clientContentMap = await batchCheckClientContent(urls, clientId);

    // Save results to database
    const results: DBSERPResult[] = [];

    for (const result of serpResponse.results) {
      // Detect if URL belongs to client
      let isClientContent = false;
      if (clientDomain && result.url) {
        try {
          const resultUrl = new URL(result.url);
          const resultDomain = resultUrl.hostname.replace('www.', '');
          isClientContent = resultDomain === clientDomain || resultDomain.endsWith(`.${clientDomain}`);
        } catch {
          // Invalid URL, keep as false
        }
      }

      const { data, error } = await supabase
        .from('serp_results')
        .insert({
          keyword_id: keywordId,
          position: result.position,
          url: result.url,
          title: result.title,
          snippet: result.snippet,
          domain: result.domain,
          checked_at: new Date().toISOString(),
          is_client_content: isClientContent,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to save SERP result', error);
        continue;
      }

      if (data) {
        results.push(data as DBSERPResult);
      }
    }

    const clientContentCount = results.filter(r => r.is_client_content).length;
    logger.info(`Tracked SERP for keyword: ${keyword}`, {
      keywordId,
      resultsCount: results.length,
      clientContentCount: Array.from(clientContentMap.values()).filter(Boolean).length,
    });

    return results;
  } catch (error) {
    logger.error(`Failed to track SERP for keyword: ${keyword}`, error as Error);
    throw error;
  }
}

/**
 * Track SERP positions for all active keywords of a client
 */
export async function trackClientSERPPositions(clientId: string): Promise<void> {
  const supabase = await createClient();

  // Get all active keywords for client
  const { data: keywords, error: keywordsError } = await supabase
    .from('keywords')
    .select('id, keyword')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (keywordsError) {
    logger.error('Failed to fetch keywords for SERP tracking', keywordsError);
    throw keywordsError;
  }

  if (!keywords || keywords.length === 0) {
    logger.info(`No active keywords found for client: ${clientId}`);
    return;
  }

  // Track each keyword
  for (const keyword of keywords) {
    try {
      await trackSERPPosition(keyword.id, keyword.keyword);
      // Small delay between keywords to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error(`Failed to track keyword: ${keyword.keyword}`, error as Error);
      // Continue with other keywords
    }
  }
}

/**
 * Detect position changes and trigger alerts if needed
 */
export async function detectSERPChanges(
  keywordId: string,
  alertThreshold: number = 3
): Promise<{
  hasChange: boolean;
  change: number;
  currentPosition: number | null;
  previousPosition: number | null;
}> {
  const supabase = await createClient();

  // Get last two SERP checks
  const { data: results, error } = await supabase
    .from('serp_results')
    .select('position, checked_at')
    .eq('keyword_id', keywordId)
    .order('checked_at', { ascending: false })
    .limit(2);

  if (error || !results || results.length < 2) {
    return {
      hasChange: false,
      change: 0,
      currentPosition: results?.[0]?.position || null,
      previousPosition: null,
    };
  }

  const currentPosition = results[0].position;
  const previousPosition = results[1].position;

  if (currentPosition === null || previousPosition === null) {
    return {
      hasChange: false,
      change: 0,
      currentPosition,
      previousPosition,
    };
  }

  const change = Math.abs(currentPosition - previousPosition);
  const hasChange = change >= alertThreshold;

  return {
    hasChange,
    change,
    currentPosition,
    previousPosition,
  };
}

