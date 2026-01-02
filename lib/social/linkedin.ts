/**
 * LinkedIn API Integration
 * Monitor LinkedIn mentions, comments, company page tags
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface LinkedInMention {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  timestamp: Date;
  type: 'post' | 'comment' | 'mention';
  url: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Create LinkedIn API client
 */
export function createLinkedInClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.linkedin.com/v2',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

/**
 * Get mentions for a company page
 * Note: LinkedIn API requires Company Page admin access
 */
export async function getLinkedInMentions(
  accessToken: string,
  companyId: string
): Promise<LinkedInMention[]> {
  try {
    const client = createLinkedInClient(accessToken);
    const mentions: LinkedInMention[] = [];

    logger.info('Fetching LinkedIn mentions', { companyId });

    try {
      // Get company page posts (shares)
      const sharesResponse = await client.get(`/organizationAcls`, {
        params: {
          q: 'roleAssignee',
          role: 'ADMINISTRATOR',
          projection: '(elements*(organization~(id,name)))',
        },
      });

      // Get posts from the company page
      const postsResponse = await client.get(`/ugcPosts`, {
        params: {
          q: 'authors',
          authors: `List(${companyId})`,
          count: 25,
        },
      });

      const posts = postsResponse.data?.elements || [];

      for (const post of posts) {
        const content = post.specificContent?.['com.linkedin.ugc.ShareContent']?.text?.text || '';
        const postId = post.id?.split(':').pop() || post.id || '';

        mentions.push({
          id: postId,
          text: content,
          authorName: post.author || 'Company',
          authorId: companyId,
          timestamp: new Date(post.created?.time || Date.now()),
          type: 'post',
          url: `https://www.linkedin.com/feed/update/${postId}`,
          engagement: {
            likes: post.numLikes || 0,
            comments: post.numComments || 0,
            shares: post.numShares || 0,
          },
        });

        // Get comments for this post
        if (post.numComments > 0) {
          try {
            const commentsResponse = await client.get(`/socialActions/${postId}/comments`, {
              params: {
                count: 50,
              },
            });

            const comments = commentsResponse.data?.elements || [];

            for (const comment of comments) {
              mentions.push({
                id: comment.id || '',
                text: comment.message?.text || '',
                authorName: comment.actor?.name?.text || 'Unknown',
                authorId: comment.actor?.id || '',
                timestamp: new Date(comment.created?.time || Date.now()),
                type: 'comment',
                url: `https://www.linkedin.com/feed/update/${postId}`,
              });
            }
          } catch (commentError) {
            logger.warn(`Failed to fetch comments for post ${postId}`, { error: String(commentError) });
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`LinkedIn API error: ${errorMessage}`, error);
        throw new ExternalAPIError('LinkedIn', errorMessage, error);
      }
      throw error;
    }

    return mentions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ExternalAPIError('LinkedIn', error.message, error);
    }
    throw new ExternalAPIError('LinkedIn', 'Unknown error', error as Error);
  }
}

