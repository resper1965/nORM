/**
 * Sentiment Analysis
 * Analyzes text sentiment using AI Gateway (with caching & fallback)
 */

import { callAIGateway } from './gateway';
import type { Sentiment } from '@/lib/types/domain';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

export interface SentimentAnalysis {
  sentiment: Sentiment;
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  rationale: string;
}

// Zod schema for sentiment response
const sentimentSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  score: z.number().min(-1).max(1),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
});

/**
 * Analyze sentiment of text using Gemini Flash
 * @param text Text to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  const prompt = `Analise o sentimento do seguinte texto em português brasileiro (PT-BR).

Retorne um objeto JSON com:
- sentiment: "positive", "neutral", ou "negative"
- score: número entre -1.0 (muito negativo) e 1.0 (muito positivo)
- confidence: número entre 0.0 e 1.0 (nível de confiança na análise)
- rationale: explicação breve em português (máx 100 caracteres)

Texto para analisar:
${text}

Considere o contexto de reputação online e gestão de marca.`;

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
    const score = Math.max(-1, Math.min(1, result.score));
    const confidence = Math.max(0, Math.min(1, result.confidence));

    return {
      sentiment: result.sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      rationale: result.rationale || 'Sem justificativa',
    };
  } catch (error) {
    logger.error('Sentiment analysis failed', error as Error);
    // Return neutral sentiment on error
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      rationale: 'Erro ao analisar sentimento',
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

