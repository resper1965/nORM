/**
 * News Scraper Service
 * Scrapes news articles from Google News and RSS feeds
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { analyzeSentiment } from '@/lib/ai/sentiment';

export interface ScrapeStats {
  clientsProcessed: number;
  articlesAdded: number;
  errors: number;
}

export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

/**
 * Search Google News via RSS feed
 * Uses public RSS feed (no API key required)
 */
async function searchGoogleNews(
  query: string,
  limit: number = 10
): Promise<NewsArticle[]> {
  try {
    // Google News RSS feed URL
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; nORM/1.0; +https://norm.app)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google News RSS returned ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML (simple regex-based parsing for RSS)
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    const articles: NewsArticle[] = [];

    for (const item of items.slice(0, limit)) {
      try {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || '';
        const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1] || 'Google News';

        if (title && link) {
          articles.push({
            title: title.trim(),
            description: description.trim() || undefined,
            url: link.trim(),
            source: source.trim(),
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            imageUrl: undefined,
          });
        }
      } catch (error) {
        logger.warn('Failed to parse RSS item', { error });
      }
    }

    return articles;
  } catch (error) {
    logger.error('Failed to search Google News', error as Error, { query });
    return [];
  }
}

/**
 * Scrape news mentions for a client
 */
export async function scrapeNewsForClient(
  clientId: string,
  searchTerms: string[]
): Promise<number> {
  const supabase = await createClient();
  let articlesAdded = 0;

  try {
    logger.info('Starting news scrape for client', { clientId, searchTerms });

    for (const term of searchTerms) {
      try {
        const articles = await searchGoogleNews(term, 10);

        for (const article of articles) {
          try {
            // Check if article already exists
            const { data: existing } = await supabase
              .from('news_mentions')
              .select('id')
              .eq('url', article.url)
              .eq('client_id', clientId)
              .single();

            if (existing) {
              continue; // Skip duplicate
            }

            // Analyze sentiment of title + description
            const content = `${article.title}\n${article.description || ''}`;
            let sentiment: 'positive' | 'neutral' | 'negative' | null = null;
            let sentimentScore: number | null = null;
            let sentimentConfidence: number | null = null;

            if (content.trim()) {
              const sentimentResult = await analyzeSentiment(content);
              sentiment = sentimentResult.sentiment;
              sentimentScore = sentimentResult.score;
              sentimentConfidence = sentimentResult.confidence;
            }

            // Insert news mention
            const { error } = await supabase
              .from('news_mentions')
              .insert({
                client_id: clientId,
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source,
                published_at: article.publishedAt,
                image_url: article.imageUrl,
                search_term: term,
                sentiment,
                sentiment_score: sentimentScore,
                sentiment_confidence: sentimentConfidence,
                scraped_at: new Date().toISOString(),
              });

            if (error) {
              logger.error('Failed to insert news mention', error, { url: article.url });
            } else {
              articlesAdded++;
            }

            // Delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            logger.error('Failed to process news article', error as Error, { url: article.url });
          }
        }

        // Delay between search terms
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error('Failed to search news for term', error as Error, { term });
      }
    }

    logger.info('News scrape completed for client', { clientId, articlesAdded });
    return articlesAdded;
  } catch (error) {
    logger.error('News scrape failed for client', error as Error, { clientId });
    return articlesAdded;
  }
}

/**
 * Scrape news for all active clients
 */
export async function scrapeNewsForAllClients(): Promise<ScrapeStats> {
  const supabase = await createClient();
  const stats: ScrapeStats = {
    clientsProcessed: 0,
    articlesAdded: 0,
    errors: 0,
  };

  try {
    // Get all active clients with monitoring keywords
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, monitoring_keywords')
      .eq('is_active', true)
      .not('monitoring_keywords', 'is', null);

    if (error) {
      logger.error('Failed to fetch clients for news scraping', error);
      throw error;
    }

    if (!clients || clients.length === 0) {
      logger.info('No active clients with monitoring keywords');
      return stats;
    }

    logger.info(`Starting news scrape for ${clients.length} clients`);

    for (const client of clients) {
      try {
        // Parse monitoring keywords (assuming comma-separated or array)
        let searchTerms: string[] = [];

        if (Array.isArray(client.monitoring_keywords)) {
          searchTerms = client.monitoring_keywords;
        } else if (typeof client.monitoring_keywords === 'string') {
          searchTerms = client.monitoring_keywords
            .split(',')
            .map(term => term.trim())
            .filter(term => term.length > 0);
        }

        if (searchTerms.length === 0) {
          logger.warn('Client has no valid monitoring keywords', { clientId: client.id });
          continue;
        }

        const articlesAdded = await scrapeNewsForClient(client.id, searchTerms);

        stats.clientsProcessed++;
        stats.articlesAdded += articlesAdded;

        // Update last scraped timestamp
        await supabase
          .from('clients')
          .update({ last_news_scraped_at: new Date().toISOString() })
          .eq('id', client.id);

        // Delay between clients to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        logger.error(`Failed to scrape news for client ${client.id}`, error as Error);
        stats.errors++;
      }
    }

    logger.info('News scrape completed for all clients', {
      clientsProcessed: stats.clientsProcessed,
      articlesAdded: stats.articlesAdded,
      errors: stats.errors,
    });

    return stats;
  } catch (error) {
    logger.error('Failed to scrape news for all clients', error as Error);
    throw error;
  }
}

/**
 * Parse RSS feed (generic parser)
 */
export async function parseRSSFeed(feedUrl: string, limit: number = 10): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; nORM/1.0; +https://norm.app)',
      },
    });

    if (!response.ok) {
      throw new Error(`RSS feed returned ${response.status}`);
    }

    const xmlText = await response.text();
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    const articles: NewsArticle[] = [];

    for (const item of items.slice(0, limit)) {
      try {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                     item.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                           item.match(/<description>(.*?)<\/description>/)?.[1] || '';

        if (title && link) {
          articles.push({
            title: title.trim(),
            description: description.trim() || undefined,
            url: link.trim(),
            source: new URL(feedUrl).hostname,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.warn('Failed to parse RSS item', { error });
      }
    }

    return articles;
  } catch (error) {
    logger.error('Failed to parse RSS feed', error as Error, { feedUrl });
    return [];
  }
}
