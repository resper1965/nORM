/**
 * Facebook Graph API Integration
 * Monitor Facebook page mentions, post comments, reviews
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface FacebookMention {
  id: string;
  message: string;
  authorName: string;
  authorId: string;
  timestamp: Date;
  type: 'post' | 'comment' | 'review';
  url: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Create Facebook Graph API client
 */
export function createFacebookClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://graph.facebook.com/v18.0',
    params: {
      access_token: accessToken,
    },
    timeout: 30000,
  });
}

/**
 * Get mentions for a Facebook page
 */
export async function getFacebookMentions(
  accessToken: string,
  pageId: string
): Promise<FacebookMention[]> {
  try {
    const client = createFacebookClient(accessToken);
    const mentions: FacebookMention[] = [];

    logger.info('Fetching Facebook mentions', { pageId });

    try {
      // Get page posts
      const postsResponse = await client.get(`/${pageId}/posts`, {
        params: {
          fields: 'id,message,created_time,from,permalink_url,likes.summary(true),comments.summary(true),shares',
          limit: 25,
        },
      });

      const posts = postsResponse.data?.data || [];

      for (const post of posts) {
        mentions.push({
          id: post.id,
          message: post.message || '',
          authorName: post.from?.name || 'Unknown',
          authorId: post.from?.id || '',
          timestamp: new Date(post.created_time),
          type: 'post',
          url: post.permalink_url || `https://facebook.com/${post.id}`,
          engagement: {
            likes: post.likes?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
          },
        });

        // Get comments for this post
        if (post.comments?.summary?.total_count > 0) {
          try {
            const commentsResponse = await client.get(`/${post.id}/comments`, {
              params: {
                fields: 'id,message,created_time,from,permalink_url',
                limit: 50,
              },
            });

            const comments = commentsResponse.data?.data || [];

            for (const comment of comments) {
              mentions.push({
                id: comment.id,
                message: comment.message || '',
                authorName: comment.from?.name || 'Unknown',
                authorId: comment.from?.id || '',
                timestamp: new Date(comment.created_time),
                type: 'comment',
                url: comment.permalink_url || `https://facebook.com/${comment.id}`,
              });
            }
          } catch (commentError) {
            logger.warn(`Failed to fetch comments for post ${post.id}`, { error: String(commentError) });
          }
        }
      }

      // Get page reviews (if available)
      try {
        const reviewsResponse = await client.get(`/${pageId}/ratings`, {
          params: {
            fields: 'id,review_text,created_time,reviewer,rating',
            limit: 25,
          },
        });

        const reviews = reviewsResponse.data?.data || [];

        for (const review of reviews) {
          mentions.push({
            id: review.id,
            message: review.review_text || '',
            authorName: review.reviewer?.name || 'Unknown',
            authorId: review.reviewer?.id || '',
            timestamp: new Date(review.created_time),
            type: 'review',
            url: `https://facebook.com/${pageId}/reviews`,
          });
        }
      } catch (reviewError) {
        // Reviews might not be available for all pages
        logger.debug(`Reviews not available for page ${pageId}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        logger.error(`Facebook API error: ${errorMessage}`, error);
        throw new ExternalAPIError('Facebook', errorMessage, error);
      }
      throw error;
    }

    return mentions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ExternalAPIError('Facebook', error.message, error);
    }
    throw new ExternalAPIError('Facebook', 'Unknown error', error as Error);
  }
}

