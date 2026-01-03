/**
 * Facebook Pages Synchronization Service
 * Syncs Facebook Page posts using Meta Graph API
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { analyzeSentiment } from '@/lib/ai/sentiment';
import { makeMetaRequest, type MetaAPIResponse } from './meta-api';

export interface SyncStats {
  accountsProcessed: number;
  postsAdded: number;
  postsUpdated: number;
  errors: number;
}

interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  full_picture?: string;
  type?: string;
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

/**
 * Get Facebook Page posts
 */
async function getFacebookPagePosts(
  accessToken: string,
  pageId: string,
  limit: number = 25
): Promise<FacebookPost[]> {
  const response = await makeMetaRequest<FacebookPost[]>(
    `/${pageId}/posts`,
    accessToken,
    {
      fields: 'id,message,story,created_time,permalink_url,full_picture,type,reactions.summary(true),comments.summary(true),shares',
      limit: limit.toString(),
    }
  );

  return response.data || [];
}

/**
 * Sync Facebook Page posts for a social account
 */
export async function syncFacebookAccount(
  accountId: string,
  accessToken: string,
  pageId: string
): Promise<{ added: number; updated: number }> {
  const supabase = await createClient();
  let added = 0;
  let updated = 0;

  try {
    logger.info('Starting Facebook sync', { accountId, pageId });

    const posts = await getFacebookPagePosts(accessToken, pageId, 25);

    for (const post of posts) {
      try {
        const content = post.message || post.story || '';

        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('social_posts')
          .select('id, engagement_likes, engagement_comments, engagement_shares')
          .eq('platform_post_id', post.id)
          .eq('social_account_id', accountId)
          .single();

        // Analyze sentiment
        let sentiment: 'positive' | 'neutral' | 'negative' | null = null;
        let sentimentScore: number | null = null;
        let sentimentConfidence: number | null = null;

        if (content) {
          const sentimentResult = await analyzeSentiment(content);
          sentiment = sentimentResult.sentiment;
          sentimentScore = sentimentResult.score;
          sentimentConfidence = sentimentResult.confidence;
        }

        const postData = {
          social_account_id: accountId,
          platform: 'facebook' as const,
          platform_post_id: post.id,
          content,
          post_url: post.permalink_url || `https://facebook.com/${post.id}`,
          media_type: post.type || 'status',
          media_url: post.full_picture,
          published_at: post.created_time,
          engagement_likes: post.reactions?.summary?.total_count || 0,
          engagement_comments: post.comments?.summary?.total_count || 0,
          engagement_shares: post.shares?.count || 0,
          sentiment,
          sentiment_score: sentimentScore,
          sentiment_confidence: sentimentConfidence,
          synced_at: new Date().toISOString(),
        };

        if (existingPost) {
          const engagementChanged =
            existingPost.engagement_likes !== postData.engagement_likes ||
            existingPost.engagement_comments !== postData.engagement_comments ||
            existingPost.engagement_shares !== postData.engagement_shares;

          if (engagementChanged) {
            const { error } = await supabase
              .from('social_posts')
              .update(postData)
              .eq('id', existingPost.id);

            if (error) {
              logger.error('Failed to update Facebook post', error, { postId: post.id });
            } else {
              updated++;
            }
          }
        } else {
          const { error } = await supabase
            .from('social_posts')
            .insert(postData);

          if (error) {
            logger.error('Failed to insert Facebook post', error, { postId: post.id });
          } else {
            added++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error('Failed to process Facebook post', error as Error, { postId: post.id });
      }
    }

    logger.info('Facebook sync completed', { accountId, added, updated, total: posts.length });
    return { added, updated };
  } catch (error) {
    logger.error('Facebook sync failed', error as Error, { accountId });
    throw error;
  }
}

/**
 * Sync all active Facebook accounts
 */
export async function syncAllFacebookAccounts(): Promise<SyncStats> {
  const supabase = await createClient();
  const stats: SyncStats = {
    accountsProcessed: 0,
    postsAdded: 0,
    postsUpdated: 0,
    errors: 0,
  };

  try {
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_user_id, access_token, client_id')
      .eq('platform', 'facebook')
      .eq('is_active', true)
      .not('access_token', 'is', null);

    if (error) {
      logger.error('Failed to fetch Facebook accounts', error);
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      logger.info('No active Facebook accounts to sync');
      return stats;
    }

    logger.info(`Starting sync for ${accounts.length} Facebook accounts`);

    for (const account of accounts) {
      try {
        if (!account.access_token || !account.platform_user_id) {
          logger.warn('Facebook account missing credentials', { accountId: account.id });
          stats.errors++;
          continue;
        }

        const result = await syncFacebookAccount(
          account.id,
          account.access_token,
          account.platform_user_id
        );

        stats.accountsProcessed++;
        stats.postsAdded += result.added;
        stats.postsUpdated += result.updated;

        await supabase
          .from('social_accounts')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', account.id);

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Failed to sync Facebook account ${account.id}`, error as Error);
        stats.errors++;
      }
    }

    logger.info('Facebook sync completed for all accounts', {
      accountsProcessed: stats.accountsProcessed,
      postsAdded: stats.postsAdded,
      postsUpdated: stats.postsUpdated,
      errors: stats.errors,
    });

    return stats;
  } catch (error) {
    logger.error('Failed to sync Facebook accounts', error as Error);
    throw error;
  }
}
