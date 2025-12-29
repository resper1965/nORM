/**
 * Meta Graph API Client
 * Handles Instagram and Facebook API integrations
 */

import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

export interface MetaAPIResponse<T = any> {
  data?: T;
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  insights?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
  };
}

export interface InstagramProfile {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  profile_picture_url?: string;
}

/**
 * Make authenticated request to Meta Graph API
 */
async function makeMetaRequest<T = any>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<MetaAPIResponse<T>> {
  const url = new URL(`${META_GRAPH_API_BASE}${endpoint}`);
  url.searchParams.set('access_token', accessToken);

  // Add additional params
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ExternalAPIError(
        'Meta Graph API',
        data.error?.message || 'Request failed',
        new Error(`HTTP ${response.status}`)
      );
    }

    return data as MetaAPIResponse<T>;
  } catch (error) {
    logger.error('Meta Graph API request failed', error as Error, { endpoint });
    throw error;
  }
}

/**
 * Get Instagram Business Account profile
 */
export async function getInstagramProfile(
  accessToken: string,
  userId: string
): Promise<InstagramProfile> {
  const response = await makeMetaRequest<InstagramProfile>(
    `/${userId}`,
    accessToken,
    {
      fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
    }
  );

  if (response.error) {
    throw new ExternalAPIError('Instagram API', response.error.message);
  }

  if (!response.data && (response as any).id) {
    // Response is the profile itself (Meta API sometimes returns object directly)
    return response as any as InstagramProfile;
  }

  return response.data!;
}

/**
 * Get Instagram posts (media)
 */
export async function getInstagramPosts(
  accessToken: string,
  userId: string,
  limit: number = 25
): Promise<InstagramPost[]> {
  const response = await makeMetaRequest<InstagramPost[]>(
    `/${userId}/media`,
    accessToken,
    {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
      limit: limit.toString(),
    }
  );

  if (response.error) {
    throw new ExternalAPIError('Instagram API', response.error.message);
  }

  return response.data || [];
}

/**
 * Get Instagram post insights
 */
export async function getInstagramPostInsights(
  accessToken: string,
  mediaId: string
): Promise<{ impressions?: number; reach?: number; engagement?: number }> {
  try {
    const response = await makeMetaRequest(
      `/${mediaId}/insights`,
      accessToken,
      {
        metric: 'impressions,reach,engagement',
      }
    );

    if (response.error) {
      logger.warn('Failed to get Instagram insights', { error: response.error.message, mediaId });
      return {};
    }

    const insights: any = {};
    const data = response.data || [];

    for (const metric of data) {
      if (metric.name && metric.values && metric.values[0]) {
        insights[metric.name] = metric.values[0].value;
      }
    }

    return insights;
  } catch (error) {
    logger.warn('Failed to get Instagram insights', { error, mediaId });
    return {};
  }
}

/**
 * Get comments on an Instagram post
 */
export async function getInstagramComments(
  accessToken: string,
  mediaId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  text: string;
  timestamp: string;
  username: string;
}>> {
  try {
    const response = await makeMetaRequest(
      `/${mediaId}/comments`,
      accessToken,
      {
        fields: 'id,text,timestamp,username',
        limit: limit.toString(),
      }
    );

    if (response.error) {
      logger.warn('Failed to get Instagram comments', { error: response.error.message, mediaId });
      return [];
    }

    return response.data || [];
  } catch (error) {
    logger.warn('Failed to get Instagram comments', { error, mediaId });
    return [];
  }
}

/**
 * Search Instagram mentions (requires hashtag or @mention)
 */
export async function searchInstagramMentions(
  accessToken: string,
  userId: string,
  query: string,
  limit: number = 25
): Promise<InstagramPost[]> {
  try {
    // Note: Instagram Graph API has limited search capabilities
    // This searches in recent media for caption matches
    const posts = await getInstagramPosts(accessToken, userId, limit);

    const queryLower = query.toLowerCase();
    return posts.filter(post =>
      post.caption?.toLowerCase().includes(queryLower)
    );
  } catch (error) {
    logger.error('Failed to search Instagram mentions', error as Error, { query });
    return [];
  }
}

/**
 * Validate Meta access token
 */
export async function validateMetaToken(accessToken: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  scopes?: string[];
}> {
  try {
    const response = await makeMetaRequest(
      '/debug_token',
      accessToken,
      {
        input_token: accessToken,
      }
    );

    if (response.error || !response.data) {
      return { valid: false };
    }

    const tokenData = response.data as any;

    return {
      valid: tokenData.is_valid || false,
      expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : undefined,
      scopes: tokenData.scopes || [],
    };
  } catch (error) {
    logger.error('Failed to validate Meta token', error as Error);
    return { valid: false };
  }
}
