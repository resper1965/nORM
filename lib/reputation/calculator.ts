/**
 * Reputation Score Calculator
 * Calculates reputation score (0-100) based on multiple factors
 */

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

interface ScoreBreakdown {
  serp: number;
  news: number;
  social: number;
  trend: number;
  volume: number;
}

interface CalculateScoreParams {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Calculate reputation score for a client
 *
 * Weights:
 * - SERP Position: 35%
 * - News Sentiment: 25%
 * - Social Sentiment: 20%
 * - Trend (Sentiment Change): 15%
 * - Volume (Positive Ratio): 5%
 */
export async function calculateReputationScore(
  params: CalculateScoreParams
): Promise<{ score: number; breakdown: ScoreBreakdown }> {
  try {
    const supabase = await createClient();
    const { clientId, periodStart, periodEnd } = params;

    // Check cache first (cache for 1 hour)
    const { cacheService } = await import('@/lib/services/cache');
    const cacheKey = `reputation:score:${clientId}:${periodStart.toISOString()}:${periodEnd.toISOString()}`;
    const cached = await cacheService.get<{ score: number; breakdown: ScoreBreakdown }>(cacheKey);
    
    if (cached) {
      logger.debug('Returning cached reputation score', { clientId, cacheKey });
      return cached;
    }

    // 1. SERP Score (35%)
    // First, get all keyword IDs for this client
    const { data: clientKeywords, error: keywordsError } = await supabase
      .from("keywords")
      .select("id")
      .eq("client_id", clientId)
      .eq("is_active", true);

    if (keywordsError) {
      logger.error("Error fetching client keywords", keywordsError as Error);
    }

    // Then fetch SERP results for those keywords
    const keywordIds = clientKeywords?.map((k) => k.id) || [];
    let serpResults: { position: number }[] = [];

    if (keywordIds.length > 0) {
      const { data, error: serpError } = await supabase
        .from("serp_results")
        .select("position")
        .in("keyword_id", keywordIds)
        .not("position", "is", null)
        .lte("position", 20)
        .gte("checked_at", periodStart.toISOString())
        .lte("checked_at", periodEnd.toISOString())
        .order("position", { ascending: true });

      if (serpError) {
        logger.error("Error fetching SERP results", serpError as Error);
      } else {
        serpResults = data || [];
      }
    }

    let serpScore = 0;
    if (serpResults && serpResults.length > 0) {
      // Average position. Lower is better.
      // Map: Pos 1 -> 10, Pos 20 -> 0.
      const avgPos =
        serpResults.reduce((acc, curr) => acc + (curr.position || 20), 0) /
        serpResults.length;
      serpScore = Math.max(0, 10 - (avgPos - 1) * 0.5); // Pos 1=10, Pos 3=9, Pos 10=5.5
    } else {
      serpScore = 5; // Neutral start if no data
    }

    // 2. News Sentiment (25%)
    const { data: newsMentions, error: newsError } = await supabase
      .from("news_mentions")
      .select("sentiment_score")
      .eq("client_id", clientId)
      .gte("published_at", periodStart.toISOString())
      .lte("published_at", periodEnd.toISOString());

    if (newsError)
      logger.error("Error fetching news mentions", newsError as Error);

    let newsScore = 5;
    if (newsMentions && newsMentions.length > 0) {
      const avgSentiment =
        newsMentions.reduce(
          (acc, curr) => acc + (curr.sentiment_score || 0),
          0
        ) / newsMentions.length;
      // Map -1..1 to 0..10
      newsScore = (avgSentiment + 1) * 5;
    }

    // 3. Social Sentiment (20%)
    // First, get all social account IDs for this client
    const { data: clientSocialAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("client_id", clientId)
      .eq("is_active", true);

    if (accountsError) {
      logger.error("Error fetching social accounts", accountsError as Error);
    }

    // Then fetch social posts for those accounts
    const accountIds = clientSocialAccounts?.map((a) => a.id) || [];
    let socialPosts: { sentiment_score: number | null }[] = [];

    if (accountIds.length > 0) {
      const { data, error: socialError } = await supabase
        .from("social_posts")
        .select("sentiment_score")
        .in("social_account_id", accountIds)
        .gte("published_at", periodStart.toISOString())
        .lte("published_at", periodEnd.toISOString());

      if (socialError) {
        logger.error("Error fetching social posts", socialError as Error);
      } else {
        socialPosts = data || [];
      }
    }

    let socialScore = 5;
    if (socialPosts && socialPosts.length > 0) {
      const validSentiments = socialPosts.filter(
        (p) => p.sentiment_score !== null && p.sentiment_score !== undefined
      );
      if (validSentiments.length > 0) {
        const avgSentiment =
          validSentiments.reduce(
            (acc, curr) => acc + (curr.sentiment_score || 0),
            0
          ) / validSentiments.length;
        // Map -1..1 to 0..10
        socialScore = (avgSentiment + 1) * 5;
      }
    }

    // 4. Trend (15%) - Compare avg sentiment of this period vs previous
    const periodDuration = periodEnd.getTime() - periodStart.getTime();
    const previousEnd = new Date(periodStart);
    const previousStart = new Date(previousEnd.getTime() - periodDuration);

    // Calculate current period average sentiment (news + social combined)
    const currentNewsSentiment =
      newsMentions && newsMentions.length > 0
        ? newsMentions.reduce(
            (acc, curr) => acc + (curr.sentiment_score || 0),
            0
          ) / newsMentions.length
        : 0;

    const currentSocialSentiment =
      socialPosts && socialPosts.length > 0
        ? socialPosts
            .filter((p) => p.sentiment_score !== null && p.sentiment_score !== undefined)
            .reduce((acc, curr) => acc + (curr.sentiment_score || 0), 0) /
          socialPosts.filter((p) => p.sentiment_score !== null && p.sentiment_score !== undefined).length
        : 0;

    const currentAvgSentiment =
      newsMentions && socialPosts && (newsMentions.length > 0 || socialPosts.length > 0)
        ? (currentNewsSentiment * (newsMentions.length || 0) +
            currentSocialSentiment * (socialPosts.length || 0)) /
          ((newsMentions.length || 0) + (socialPosts.length || 0))
        : 0;

    // Calculate previous period average sentiment
    const { data: previousNewsMentions } = await supabase
      .from("news_mentions")
      .select("sentiment_score")
      .eq("client_id", clientId)
      .gte("published_at", previousStart.toISOString())
      .lt("published_at", previousEnd.toISOString());

    // Fetch previous period social posts using the same account IDs
    let previousSocialPosts: { sentiment_score: number | null }[] = [];
    if (accountIds.length > 0) {
      const { data } = await supabase
        .from("social_posts")
        .select("sentiment_score")
        .in("social_account_id", accountIds)
        .gte("published_at", previousStart.toISOString())
        .lt("published_at", previousEnd.toISOString());
      previousSocialPosts = data || [];
    }

    const previousNewsSentiment =
      previousNewsMentions && previousNewsMentions.length > 0
        ? previousNewsMentions.reduce(
            (acc, curr) => acc + (curr.sentiment_score || 0),
            0
          ) / previousNewsMentions.length
        : 0;

    const previousSocialSentiment =
      previousSocialPosts && previousSocialPosts.length > 0
        ? previousSocialPosts
            .filter((p) => p.sentiment_score !== null && p.sentiment_score !== undefined)
            .reduce((acc, curr) => acc + (curr.sentiment_score || 0), 0) /
          previousSocialPosts.filter((p) => p.sentiment_score !== null && p.sentiment_score !== undefined).length
        : 0;

    const previousAvgSentiment =
      previousNewsMentions && previousSocialPosts &&
      (previousNewsMentions.length > 0 || previousSocialPosts.length > 0)
        ? (previousNewsSentiment * (previousNewsMentions.length || 0) +
            previousSocialSentiment * (previousSocialPosts.length || 0)) /
          ((previousNewsMentions.length || 0) + (previousSocialPosts.length || 0))
        : 0;

    // Calculate trend: improvement from previous to current
    // Map improvement to 0-10. Stable = 5. +0.2 change = 7, -0.2 change = 3
    const sentimentChange = currentAvgSentiment - previousAvgSentiment;
    let trendScore = 5; // Neutral
    if (Math.abs(sentimentChange) > 0.01) {
      // Scale: -1 to +1 change maps to 0 to 10
      // +0.2 change = +2 points = 7/10
      // -0.2 change = -2 points = 3/10
      trendScore = Math.max(0, Math.min(10, 5 + sentimentChange * 10));
    }

    // 5. Volume (5%) - Positive Ratio
    // Calculate ratio of positive mentions to total mentions
    const totalMentions = (newsMentions?.length || 0) + (socialPosts?.length || 0);
    let volumeScore = 5; // Neutral if no data

    if (totalMentions > 0) {
      const positiveNews =
        newsMentions?.filter((m) => (m.sentiment_score || 0) > 0.1).length || 0;
      const positiveSocial =
        socialPosts?.filter(
          (p) => p.sentiment_score !== null && p.sentiment_score !== undefined && (p.sentiment_score || 0) > 0.1
        ).length || 0;
      const positiveCount = positiveNews + positiveSocial;
      const positiveRatio = positiveCount / totalMentions;
      // Map 0-1 ratio to 0-10 score
      volumeScore = positiveRatio * 10;
    }

    // Final Calculation
    const finalScore =
      (serpScore * 0.35 +
        newsScore * 0.25 +
        socialScore * 0.2 +
        trendScore * 0.15 +
        volumeScore * 0.05) *
      10;

    // Normalize to 0-100 (Weight factors sum to 1.0, but each component is 0-10. Result is 0-10. Multiply by 10 => 0-100)
    // Wait, typical scale is 0-100 directly?
    // Formula says: (... ) * 10.
    // SerpScore (0-10) * 0.35 = 0-3.5
    // Sum = 0-10. * 10 = 0-100. Correct.

    const breakdown: ScoreBreakdown = {
      serp: Math.round(serpScore * 100) / 100,
      news: Math.round(newsScore * 100) / 100,
      social: Math.round(socialScore * 100) / 100,
      trend: Math.round(trendScore * 100) / 100,
      volume: Math.round(volumeScore * 100) / 100,
    };

    const result = {
      score: Math.round(finalScore * 100) / 100,
      breakdown,
    };

    // Cache the result (1 hour TTL)
    const { cacheService } = await import('@/lib/services/cache');
    await cacheService.set(cacheKey, result, 3600000); // 1 hour in milliseconds

    return result;
  } catch (error) {
    logger.error("Failed to calculate reputation score", error as Error);
    // Return fallback
    return {
      score: 50,
      breakdown: { serp: 5, news: 5, social: 5, trend: 5, volume: 5 },
    };
  }
}

/**
 * Calculate trend direction
 */
export function calculateTrend(
  currentScore: number,
  previousScore: number
): "up" | "down" | "stable" {
  const difference = currentScore - previousScore;
  if (difference > 2) return "up";
  if (difference < -2) return "down";
  return "stable";
}
