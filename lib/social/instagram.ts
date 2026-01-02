/**
 * Instagram Graph API Integration
 * Monitor Instagram mentions, comments, stories
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface InstagramMention {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  type: 'post' | 'comment' | 'story';
  mediaUrl?: string;
  engagement?: {
    likes: number;
    comments: number;
  };
}

/**
 * Create Instagram Graph API client
 */
export function createInstagramClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://graph.instagram.com',
    params: {
      access_token: accessToken,
    },
    timeout: 30000,
  });
}

/**
 * Get mentions for a hashtag or account
 * Note: Instagram Graph API requires Business/Creator account
 */
export async function getInstagramMentions(
  accessToken: string,
  hashtag?: string,
  accountId?: string
): Promise<InstagramMention[]> {
  try {
    const client = createInstagramClient(accessToken);
    const mentions: InstagramMention[] = [];

    logger.info('Fetching Instagram mentions', { hashtag, accountId });

    try {
      // If accountId is provided, get posts from that account
      if (accountId) {
        // Get media from Instagram account
        const mediaResponse = await client.get(`/${accountId}/media`, {
          params: {
            fields: 'id,caption,like_count,comments_count,timestamp,permalink,media_type,media_url',
            limit: 25,
          },
        });

        const mediaItems = mediaResponse.data?.data || [];

        for (const media of mediaItems) {
          mentions.push({
            id: media.id,
            text: media.caption || '',
            username: accountId,
            timestamp: new Date(media.timestamp),
            type: 'post',
            mediaUrl: media.media_url,
            engagement: {
              likes: media.like_count || 0,
              comments: media.comments_count || 0,
            },
          });

          // Get comments for this post
          if (media.comments_count > 0) {
            try {
              const commentsResponse = await client.get(`/${media.id}/comments`, {
                params: {
                  fields: 'id,text,username,timestamp',
                  limit: 50,
                },
              });

              const comments = commentsResponse.data?.data || [];

              for (const comment of comments) {
                mentions.push({
                  id: comment.id,
                  text: comment.text || '',
                  username: comment.username || 'Unknown',
                  timestamp: new Date(comment.timestamp),
                  type: 'comment',
                });
              }
            } catch (commentError) {
              logger.warn(`Failed to fetch comments for media ${media.id}`, commentError as Error);
            }
          }
        }

        // Get stories (if available)
        try {
          const storiesResponse = await client.get(`/${accountId}/stories`, {
            params: {
              fields: 'id,media_type,media_url,timestamp',
            },
          });

          const stories = storiesResponse.data?.data || [];

          for (const story of stories) {
            mentions.push({
              id: story.id,
              text: '',
              username: accountId,
              timestamp: new Date(story.timestamp),
              type: 'story',
              mediaUrl: story.media_url,
            });
          }
        } catch (storyError) {
          // Stories might not be available
          logger.debug(`Stories not available for account ${accountId}`);
        }
      }

      // If hashtag is provided, search for hashtag (requires Instagram Graph API with hashtag_search permission)
      if (hashtag) {
        try {
          // Note: Hashtag search requires special permissions and might not be available
          const hashtagId = hashtag.replace('#', '');
          const hashtagResponse = await client.get(`/ig_hashtag_search`, {
            params: {
              q: hashtagId,
              user_id: accountId || '',
            },
          });

          // This is a simplified implementation - actual hashtag search is more complex
          logger.info(`Hashtag search for ${hashtag}`, { hashtagId });
        } catch (hashtagError) {
          logger.warn(`Hashtag search not available for ${hashtag}`, hashtagError as Error);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        logger.error(`Instagram API error: ${errorMessage}`, error);
        throw new ExternalAPIError('Instagram', errorMessage, error);
      }
      throw error;
    }

    return mentions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ExternalAPIError('Instagram', error.message, error);
    }
    throw new ExternalAPIError('Instagram', 'Unknown error', error as Error);
  }
}

/**
 * Screenshot Instagram Story
 * Stories expire after 24 hours, so we need to capture them quickly
 */
export async function screenshotInstagramStory(
  storyId: string,
  accessToken: string
): Promise<string> {
  // TODO: Implement story screenshot
  // This would require:
  // 1. Fetch story media URL
  // 2. Download image/video
  // 3. Store in Supabase Storage
  // 4. Return storage URL

  logger.info('Screenshotting Instagram story', { storyId });
  return ''; // Placeholder
}

