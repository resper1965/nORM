/**
 * Sentiment Analysis
 * Analyzes text sentiment using AI Gateway (with caching & fallback)
 */

import { callAIGateway } from './gateway';
import type { Sentiment } from '@/lib/types/domain';
import { logger } from '@/lib/utils/logger';

export interface SentimentAnalysis {
  sentiment: Sentiment;
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  rationale: string;
}

/**
 * Analyze sentiment of text
 * @param text Text to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  const prompt = `Analyze the sentiment of the following text in Portuguese (PT-BR). 
Return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: number between -1.0 (very negative) and 1.0 (very positive)
- confidence: number between 0.0 and 1.0 (how confident you are)
- rationale: brief explanation in Portuguese

Text to analyze:
${text}

Return only valid JSON, no markdown formatting.`;

  try {
    // Use AI Gateway with cache and fallback
    const response = await callAIGateway(
      [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: 'gpt-3.5-turbo', // Sentiment analysis works well with GPT-3.5
        temperature: 0.3,
        maxTokens: 500,
        useCache: true, // Cache sentiment results
        enableFallback: true,
      }
    );

    const result = JSON.parse(response.content) as {
      sentiment: string;
      score: number;
      confidence: number;
      rationale: string;
    };

    // Validate and normalize
    const sentiment = ['positive', 'neutral', 'negative'].includes(result.sentiment)
      ? (result.sentiment as Sentiment)
      : 'neutral';

    const score = Math.max(-1, Math.min(1, result.score));
    const confidence = Math.max(0, Math.min(1, result.confidence));

    return {
      sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      rationale: result.rationale || 'No rationale provided',
    };
  } catch (error) {
    logger.error('Sentiment analysis failed', error as Error);
    // Return neutral sentiment on error
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      rationale: 'Error analyzing sentiment',
    };
  }
}

/**
 * Batch analyze sentiment for multiple texts
 */
export async function analyzeSentimentBatch(
  texts: string[]
): Promise<SentimentAnalysis[]> {
  // Analyze in parallel (with rate limiting consideration)
  const results = await Promise.all(
    texts.map((text) => analyzeSentiment(text))
  );
  return results;
}

