/**
 * LinkedIn API Client
 * Handles LinkedIn API v2 integrations
 */

import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInAPIResponse<T = any> {
  elements?: T[];
  paging?: {
    count: number;
    start: number;
    links?: {
      rel: string;
      href: string;
    }[];
  };
}

export interface LinkedInPost {
  id: string;
  author: string;
  text?: string;
  created: {
    time: number; // Unix timestamp in milliseconds
  };
  lastModified?: {
    time: number;
  };
  visibility?: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
  specificContent?: {
    'com.linkedin.ugc.ShareContent': {
      shareMediaCategory: string;
      media?: Array<{
        status: string;
        description?: {
          text: string;
        };
        media: string;
        thumbnails?: string[];
        title?: {
          text: string;
        };
      }>;
    };
  };
  lifecycleState?: string;
}

export interface LinkedInStats {
  numLikes?: number;
  numComments?: number;
  numShares?: number;
  numViews?: number;
}

export interface LinkedInProfile {
  id: string;
  firstName?: {
    localized?: {
      [key: string]: string;
    };
  };
  lastName?: {
    localized?: {
      [key: string]: string;
    };
  };
  headline?: {
    localized?: {
      [key: string]: string;
    };
  };
  profilePicture?: {
    displayImage: string;
  };
}

/**
 * Make authenticated request to LinkedIn API
 */
async function makeLinkedInRequest<T = any>(
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const url = `${LINKEDIN_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalAPIError(
        'LinkedIn API',
        errorData.message || `HTTP ${response.status}`,
        new Error(JSON.stringify(errorData))
      );
    }

    return await response.json();
  } catch (error) {
    logger.error('LinkedIn API request failed', error as Error, { endpoint });
    throw error;
  }
}

/**
 * Get LinkedIn profile info
 */
export async function getLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfile> {
  return makeLinkedInRequest<LinkedInProfile>(
    '/me',
    accessToken
  );
}

/**
 * Get LinkedIn organization posts (UGC Posts)
 * For personal profiles or organizations
 */
export async function getLinkedInPosts(
  accessToken: string,
  authorId: string,
  count: number = 25
): Promise<LinkedInPost[]> {
  const params = new URLSearchParams({
    q: 'author',
    author: authorId,
    count: count.toString(),
    start: '0',
  });

  const response = await makeLinkedInRequest<LinkedInAPIResponse<LinkedInPost>>(
    `/ugcPosts?${params.toString()}`,
    accessToken
  );

  return response.elements || [];
}

/**
 * Get post statistics (likes, comments, shares)
 */
export async function getLinkedInPostStats(
  accessToken: string,
  postId: string
): Promise<LinkedInStats> {
  try {
    // Get social actions (likes)
    const socialParams = new URLSearchParams({
      q: 'activity',
      activity: postId,
    });

    const socialResponse = await makeLinkedInRequest<any>(
      `/socialActions/${postId}/(activity:${postId})`,
      accessToken
    ).catch(() => null);

    // Get comments count
    const commentsParams = new URLSearchParams({
      q: 'object',
      object: postId,
    });

    const commentsResponse = await makeLinkedInRequest<LinkedInAPIResponse>(
      `/socialMetadata/${postId}?${commentsParams.toString()}`,
      accessToken
    ).catch(() => null);

    const stats: LinkedInStats = {
      numLikes: socialResponse?.likesSummary?.totalLikes || 0,
      numComments: commentsResponse?.paging?.count || 0,
      numShares: socialResponse?.sharesSummary?.totalShares || 0,
      numViews: 0, // Views require additional permissions
    };

    return stats;
  } catch (error) {
    logger.warn('Failed to get LinkedIn post stats', { error, postId });
    return {
      numLikes: 0,
      numComments: 0,
      numShares: 0,
      numViews: 0,
    };
  }
}

/**
 * Get LinkedIn organization info
 */
export async function getLinkedInOrganization(
  accessToken: string,
  organizationId: string
): Promise<{
  id: string;
  name: {
    localized: {
      [key: string]: string;
    };
  };
  vanityName?: string;
}> {
  return makeLinkedInRequest(
    `/organizations/${organizationId}`,
    accessToken
  );
}

/**
 * Search LinkedIn posts mentioning specific terms
 * Note: LinkedIn API has limited search capabilities
 * This is a client-side filter on fetched posts
 */
export async function searchLinkedInMentions(
  accessToken: string,
  authorId: string,
  searchTerms: string[]
): Promise<LinkedInPost[]> {
  try {
    const posts = await getLinkedInPosts(accessToken, authorId, 50);

    return posts.filter(post => {
      const text = post.text?.toLowerCase() || '';
      const media = post.specificContent?.['com.linkedin.ugc.ShareContent']?.media || [];
      const mediaText = media.map(m => m.description?.text || m.title?.text || '').join(' ').toLowerCase();
      const fullText = `${text} ${mediaText}`;

      return searchTerms.some(term => fullText.includes(term.toLowerCase()));
    });
  } catch (error) {
    logger.error('Failed to search LinkedIn mentions', error as Error);
    return [];
  }
}

/**
 * Validate LinkedIn access token
 */
export async function validateLinkedInToken(
  accessToken: string
): Promise<{ valid: boolean; expiresIn?: number }> {
  try {
    // Try to get profile to validate token
    await getLinkedInProfile(accessToken);
    return { valid: true };
  } catch (error) {
    logger.error('LinkedIn token validation failed', error as Error);
    return { valid: false };
  }
}

/**
 * Extract text content from LinkedIn post
 */
export function extractLinkedInPostText(post: LinkedInPost): string {
  const mainText = post.text || '';
  const media = post.specificContent?.['com.linkedin.ugc.ShareContent']?.media || [];
  const mediaTexts = media
    .map(m => [m.description?.text, m.title?.text].filter(Boolean).join(' '))
    .filter(Boolean);

  return [mainText, ...mediaTexts].join('\n\n').trim();
}

/**
 * Get post URL from LinkedIn post
 */
export function getLinkedInPostUrl(post: LinkedInPost, vanityName?: string): string {
  // Extract URN from post ID
  // Format: urn:li:ugcPost:1234567890
  const urnMatch = post.id.match(/ugcPost:(\d+)/);
  if (!urnMatch) {
    return `https://www.linkedin.com/feed/update/${post.id}`;
  }

  const postId = urnMatch[1];

  if (vanityName) {
    return `https://www.linkedin.com/company/${vanityName}/posts/?feedView=all`;
  }

  return `https://www.linkedin.com/feed/update/urn:li:activity:${postId}`;
}
