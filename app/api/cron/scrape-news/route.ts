import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsForAllClients } from '@/lib/integrations/news-scraper';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/errors/errors';
import { searchGoogleNews, deduplicateArticles } from '@/lib/scraping/google-news';
import { requireCronAuth } from '@/lib/auth/cron-auth';
import { analyzeSentiment } from '@/lib/ai/sentiment';

/**
 * POST /api/cron/scrape-news
 * Scrape news mentions for all active clients (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * Searches Google News RSS feeds for client monitoring keywords
 * and stores articles with sentiment analysis
 *
 * Recommended frequency: Every 6-12 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron authentication
    const authError = requireCronAuth(request);
    if (authError) return authError;

    logger.info('Starting news scraping cron job');

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, website')
      .eq('is_active', true);

    if (clientsError) {
      logger.error('Failed to fetch clients for news scraping', clientsError);
      throw new AppError('Failed to fetch clients', 500);
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        status: 'completed',
        clients_processed: 0,
        mentions_found: 0,
        message: 'No active clients found',
      });
    }

    let totalMentionsFound = 0;
    const results = [];

    // Process each client
    for (const client of clients) {
      try {
        // Get active keywords for this client
        const { data: keywords, error: keywordsError } = await supabase
          .from('keywords')
          .select('id, keyword')
          .eq('client_id', client.id)
          .eq('is_active', true);

        if (keywordsError) {
          logger.error(`Failed to fetch keywords for client ${client.id}`, keywordsError);
          continue;
        }

        if (!keywords || keywords.length === 0) {
          logger.info(`No keywords found for client ${client.name}`);
          continue;
        }

        // Search for news using client name and keywords
        const searchQueries = [
          client.name,
          ...keywords.map((k) => k.keyword),
        ];

        const allArticles: Array<{
          title: string;
          url: string;
          excerpt?: string;
          source?: string;
          publishedAt?: Date;
        }> = [];

        // Search Google News for each query
        for (const query of searchQueries) {
          try {
            const articles = await searchGoogleNews(query, 20);
            allArticles.push(...articles);
            
            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            logger.error(`Failed to search Google News for query "${query}"`, error as Error);
            // Continue with other queries
          }
        }

        // Deduplicate articles by URL
        const uniqueArticles = deduplicateArticles(allArticles);

        // Check which articles already exist in database
        const articleUrls = uniqueArticles.map((a) => a.url);
        const { data: existingMentions } = await supabase
          .from('news_mentions')
          .select('url')
          .eq('client_id', client.id)
          .in('url', articleUrls);

        const existingUrls = new Set(existingMentions?.map((m) => m.url) || []);

        // Filter out existing articles
        const newArticles = uniqueArticles.filter((a) => !existingUrls.has(a.url));

        if (newArticles.length === 0) {
          logger.info(`No new articles found for client ${client.name}`);
          continue;
        }

        // Process each new article
        const mentionsToInsert = [];

        for (const article of newArticles) {
          try {
            // Analyze sentiment
            const textToAnalyze = `${article.title}. ${article.excerpt || ''}`.trim();
            const sentimentAnalysis = await analyzeSentiment(textToAnalyze);

            // Detect if URL belongs to client
            const isClientContent = client.website
              ? detectClientContent(article.url, client.website)
              : false;

            mentionsToInsert.push({
              client_id: client.id,
              title: article.title,
              url: article.url,
              excerpt: article.excerpt || null,
              source: article.source || null,
              published_at: article.publishedAt?.toISOString() || new Date().toISOString(),
              scraped_at: new Date().toISOString(),
              sentiment: sentimentAnalysis.sentiment,
              sentiment_score: sentimentAnalysis.score,
              sentiment_confidence: sentimentAnalysis.confidence,
              sentiment_rationale: sentimentAnalysis.rationale,
              language: 'pt-BR',
            });

            // Small delay between sentiment analyses
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Failed to process article: ${article.url}`, error as Error);
            // Continue with other articles
          }
        }

        // Insert mentions into database
        if (mentionsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('news_mentions')
            .insert(mentionsToInsert);

          if (insertError) {
            logger.error(`Failed to insert mentions for client ${client.id}`, insertError);
          } else {
            totalMentionsFound += mentionsToInsert.length;
            logger.info(`Saved ${mentionsToInsert.length} new mentions for client ${client.name}`);
          }
        }

        results.push({
          client_id: client.id,
          client_name: client.name,
          mentions_found: mentionsToInsert.length,
        });
      } catch (error) {
        logger.error(`Error processing client ${client.name}`, error as Error);
        // Continue with other clients
      }
    }

    return NextResponse.json({
      status: 'completed',
      clients_processed: clients.length,
      mentions_found: totalMentionsFound,
      results,
      message: `News scraping completed. Found ${totalMentionsFound} new mentions.`,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      logger.warn('Unauthorized cron job attempt', { error: error.message });
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    logger.error('Error in POST /api/cron/scrape-news', error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to start news scraping' },
      { status: 500 }
    );
  }
}

/**
 * Detect if a URL belongs to the client's website
 */
function detectClientContent(url: string, clientWebsite: string): boolean {
  try {
    const urlObj = new URL(url);
    const websiteObj = new URL(clientWebsite.startsWith('http') ? clientWebsite : `https://${clientWebsite}`);
    
    // Check if domains match (with or without www)
    const urlDomain = urlObj.hostname.replace(/^www\./, '');
    const websiteDomain = websiteObj.hostname.replace(/^www\./, '');
    
    return urlDomain === websiteDomain;
  } catch (error) {
    // If URL parsing fails, return false
    return false;
  }
}
