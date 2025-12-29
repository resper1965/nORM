/**
 * Reputation Score Calculator
 * Calculates reputation score (0-100) based on multiple factors
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import type { ReputationScore } from '@/lib/types/domain';

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
 * Calculate SERP score based on Google positions
 * Better positions = higher score
 *
 * Position 1-3: 10.0
 * Position 4-10: 8.0-9.5
 * Position 11-20: 5.0-7.5
 * Position 21+: 0-4.5
 * Not found: 0
 */
async function calculateSERPScore(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const supabase = await createClient();

  // Get all keywords for client
  const { data: keywords, error: keywordsError } = await supabase
    .from('keywords')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (keywordsError || !keywords || keywords.length === 0) {
    logger.warn('No keywords found for SERP score calculation', { clientId });
    return 5.0; // Neutral score if no keywords
  }

  const keywordIds = keywords.map(k => k.id);

  // Get latest SERP positions for each keyword in the period
  const { data: serpResults, error: serpError } = await supabase
    .from('serp_results')
    .select('keyword_id, position, is_client_content')
    .in('keyword_id', keywordIds)
    .gte('checked_at', periodStart.toISOString())
    .lte('checked_at', periodEnd.toISOString())
    .order('checked_at', { ascending: false });

  if (serpError || !serpResults || serpResults.length === 0) {
    logger.warn('No SERP results found in period', { clientId, periodStart, periodEnd });
    return 5.0; // Neutral score if no data
  }

  // Get best position for each keyword (most recent)
  const bestPositions = new Map<string, { position: number; isClient: boolean }>();

  for (const result of serpResults) {
    if (!bestPositions.has(result.keyword_id)) {
      bestPositions.set(result.keyword_id, {
        position: result.position,
        isClient: result.is_client_content,
      });
    }
  }

  // Calculate average score from positions
  let totalScore = 0;
  let count = 0;

  for (const [, data] of bestPositions) {
    const { position, isClient } = data;
    let score = 0;

    if (position === null || position > 100) {
      score = 0; // Not found
    } else if (position <= 3) {
      score = 10.0;
    } else if (position <= 10) {
      score = 8.0 + (1.5 * (10 - position) / 7); // 8.0 to 9.5
    } else if (position <= 20) {
      score = 5.0 + (2.5 * (20 - position) / 10); // 5.0 to 7.5
    } else {
      score = Math.max(0, 4.5 - (position - 20) * 0.1); // Decreases with position
    }

    // Bonus if it's client's own content
    if (isClient) {
      score = Math.min(10.0, score * 1.2);
    }

    totalScore += score;
    count++;
  }

  const avgScore = count > 0 ? totalScore / count : 5.0;
  return Math.round(avgScore * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate News sentiment score
 * Based on sentiment scores of news mentions in period
 *
 * Sentiment score ranges from -1.0 (very negative) to +1.0 (very positive)
 * Converted to 0-10 scale
 */
async function calculateNewsScore(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const supabase = await createClient();

  const { data: mentions, error } = await supabase
    .from('news_mentions')
    .select('sentiment_score, sentiment_confidence')
    .eq('client_id', clientId)
    .gte('scraped_at', periodStart.toISOString())
    .lte('scraped_at', periodEnd.toISOString())
    .not('sentiment_score', 'is', null);

  if (error || !mentions || mentions.length === 0) {
    logger.info('No news mentions found in period', { clientId, periodStart, periodEnd });
    return 5.0; // Neutral if no news
  }

  // Calculate weighted average sentiment
  let totalWeightedSentiment = 0;
  let totalWeight = 0;

  for (const mention of mentions) {
    const sentiment = mention.sentiment_score || 0;
    const confidence = mention.sentiment_confidence || 0.5;

    // Weight by confidence
    totalWeightedSentiment += sentiment * confidence;
    totalWeight += confidence;
  }

  const avgSentiment = totalWeight > 0
    ? totalWeightedSentiment / totalWeight
    : 0;

  // Convert from -1 to +1 scale to 0-10 scale
  // -1.0 = 0, 0 = 5, +1.0 = 10
  const score = (avgSentiment + 1) * 5;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate Social media sentiment score
 * Based on sentiment of social posts in period
 */
async function calculateSocialScore(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const supabase = await createClient();

  // Get social accounts for this client
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (accountsError || !accounts || accounts.length === 0) {
    logger.info('No social accounts found', { clientId });
    return 5.0; // Neutral if no social accounts
  }

  const accountIds = accounts.map(a => a.id);

  const { data: posts, error: postsError } = await supabase
    .from('social_posts')
    .select('sentiment_score, sentiment_confidence, engagement_likes, engagement_comments, engagement_shares')
    .in('social_account_id', accountIds)
    .gte('published_at', periodStart.toISOString())
    .lte('published_at', periodEnd.toISOString())
    .not('sentiment_score', 'is', null);

  if (postsError || !posts || posts.length === 0) {
    logger.info('No social posts found in period', { clientId, periodStart, periodEnd });
    return 5.0; // Neutral if no posts
  }

  // Calculate weighted average sentiment (weighted by engagement)
  let totalWeightedSentiment = 0;
  let totalWeight = 0;

  for (const post of posts) {
    const sentiment = post.sentiment_score || 0;
    const confidence = post.sentiment_confidence || 0.5;

    // Weight by engagement + confidence
    const engagement = (post.engagement_likes || 0) +
                      (post.engagement_comments || 0) * 2 +  // Comments more valuable
                      (post.engagement_shares || 0) * 3;     // Shares most valuable

    const weight = Math.max(1, engagement) * confidence; // Minimum weight of 1

    totalWeightedSentiment += sentiment * weight;
    totalWeight += weight;
  }

  const avgSentiment = totalWeight > 0
    ? totalWeightedSentiment / totalWeight
    : 0;

  // Convert from -1 to +1 scale to 0-10 scale
  const score = (avgSentiment + 1) * 5;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate Volume score
 * Based on ratio of positive to negative mentions
 */
async function calculateVolumeScore(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const supabase = await createClient();

  // Count news mentions by sentiment
  const { data: newsData } = await supabase
    .from('news_mentions')
    .select('sentiment')
    .eq('client_id', clientId)
    .gte('scraped_at', periodStart.toISOString())
    .lte('scraped_at', periodEnd.toISOString())
    .not('sentiment', 'is', null);

  // Count social posts by sentiment
  const { data: socialAccounts } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_active', true);

  const accountIds = socialAccounts?.map(a => a.id) || [];

  const { data: socialData } = accountIds.length > 0 ? await supabase
    .from('social_posts')
    .select('sentiment')
    .in('social_account_id', accountIds)
    .gte('published_at', periodStart.toISOString())
    .lte('published_at', periodEnd.toISOString())
    .not('sentiment', 'is', null) : { data: [] };

  // Aggregate sentiment counts
  const allMentions = [...(newsData || []), ...(socialData || [])];

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const mention of allMentions) {
    if (mention.sentiment === 'positive') positive++;
    else if (mention.sentiment === 'neutral') neutral++;
    else if (mention.sentiment === 'negative') negative++;
  }

  const total = positive + neutral + negative;

  if (total === 0) {
    return 5.0; // Neutral if no mentions
  }

  // Calculate score based on ratio
  // More positive = higher score
  // Formula: (positive / total) * 10 + (neutral / total) * 5 - (negative / total) * 5
  const score =
    (positive / total) * 10 +
    (neutral / total) * 5 +
    Math.max(0, 5 - (negative / total) * 10); // Penalize negatives

  return Math.round(Math.min(10, Math.max(0, score)) * 100) / 100;
}

/**
 * Calculate Trend score
 * Compares current period with previous period
 */
async function calculateTrendScore(
  clientId: string,
  currentScore: number,
  periodStart: Date
): Promise<number> {
  const supabase = await createClient();

  // Get previous score (30 days before current period)
  const previousPeriodEnd = new Date(periodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1); // Day before current period

  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30); // 30 days before

  const { data: previousScores, error } = await supabase
    .from('reputation_scores')
    .select('score')
    .eq('client_id', clientId)
    .gte('period_start', previousPeriodStart.toISOString().split('T')[0])
    .lte('period_end', previousPeriodEnd.toISOString().split('T')[0])
    .order('calculated_at', { ascending: false })
    .limit(1);

  if (error || !previousScores || previousScores.length === 0) {
    logger.info('No previous score found for trend calculation', { clientId });
    return 5.0; // Neutral if no comparison possible
  }

  const previousScore = previousScores[0].score;
  const difference = currentScore - previousScore;

  // Convert difference to 0-10 scale
  // -20 or less: 0 (terrible decline)
  // 0: 5 (stable)
  // +20 or more: 10 (excellent improvement)
  const trendScore = 5 + (difference / 20) * 5;

  return Math.round(Math.min(10, Math.max(0, trendScore)) * 100) / 100;
}

/**
 * Calculate reputation score for a client
 *
 * Formula:
 * score = (
 *   serpScore * 0.35 +
 *   newsScore * 0.25 +
 *   socialScore * 0.20 +
 *   trendScore * 0.15 +
 *   volumeScore * 0.05
 * ) * 10
 *
 * @param params Calculation parameters
 * @returns Reputation score and breakdown
 */
export async function calculateReputationScore(
  params: CalculateScoreParams
): Promise<{ score: number; breakdown: ScoreBreakdown }> {
  const { clientId, periodStart, periodEnd } = params;

  logger.info('Calculating reputation score', { clientId, periodStart, periodEnd });

  try {
    // Calculate individual scores (0-10 scale)
    const serpScore = await calculateSERPScore(clientId, periodStart, periodEnd);
    const newsScore = await calculateNewsScore(clientId, periodStart, periodEnd);
    const socialScore = await calculateSocialScore(clientId, periodStart, periodEnd);
    const volumeScore = await calculateVolumeScore(clientId, periodStart, periodEnd);

    // Calculate preliminary final score (without trend)
    const preliminaryScore = (
      serpScore * 0.35 +
      newsScore * 0.25 +
      socialScore * 0.20 +
      volumeScore * 0.05
    ) * 10;

    // Calculate trend score (needs current score for comparison)
    const trendScore = await calculateTrendScore(clientId, preliminaryScore, periodStart);

    // Calculate final score with trend
    const finalScore = (
      serpScore * 0.35 +
      newsScore * 0.25 +
      socialScore * 0.20 +
      trendScore * 0.15 +
      volumeScore * 0.05
    ) * 10;

    const breakdown: ScoreBreakdown = {
      serp: serpScore,
      news: newsScore,
      social: socialScore,
      trend: trendScore,
      volume: volumeScore,
    };

    logger.info('Reputation score calculated successfully', {
      clientId,
      score: finalScore,
      breakdown,
    });

    return {
      score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      breakdown,
    };
  } catch (error) {
    logger.error('Failed to calculate reputation score', error as Error, { clientId });
    throw error;
  }
}

/**
 * Calculate trend direction
 * Compares current period score with previous period
 */
export function calculateTrend(
  currentScore: number,
  previousScore: number
): 'up' | 'down' | 'stable' {
  const difference = currentScore - previousScore;
  
  if (difference > 2) return 'up';
  if (difference < -2) return 'down';
  return 'stable';
}

