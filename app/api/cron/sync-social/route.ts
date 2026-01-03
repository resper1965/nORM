import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { AppError } from "@/lib/errors/errors";
import { requireCronAuth } from "@/lib/auth/cron-auth";
import { decrypt } from "@/lib/utils/encryption";
import { getFacebookMentions } from "@/lib/social/facebook";
import { getLinkedInMentions } from "@/lib/social/linkedin";
import { getInstagramMentions } from "@/lib/social/instagram";
import { analyzeSentiment } from "@/lib/ai/sentiment";

/**
 * POST /api/cron/sync-social
 * Synchronize social media accounts (cron job)
 * Protected by Vercel Cron secret or service role
 *
 * Currently supports:
 * - Instagram (via Meta Graph API)
 * - LinkedIn (via LinkedIn API v2)
 * - Facebook Pages (via Meta Graph API)
 *
 * TODO: Add support for Twitter/X
 *
 * Recommended frequency: Every 1-2 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron authentication
    const authError = requireCronAuth(request);
    if (authError) return authError;

    logger.info('Starting social media sync cron job');

    const supabase = await createClient();

    // Get all active social accounts
    const { data: socialAccounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("id, platform, account_id, account_name, client_id, access_token_encrypted")
      .eq("is_active", true);

    if (accountsError) {
      logger.error("Failed to fetch social accounts for sync", accountsError);
      throw new AppError("Failed to fetch social accounts", 500);
    }

    if (!socialAccounts || socialAccounts.length === 0) {
      return NextResponse.json({
        status: "completed",
        accounts_synced: 0,
        message: "No active social accounts found",
      });
    }

    let totalRecordsCreated = 0;
    const results = [];

    for (const account of socialAccounts) {
      try {
        // Decrypt access token
        let accessToken: string;
        try {
          accessToken = decrypt(account.access_token_encrypted);
        } catch (decryptError) {
          logger.error(`Failed to decrypt token for account ${account.id}`, decryptError as Error);
          continue;
        }

        // Fetch mentions based on platform
        let mentions: Array<{
          id: string;
          text?: string;
          message?: string;
          username?: string;
          authorName?: string;
          authorId?: string;
          timestamp: Date;
          type: 'post' | 'comment' | 'story' | 'mention' | 'review';
          url?: string;
          mediaUrl?: string;
          engagement?: {
            likes?: number;
            comments?: number;
            shares?: number;
          };
        }> = [];

        if (account.platform === 'facebook') {
          const facebookMentions = await getFacebookMentions(accessToken, account.account_id);
          mentions = facebookMentions.map((m) => ({
            id: m.id,
            message: m.message,
            authorName: m.authorName,
            authorId: m.authorId,
            timestamp: m.timestamp,
            type: m.type,
            url: m.url,
            engagement: m.engagement,
          }));
        } else if (account.platform === 'linkedin') {
          const linkedInMentions = await getLinkedInMentions(accessToken, account.account_id);
          mentions = linkedInMentions.map((m) => ({
            id: m.id,
            text: m.text,
            authorName: m.authorName,
            authorId: m.authorId,
            timestamp: m.timestamp,
            type: m.type,
            url: m.url,
            engagement: m.engagement,
          }));
        } else if (account.platform === 'instagram') {
          const instagramMentions = await getInstagramMentions(accessToken, undefined, account.account_id);
          mentions = instagramMentions.map((m) => ({
            id: m.id,
            text: m.text,
            username: m.username,
            timestamp: m.timestamp,
            type: m.type,
            mediaUrl: m.mediaUrl,
            engagement: m.engagement,
          }));
        }

        if (mentions.length === 0) {
          logger.info(`No mentions found for account ${account.account_name}`);
          continue;
        }

        // Check which posts already exist
        const postIds = mentions.map((m) => m.id);
        const { data: existingPosts } = await supabase
          .from("social_posts")
          .select("post_id")
          .eq("social_account_id", account.id)
          .in("post_id", postIds);

        const existingPostIds = new Set(existingPosts?.map((p) => p.post_id) || []);

        // Filter out existing posts
        const newMentions = mentions.filter((m) => !existingPostIds.has(m.id));

        if (newMentions.length === 0) {
          logger.info(`No new mentions for account ${account.account_name}`);
          continue;
        }

        // Process each mention
        const postsToInsert = [];

        for (const mention of newMentions) {
          try {
            // Analyze sentiment
            const textToAnalyze = mention.text || mention.message || '';
            const sentimentAnalysis = await analyzeSentiment(textToAnalyze);

            // Determine content type
            let contentType: 'post' | 'comment' | 'story' | 'mention' = 'mention';
            if (mention.type === 'post') contentType = 'post';
            else if (mention.type === 'comment') contentType = 'comment';
            else if (mention.type === 'story') contentType = 'story';

            postsToInsert.push({
              social_account_id: account.id,
              platform: account.platform,
              post_id: mention.id,
              post_url: mention.url || null,
              author_id: mention.authorId || mention.username || null,
              author_name: mention.authorName || mention.username || 'Unknown',
              content: textToAnalyze,
              content_type: contentType,
              published_at: mention.timestamp.toISOString(),
              engagement_likes: mention.engagement?.likes || 0,
              engagement_comments: mention.engagement?.comments || 0,
              engagement_shares: mention.engagement?.shares || 0,
              sentiment: sentimentAnalysis.sentiment,
              sentiment_score: sentimentAnalysis.score,
              sentiment_confidence: sentimentAnalysis.confidence,
              screenshot_url: mention.mediaUrl || null,
              language: 'pt-BR',
            });

            // Small delay between sentiment analyses
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Failed to process mention: ${mention.id}`, error as Error);
            // Continue with other mentions
          }
        }

        // Insert posts into database
        if (postsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("social_posts")
            .insert(postsToInsert);

          if (insertError) {
            logger.error(`Failed to insert posts for account ${account.id}`, insertError);
          } else {
            totalRecordsCreated += postsToInsert.length;
            
            // Update last_synced_at
            await supabase
              .from("social_accounts")
              .update({ last_synced_at: new Date().toISOString() })
              .eq("id", account.id);

            logger.info(`Saved ${postsToInsert.length} new posts for account ${account.account_name}`);
          }
        }

        results.push({
          account_id: account.id,
          account_name: account.account_name,
          platform: account.platform,
          posts_found: newMentions.length,
        });
      } catch (error) {
        logger.error(`Error processing account ${account.account_name}`, error as Error);
        // Continue with other accounts
      }
    }

    logger.info("Social media sync completed", {
      accounts_count: socialAccounts.length,
      records_created: totalRecordsCreated,
    });

    return NextResponse.json({
      status: "completed",
      accounts_synced: socialAccounts.length,
      records_created: totalRecordsCreated,
      results,
      message: `Social media sync completed. Found ${totalRecordsCreated} new posts.`,
    });
  } catch (error) {
    logger.error("Error in POST /api/cron/sync-social", error as Error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to start social sync",
      },
      { status: 500 }
    );
  }
}
