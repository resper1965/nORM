/**
 * OpenAI Client Wrapper
 * Centralized OpenAI integration with error handling and retry logic
 */

import OpenAI from 'openai';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

if (!env.OPENAI_API_KEY) {
  logger.warn('OpenAI API key not configured');
}

export const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

/**
 * Call OpenAI API with retry logic
 */
export async function callOpenAI<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  if (!openai) {
    throw new ExternalAPIError('OpenAI', 'API key not configured');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`OpenAI API call failed (attempt ${attempt}/${retries})`, {
        error: error instanceof Error ? error.message : String(error),
      });

      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new ExternalAPIError('OpenAI', lastError?.message || 'Unknown error', lastError || undefined);
}

/**
 * Get model to use based on use case
 */
export function getModel(useCase: 'content' | 'sentiment' | 'draft'): string {
  // Use GPT-4 for final content and sentiment analysis
  // Use GPT-3.5-turbo for drafts to save costs
  if (useCase === 'draft') {
    return 'gpt-3.5-turbo';
  }
  return 'gpt-4';
}

