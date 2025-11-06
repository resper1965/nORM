/**
 * WordPress REST API Client
 * Client for interacting with WordPress sites
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  status: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
}

export interface WordPressSiteConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

/**
 * Create WordPress API client
 */
export function createWordPressClient(config: WordPressSiteConfig): AxiosInstance {
  const baseURL = `${config.siteUrl}/wp-json/wp/v2`;
  const auth = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64');

  return axios.create({
    baseURL,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

/**
 * Test WordPress connection
 */
export async function testWordPressConnection(
  config: WordPressSiteConfig
): Promise<{ success: boolean; message: string; siteName?: string }> {
  try {
    const client = createWordPressClient(config);
    
    // Test connection by fetching site info
    const response = await client.get('/');
    
    return {
      success: true,
      message: 'Connection successful',
      siteName: response.data.name,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Check username and application password.',
        };
      }
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'WordPress REST API not found. Ensure REST API is enabled.',
        };
      }
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
    return {
      success: false,
      message: 'Unknown error occurred',
    };
  }
}

/**
 * Create post as draft
 */
export async function createDraftPost(
  config: WordPressSiteConfig,
  post: {
    title: string;
    content: string;
    excerpt?: string;
    categories?: number[];
    tags?: string[];
  }
): Promise<{ id: number; url: string }> {
  try {
    const client = createWordPressClient(config);

    // Get or create category
    let categoryId = post.categories?.[0];
    if (!categoryId && post.categories) {
      // Try to find category by name
      const categoriesResponse = await client.get('/categories', {
        params: { search: 'Blog' },
      });
      if (categoriesResponse.data.length > 0) {
        categoryId = categoriesResponse.data[0].id;
      } else {
        // Create category
        const newCategory = await client.post('/categories', {
          name: 'Blog',
          slug: 'blog',
        });
        categoryId = newCategory.data.id;
      }
    }

    // Create post
    const response = await client.post('/posts', {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      status: 'draft',
      categories: categoryId ? [categoryId] : [],
      // Tags will be handled separately if needed
    });

    const postId = response.data.id;
    const editUrl = `${config.siteUrl}/wp-admin/post.php?post=${postId}&action=edit`;

    logger.info('WordPress post created', {
      postId,
      title: post.title,
      url: editUrl,
    });

    return {
      id: postId,
      url: editUrl,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ExternalAPIError('WordPress', error.message, error);
    }
    throw new ExternalAPIError('WordPress', 'Unknown error', error as Error);
  }
}

