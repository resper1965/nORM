/**
 * WordPress REST API Client
 * Handles automatic content publishing to WordPress sites
 */

import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  status: 'publish' | 'draft' | 'pending' | 'private';
  date: string;
  link: string;
  author: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
}

export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'publish' | 'draft' | 'pending';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

/**
 * Make authenticated request to WordPress REST API
 */
async function makeWordPressRequest<T = any>(
  siteUrl: string,
  endpoint: string,
  credentials: { username: string; applicationPassword: string },
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  // Ensure site URL doesn't have trailing slash
  const baseUrl = siteUrl.replace(/\/$/, '');
  const url = `${baseUrl}/wp-json/wp/v2${endpoint}`;

  // Create Basic Auth header
  const authString = btoa(`${credentials.username}:${credentials.applicationPassword}`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalAPIError(
        'WordPress API',
        errorData.message || `HTTP ${response.status}`,
        new Error(JSON.stringify(errorData))
      );
    }

    return await response.json();
  } catch (error) {
    logger.error('WordPress API request failed', error as Error, { endpoint, method });
    throw error;
  }
}

/**
 * Create a new WordPress post
 */
export async function createWordPressPost(
  credentials: WordPressCredentials,
  postData: CreatePostData
): Promise<WordPressPost> {
  const body = {
    title: postData.title,
    content: postData.content,
    excerpt: postData.excerpt,
    status: postData.status || 'draft',
    categories: postData.categories,
    tags: postData.tags,
    featured_media: postData.featured_media,
  };

  return makeWordPressRequest<WordPressPost>(
    credentials.siteUrl,
    '/posts',
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    },
    'POST',
    body
  );
}

/**
 * Update an existing WordPress post
 */
export async function updateWordPressPost(
  credentials: WordPressCredentials,
  postId: number,
  postData: Partial<CreatePostData>
): Promise<WordPressPost> {
  const body = {
    title: postData.title,
    content: postData.content,
    excerpt: postData.excerpt,
    status: postData.status,
    categories: postData.categories,
    tags: postData.tags,
    featured_media: postData.featured_media,
  };

  return makeWordPressRequest<WordPressPost>(
    credentials.siteUrl,
    `/posts/${postId}`,
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    },
    'PUT',
    body
  );
}

/**
 * Get WordPress post by ID
 */
export async function getWordPressPost(
  credentials: WordPressCredentials,
  postId: number
): Promise<WordPressPost> {
  return makeWordPressRequest<WordPressPost>(
    credentials.siteUrl,
    `/posts/${postId}`,
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    }
  );
}

/**
 * Get recent WordPress posts
 */
export async function getWordPressPosts(
  credentials: WordPressCredentials,
  params?: {
    per_page?: number;
    page?: number;
    status?: string;
    author?: number;
  }
): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.author) queryParams.set('author', params.author.toString());

  const endpoint = `/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return makeWordPressRequest<WordPressPost[]>(
    credentials.siteUrl,
    endpoint,
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    }
  );
}

/**
 * Delete a WordPress post
 */
export async function deleteWordPressPost(
  credentials: WordPressCredentials,
  postId: number,
  force: boolean = false
): Promise<{ deleted: boolean }> {
  const endpoint = `/posts/${postId}${force ? '?force=true' : ''}`;

  return makeWordPressRequest(
    credentials.siteUrl,
    endpoint,
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    },
    'DELETE'
  );
}

/**
 * Get WordPress categories
 */
export async function getWordPressCategories(
  credentials: WordPressCredentials
): Promise<Array<{ id: number; name: string; slug: string }>> {
  return makeWordPressRequest(
    credentials.siteUrl,
    '/categories',
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    }
  );
}

/**
 * Get WordPress tags
 */
export async function getWordPressTags(
  credentials: WordPressCredentials
): Promise<Array<{ id: number; name: string; slug: string }>> {
  return makeWordPressRequest(
    credentials.siteUrl,
    '/tags',
    {
      username: credentials.username,
      applicationPassword: credentials.applicationPassword,
    }
  );
}

/**
 * Upload media to WordPress
 */
export async function uploadWordPressMedia(
  credentials: WordPressCredentials,
  file: Blob,
  filename: string,
  altText?: string
): Promise<{ id: number; source_url: string }> {
  const baseUrl = credentials.siteUrl.replace(/\/$/, '');
  const url = `${baseUrl}/wp-json/wp/v2/media`;
  const authString = btoa(`${credentials.username}:${credentials.applicationPassword}`);

  const formData = new FormData();
  formData.append('file', file, filename);
  if (altText) {
    formData.append('alt_text', altText);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalAPIError(
        'WordPress Media API',
        errorData.message || `HTTP ${response.status}`,
        new Error(JSON.stringify(errorData))
      );
    }

    return await response.json();
  } catch (error) {
    logger.error('WordPress media upload failed', error as Error);
    throw error;
  }
}

/**
 * Validate WordPress credentials
 */
export async function validateWordPressCredentials(
  credentials: WordPressCredentials
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Try to get current user info to validate credentials
    const baseUrl = credentials.siteUrl.replace(/\/$/, '');
    const url = `${baseUrl}/wp-json/wp/v2/users/me`;
    const authString = btoa(`${credentials.username}:${credentials.applicationPassword}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Authentication failed: ${response.status}`,
      };
    }

    return { valid: true };
  } catch (error) {
    logger.error('WordPress credential validation failed', error as Error);
    return {
      valid: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish AI-generated content to WordPress
 * Helper function for automated publishing
 */
export async function publishAIContentToWordPress(
  credentials: WordPressCredentials,
  content: {
    title: string;
    content: string;
    excerpt?: string;
    categoryId?: number;
    tagIds?: number[];
  },
  publish: boolean = false
): Promise<{ success: boolean; postId?: number; url?: string; error?: string }> {
  try {
    const post = await createWordPressPost(credentials, {
      title: content.title,
      content: content.content,
      excerpt: content.excerpt,
      status: publish ? 'publish' : 'draft',
      categories: content.categoryId ? [content.categoryId] : undefined,
      tags: content.tagIds,
    });

    logger.info('Successfully published content to WordPress', {
      postId: post.id,
      status: post.status,
      url: post.link,
    });

    return {
      success: true,
      postId: post.id,
      url: post.link,
    };
  } catch (error) {
    logger.error('Failed to publish content to WordPress', error as Error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
