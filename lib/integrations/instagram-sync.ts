/**
 * Instagram Synchronization Service
 * Syncs Instagram posts and analyzes sentiment
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { analyzeSentiment } from '@/lib/ai/sentiment';
import {
  getInstagramPosts,
  getInstagramPostInsights,
  getInstagramComments,
  type InstagramPost,
} from './meta-api';

export interface SyncStats {
  accountsProcessed: number;
  postsAdded: number;
  postsUpdated: number;
  errors: number;
}

/**
 * Sync Instagram posts for a social account
 */
export async function syncInstagramAccount(
  accountId: string,
  accessToken: string,
  instagramUserId: string
): Promise<{ added: number; updated: number }> {
  const supabase = await createClient();
  let added = 0;
  let updated = 0;

  try {
    logger.info('Starting Instagram sync', { accountId, instagramUserId });

    // Fetch recent posts (last 25)
    const posts = await getInstagramPosts(accessToken, instagramUserId, 25);

    for (const post of posts) {
      try {
        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('social_posts')
          .select('id, engagement_likes, engagement_comments')
          .eq('platform_post_id', post.id)
          .eq('social_account_id', accountId)
          .single();

        // Get insights for the post
        const insights = await getInstagramPostInsights(accessToken, post.id);

        // Analyze sentiment if there's a caption
        let sentiment: 'positive' | 'neutral' | 'negative' | null = null;
        let sentimentScore: number | null = null;
        let sentimentConfidence: number | null = null;

        if (post.caption) {
          const sentimentResult = await analyzeSentiment(post.caption);
          sentiment = sentimentResult.sentiment;
          sentimentScore = sentimentResult.score;
          sentimentConfidence = sentimentResult.confidence;
        }

        const postData = {
          social_account_id: accountId,
          platform: 'instagram' as const,
          platform_post_id: post.id,
          content: post.caption || '',
          post_url: post.permalink,
          media_type: post.media_type?.toLowerCase() || 'image',
          media_url: post.media_url,
          published_at: post.timestamp,
          engagement_likes: post.like_count || 0,
          engagement_comments: post.comments_count || 0,
          engagement_shares: 0, // Instagram API doesn't provide shares
          impressions: insights.impressions,
          reach: insights.reach,
          sentiment,
          sentiment_score: sentimentScore,
          sentiment_confidence: sentimentConfidence,
          synced_at: new Date().toISOString(),
        };

        if (existingPost) {
          // Update if engagement changed
          const engagementChanged =
            existingPost.engagement_likes !== postData.engagement_likes ||
            existingPost.engagement_comments !== postData.engagement_comments;

          if (engagementChanged) {
            const { error } = await supabase
              .from('social_posts')
              .update(postData)
              .eq('id', existingPost.id);

            if (error) {
              logger.error('Failed to update Instagram post', error, { postId: post.id });
            } else {
              updated++;
            }
          }
        } else {
          // Insert new post
          const { error } = await supabase
            .from('social_posts')
            .insert(postData);

          if (error) {
            logger.error('Failed to insert Instagram post', error, { postId: post.id });
          } else {
            added++;
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error('Failed to process Instagram post', error as Error, { postId: post.id });
      }
    }

    logger.info('Instagram sync completed', {
      accountId,
      added,
      updated,
      total: posts.length,
    });

    return { added, updated };
  } catch (error) {
    logger.error('Instagram sync failed', error as Error, { accountId });
    throw error;
  }
}

/**
 * Sync all active Instagram accounts
 */
export async function syncAllInstagramAccounts(): Promise<SyncStats> {
  const supabase = await createClient();
  const stats: SyncStats = {
    accountsProcessed: 0,
    postsAdded: 0,
    postsUpdated: 0,
    errors: 0,
  };

  try {
    // Get all active Instagram accounts with access tokens
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_user_id, access_token, client_id')
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .not('access_token', 'is', null);

    if (error) {
      logger.error('Failed to fetch Instagram accounts', error);
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      logger.info('No active Instagram accounts to sync');
      return stats;
    }

    logger.info(`Starting sync for ${accounts.length} Instagram accounts`);

    for (const account of accounts) {
      try {
        if (!account.access_token || !account.platform_user_id) {
          logger.warn('Instagram account missing credentials', { accountId: account.id });
          stats.errors++;
          continue;
        }

        const result = await syncInstagramAccount(
          account.id,
          account.access_token,
          account.platform_user_id
        );

        stats.accountsProcessed++;
        stats.postsAdded += result.added;
        stats.postsUpdated += result.updated;

        // Update last sync timestamp
        await supabase
          .from('social_accounts')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', account.id);

        // Delay between accounts
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Failed to sync Instagram account ${account.id}`, error as Error);
        stats.errors++;
      }
    }

    logger.info('Instagram sync completed for all accounts', {
      accountsProcessed: stats.accountsProcessed,
      postsAdded: stats.postsAdded,
      postsUpdated: stats.postsUpdated,
      errors: stats.errors,
    });
    return stats;
  } catch (error) {
    logger.error('Failed to sync Instagram accounts', error as Error);
    throw error;
  }
}

/**
 * Sync Instagram mentions for a specific client
 * Searches for brand mentions in Instagram posts
 */
export async function syncInstagramMentions(
  clientId: string,
  searchTerms: string[]
): Promise<number> {
  const supabase = await createClient();
  let mentionsFound = 0;

  try {
    // Get Instagram accounts for this client
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('id, access_token, platform_user_id')
      .eq('client_id', clientId)
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .not('access_token', 'is', null);

    if (!accounts || accounts.length === 0) {
      return 0;
    }

    // For each account, get recent posts and check for mentions
    for (const account of accounts) {
      if (!account.access_token || !account.platform_user_id) continue;

      try {
        const posts = await getInstagramPosts(
          account.access_token,
          account.platform_user_id,
          50
        );

        for (const post of posts) {
          if (!post.caption) continue;

          // Check if caption contains any search terms
          const captionLower = post.caption.toLowerCase();
          const hasMention = searchTerms.some(term =>
            captionLower.includes(term.toLowerCase())
          );

          if (hasMention) {
            // Analyze sentiment
            const sentimentResult = await analyzeSentiment(post.caption);

            // Check if already exists
            const { data: existing } = await supabase
              .from('social_posts')
              .select('id')
              .eq('platform_post_id', post.id)
              .single();

            if (!existing) {
              await supabase.from('social_posts').insert({
                social_account_id: account.id,
                platform: 'instagram',
                platform_post_id: post.id,
                content: post.caption,
                post_url: post.permalink,
                published_at: post.timestamp,
                engagement_likes: post.like_count || 0,
                engagement_comments: post.comments_count || 0,
                sentiment: sentimentResult.sentiment,
                sentiment_score: sentimentResult.score,
                sentiment_confidence: sentimentResult.confidence,
              });

              mentionsFound++;
            }
          }
        }
      } catch (error) {
        logger.error('Failed to sync Instagram mentions for account', error as Error, {
          accountId: account.id,
        });
      }
    }

    logger.info('Instagram mentions sync completed', { clientId, mentionsFound });
    return mentionsFound;
  } catch (error) {
    logger.error('Failed to sync Instagram mentions', error as Error, { clientId });
    return mentionsFound;
  }
}
