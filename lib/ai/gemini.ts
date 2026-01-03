/**
 * Google Gemini AI Client
 * Using Vercel AI SDK with Google AI provider
 */

import { generateText, generateObject, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

/**
 * Available Gemini models
 */
export const GEMINI_MODELS = {
  pro: 'models/gemini-1.5-pro-latest',      // Best quality, 2M context
  flash: 'models/gemini-1.5-flash-latest',  // Faster, cheaper, 1M context
  pro_002: 'models/gemini-2.0-flash-exp',   // Experimental, latest features
} as const;

export type GeminiModel = keyof typeof GEMINI_MODELS;

/**
 * Get model name based on task type
 */
export function getGeminiModel(task: 'content' | 'sentiment' | 'analysis'): string {
  switch (task) {
    case 'content':
      return GEMINI_MODELS.pro; // Best quality for content generation
    case 'sentiment':
      return GEMINI_MODELS.flash; // Fast enough for sentiment
    case 'analysis':
      return GEMINI_MODELS.pro; // Deep analysis needs pro
    default:
      return GEMINI_MODELS.flash;
  }
}

/**
 * Generate text using Gemini
 */
export async function generateWithGemini(
  prompt: string,
  options: {
    model?: GeminiModel;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const {
    model = 'pro',
    temperature = 0.7,
    maxTokens = 8192,
  } = options;

  try {
    const { text } = await generateText({
      model: google(GEMINI_MODELS[model]),
      prompt,
      temperature,
      maxTokens,
    });

    return text;
  } catch (error) {
    logger.error('Gemini API error (generateText)', error as Error);
    throw error;
  }
}

/**
 * Generate structured JSON using Gemini
 */
export async function generateStructuredGemini<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: {
    model?: GeminiModel;
    temperature?: number;
  } = {}
): Promise<T> {
  const {
    model = 'pro',
    temperature = 0.7,
  } = options;

  try {
    const { object } = await generateObject({
      model: google(GEMINI_MODELS[model]),
      prompt,
      schema,
      temperature,
    });

    return object;
  } catch (error) {
    logger.error('Gemini API error (generateObject)', error as Error);
    throw error;
  }
}

/**
 * Stream text using Gemini (for real-time UI updates)
 */
export async function streamWithGemini(
  prompt: string,
  options: {
    model?: GeminiModel;
    temperature?: number;
  } = {}
) {
  const {
    model = 'pro',
    temperature = 0.7,
  } = options;

  try {
    const result = await streamText({
      model: google(GEMINI_MODELS[model]),
      prompt,
      temperature,
    });

    return result;
  } catch (error) {
    logger.error('Gemini API error (streamText)', error as Error);
    throw error;
  }
}

/**
 * Call Gemini with retry logic and rate limiting
 */
export async function callGemini<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        logger.warn(`Gemini rate limit hit, waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Check if it's a recoverable error
      if (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('ECONNRESET')
      )) {
        logger.warn(`Gemini temporary error, retrying ${i + 1}/${retries}`, {
          error: error.message,
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Non-recoverable error, throw immediately
      throw error;
    }
  }

  // All retries failed
  throw lastError || new Error('Gemini API call failed after retries');
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}
