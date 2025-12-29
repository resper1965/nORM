/**
 * LinkedIn Synchronization Service
 * Syncs LinkedIn posts and analyzes sentiment
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { analyzeSentiment } from '@/lib/ai/sentiment';
import {
  getLinkedInPosts,
  getLinkedInPostStats,
  extractLinkedInPostText,
  getLinkedInPostUrl,
  type LinkedInPost,
} from './linkedin-api';

export interface SyncStats {
  accountsProcessed: number;
  postsAdded: number;
  postsUpdated: number;
  errors: number;
}

/**
 * Sync LinkedIn posts for a social account
 */
export async function syncLinkedInAccount(
  accountId: string,
  accessToken: string,
  linkedInUserId: string,
  vanityName?: string
): Promise<{ added: number; updated: number }> {
  const supabase = await createClient();
  let added = 0;
  let updated = 0;

  try {
    logger.info('Starting LinkedIn sync', { accountId, linkedInUserId });

    // Fetch recent posts (last 25)
    const posts = await getLinkedInPosts(accessToken, linkedInUserId, 25);

    for (const post of posts) {
      try {
        // Skip if post is not published
        if (post.lifecycleState !== 'PUBLISHED') {
          continue;
        }

        // Extract text content
        const content = extractLinkedInPostText(post);

        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('social_posts')
          .select('id, engagement_likes, engagement_comments, engagement_shares')
          .eq('platform_post_id', post.id)
          .eq('social_account_id', accountId)
          .single();

        // Get post statistics
        const stats = await getLinkedInPostStats(accessToken, post.id);

        // Analyze sentiment if there's content
        let sentiment: 'positive' | 'neutral' | 'negative' | null = null;
        let sentimentScore: number | null = null;
        let sentimentConfidence: number | null = null;

        if (content) {
          const sentimentResult = await analyzeSentiment(content);
          sentiment = sentimentResult.sentiment;
          sentimentScore = sentimentResult.score;
          sentimentConfidence = sentimentResult.confidence;
        }

        const postUrl = getLinkedInPostUrl(post, vanityName);
        const publishedAt = new Date(post.created.time).toISOString();

        const postData = {
          social_account_id: accountId,
          platform: 'linkedin' as const,
          platform_post_id: post.id,
          content,
          post_url: postUrl,
          media_type: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareMediaCategory?.toLowerCase() || 'text',
          media_url: null, // LinkedIn API v2 doesn't easily expose media URLs
          published_at: publishedAt,
          engagement_likes: stats.numLikes || 0,
          engagement_comments: stats.numComments || 0,
          engagement_shares: stats.numShares || 0,
          impressions: stats.numViews,
          sentiment,
          sentiment_score: sentimentScore,
          sentiment_confidence: sentimentConfidence,
          synced_at: new Date().toISOString(),
        };

        if (existingPost) {
          // Update if engagement changed
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
              logger.error('Failed to update LinkedIn post', error, { postId: post.id });
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
            logger.error('Failed to insert LinkedIn post', error, { postId: post.id });
          } else {
            added++;
          }
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Failed to process LinkedIn post', error as Error, { postId: post.id });
      }
    }

    logger.info('LinkedIn sync completed', {
      accountId,
      added,
      updated,
      total: posts.length,
    });

    return { added, updated };
  } catch (error) {
    logger.error('LinkedIn sync failed', error as Error, { accountId });
    throw error;
  }
}

/**
 * Sync all active LinkedIn accounts
 */
export async function syncAllLinkedInAccounts(): Promise<SyncStats> {
  const supabase = await createClient();
  const stats: SyncStats = {
    accountsProcessed: 0,
    postsAdded: 0,
    postsUpdated: 0,
    errors: 0,
  };

  try {
    // Get all active LinkedIn accounts with access tokens
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, platform_user_id, access_token, account_name, client_id')
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .not('access_token', 'is', null);

    if (error) {
      logger.error('Failed to fetch LinkedIn accounts', error);
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      logger.info('No active LinkedIn accounts to sync');
      return stats;
    }

    logger.info(`Starting sync for ${accounts.length} LinkedIn accounts`);

    for (const account of accounts) {
      try {
        if (!account.access_token || !account.platform_user_id) {
          logger.warn('LinkedIn account missing credentials', { accountId: account.id });
          stats.errors++;
          continue;
        }

        const result = await syncLinkedInAccount(
          account.id,
          account.access_token,
          account.platform_user_id,
          account.account_name // vanity name
        );

        stats.accountsProcessed++;
        stats.postsAdded += result.added;
        stats.postsUpdated += result.updated;

        // Update last sync timestamp
        await supabase
          .from('social_accounts')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', account.id);

        // Delay between accounts (LinkedIn has stricter rate limits)
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        logger.error(`Failed to sync LinkedIn account ${account.id}`, error as Error);
        stats.errors++;
      }
    }

    logger.info('LinkedIn sync completed for all accounts', {
      accountsProcessed: stats.accountsProcessed,
      postsAdded: stats.postsAdded,
      postsUpdated: stats.postsUpdated,
      errors: stats.errors,
    });

    return stats;
  } catch (error) {
    logger.error('Failed to sync LinkedIn accounts', error as Error);
    throw error;
  }
}

/**
 * Sync LinkedIn mentions for a specific client
 * Searches for brand mentions in LinkedIn posts
 */
export async function syncLinkedInMentions(
  clientId: string,
  searchTerms: string[]
): Promise<number> {
  const supabase = await createClient();
  let mentionsFound = 0;

  try {
    // Get LinkedIn accounts for this client
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('id, access_token, platform_user_id, account_name')
      .eq('client_id', clientId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .not('access_token', 'is', null);

    if (!accounts || accounts.length === 0) {
      return 0;
    }

    for (const account of accounts) {
      if (!account.access_token || !account.platform_user_id) continue;

      try {
        // Get recent posts
        const posts = await getLinkedInPosts(
          account.access_token,
          account.platform_user_id,
          50
        );

        for (const post of posts) {
          const content = extractLinkedInPostText(post);
          if (!content) continue;

          // Check if content contains any search terms
          const contentLower = content.toLowerCase();
          const hasMention = searchTerms.some(term =>
            contentLower.includes(term.toLowerCase())
          );

          if (hasMention) {
            // Analyze sentiment
            const sentimentResult = await analyzeSentiment(content);

            // Get stats
            const stats = await getLinkedInPostStats(account.access_token, post.id);

            // Check if already exists
            const { data: existing } = await supabase
              .from('social_posts')
              .select('id')
              .eq('platform_post_id', post.id)
              .single();

            if (!existing) {
              const postUrl = getLinkedInPostUrl(post, account.account_name);

              await supabase.from('social_posts').insert({
                social_account_id: account.id,
                platform: 'linkedin',
                platform_post_id: post.id,
                content,
                post_url: postUrl,
                published_at: new Date(post.created.time).toISOString(),
                engagement_likes: stats.numLikes || 0,
                engagement_comments: stats.numComments || 0,
                engagement_shares: stats.numShares || 0,
                sentiment: sentimentResult.sentiment,
                sentiment_score: sentimentResult.score,
                sentiment_confidence: sentimentResult.confidence,
              });

              mentionsFound++;
            }
          }

          // Delay between posts
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('Failed to sync LinkedIn mentions for account', error as Error, {
          accountId: account.id,
        });
      }

      // Delay between accounts
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    logger.info('LinkedIn mentions sync completed', { clientId, mentionsFound });
    return mentionsFound;
  } catch (error) {
    logger.error('Failed to sync LinkedIn mentions', error as Error, { clientId });
    return mentionsFound;
  }
}
