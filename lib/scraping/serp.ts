/**
 * SERP API Integration
 * Google Search Results Page tracking via SerpAPI
 */

import axios from 'axios';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { rateLimiter, RATE_LIMITS } from './rate-limiter';
import { ExternalAPIError, RateLimitError } from '@/lib/errors/errors';

export interface SERPResult {
  position: number | null;
  url: string;
  title?: string;
  snippet?: string;
  domain?: string;
}

export interface SERPResponse {
  results: SERPResult[];
  totalResults?: number;
}

/**
 * Check SERP position for a keyword
 * @param keyword Search keyword
 * @param location Location for search (default: Brazil)
 * @returns SERP results
 */
export async function checkSERPPosition(
  keyword: string,
  location: string = 'Brazil'
): Promise<SERPResponse> {
  if (!env.SERPAPI_KEY) {
    throw new ExternalAPIError('SerpAPI', 'API key not configured');
  }

  // Rate limiting
  const rateLimitKey = `serpapi:${location}`;
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.SCRAPING)) {
    const waitTime = rateLimiter.getTimeUntilNext(rateLimitKey, RATE_LIMITS.SCRAPING);
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
    );
  }

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: env.SERPAPI_KEY,
        q: keyword,
        engine: 'google',
        google_domain: 'google.com.br', // Brazil only for MVP
        location: location,
        hl: 'pt-br', // Portuguese (Brazil)
        gl: 'br', // Country: Brazil
        num: 100, // Get top 100 results
      },
      timeout: 30000, // 30 second timeout
    });

    const organicResults = response.data.organic_results || [];
    const results: SERPResult[] = organicResults.map((result: any, index: number) => ({
      position: index + 1,
      url: result.link || '',
      title: result.title || '',
      snippet: result.snippet || '',
      domain: result.displayed_link ? new URL(result.link).hostname : undefined,
    }));

    return {
      results,
      totalResults: response.data.search_information?.total_results,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new RateLimitError('SerpAPI rate limit exceeded');
      }
      throw new ExternalAPIError(
        'SerpAPI',
        error.message,
        error
      );
    }
    throw new ExternalAPIError('SerpAPI', 'Unknown error', error as Error);
  }
}

/**
 * Check multiple keywords in batch
 * Note: SerpAPI supports batch requests, but we'll do sequential for MVP
 */
export async function checkSERPPositionsBatch(
  keywords: string[],
  location: string = 'Brazil'
): Promise<Map<string, SERPResponse>> {
  const results = new Map<string, SERPResponse>();

  for (const keyword of keywords) {
    try {
      const result = await checkSERPPosition(keyword, location);
      results.set(keyword, result);
      
      // Small delay between requests to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error(`Failed to check SERP for keyword: ${keyword}`, error as Error);
      // Continue with other keywords even if one fails
    }
  }

  return results;
}

