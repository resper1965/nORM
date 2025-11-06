/**
 * Google News Scraper
 * Scrapes Google News Brasil for client mentions
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';
import { logger } from '@/lib/utils/logger';
import { rateLimiter, RATE_LIMITS } from './rate-limiter';
import { ExternalAPIError, RateLimitError } from '@/lib/errors/errors';

export interface NewsArticle {
  title: string;
  url: string;
  excerpt?: string;
  source?: string;
  publishedAt?: Date;
}

/**
 * Search Google News for mentions
 * @param query Search query (client name or keyword)
 * @param maxResults Maximum number of results (default: 20)
 */
export async function searchGoogleNews(
  query: string,
  maxResults: number = 20
): Promise<NewsArticle[]> {
  // Rate limiting
  const rateLimitKey = 'googlenews:search';
  if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.SCRAPING)) {
    const waitTime = rateLimiter.getTimeUntilNext(rateLimitKey, RATE_LIMITS.SCRAPING);
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
    );
  }

  try {
    // Google News RSS feed (free, no API key needed)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    
    const response = await axios.get(rssUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; nORM/1.0)',
      },
    });

    // Parse RSS XML using JSDOM (server-side)
    const dom = new JSDOM(response.data, { contentType: 'text/xml' });
    const xmlDoc = dom.window.document;
    const items = xmlDoc.querySelectorAll('item');

    const articles: NewsArticle[] = [];
    const max = Math.min(items.length, maxResults);

    for (let i = 0; i < max; i++) {
      const item = items[i];
      const title = item?.querySelector('title')?.textContent || '';
      const link = item?.querySelector('link')?.textContent || '';
      const description = item?.querySelector('description')?.textContent || '';
      const pubDate = item?.querySelector('pubDate')?.textContent;
      const source = item?.querySelector('source')?.textContent;

      // Extract actual URL from Google News redirect
      // Google News links are redirects, we need to extract the real URL
      const urlMatch = description.match(/<a href="([^"]+)"/);
      const actualUrl = urlMatch ? urlMatch[1] : link;

      articles.push({
        title: title.trim(),
        url: actualUrl,
        excerpt: description.replace(/<[^>]*>/g, '').trim(),
        source: source || undefined,
        publishedAt: pubDate ? new Date(pubDate) : undefined,
      });
    }

    return articles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new RateLimitError('Google News rate limit exceeded');
      }
      throw new ExternalAPIError(
        'Google News',
        error.message,
        error
      );
    }
    throw new ExternalAPIError('Google News', 'Unknown error', error as Error);
  }
}

/**
 * Deduplicate articles by URL
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const url = new URL(article.url).href; // Normalize URL
    if (seen.has(url)) {
      return false;
    }
    seen.add(url);
    return true;
  });
}

