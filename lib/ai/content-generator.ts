/**
 * AI Content Generator
 * Generate SEO-optimized articles using OpenAI GPT-4
 */

import { callOpenAI, getModel } from './openai';
import { getContentGenerationPrompt, getCounterArticlePrompt } from './prompts';
import { logger } from '@/lib/utils/logger';
import type { GeneratedContent } from '@/lib/types/domain';

export interface ContentGenerationOptions {
  clientId: string;
  clientName: string;
  topic: string;
  targetKeywords: string[];
  articleCount: number;
  triggerMentionId?: string;
  triggerMentionUrl?: string;
  triggerMentionTitle?: string;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  metaDescription: string;
  targetKeywords: string[];
  wordCount: number;
}

/**
 * Generate content articles
 * @deprecated Use ContentGeneratorAgent instead for better evaluation and quality metrics
 */
export async function generateContent(
  options: ContentGenerationOptions
): Promise<GeneratedArticle[]> {
  // Use the new agent-based approach if available
  try {
    const { ContentGeneratorAgent } = await import('./agents/content-generator-agent');
    const { createAgentContext } = await import('./agents/orchestrator');
    
    const context = createAgentContext(
      options.clientId,
      options.clientName,
      undefined,
      { triggerMentionId: options.triggerMentionId }
    );

    const agent = new ContentGeneratorAgent(context);
    const agentInput = {
      topic: options.topic,
      targetKeywords: options.targetKeywords,
      articleCount: options.articleCount,
      triggerMentionId: options.triggerMentionId,
      triggerMentionUrl: options.triggerMentionUrl,
      triggerMentionTitle: options.triggerMentionTitle,
    };

    const result = await agent.execute(agentInput);
    
    if (result.success && result.data) {
      return result.data.articles;
    }

    // Fallback to old implementation if agent fails
    logger.warn('Agent-based generation failed, falling back to legacy implementation', {
      error: result.error,
    });
  } catch (error) {
    logger.warn('Agent import failed, using legacy implementation', {
      error,
    });
  }

  // Legacy implementation (fallback)
  const articles: GeneratedArticle[] = [];

  logger.info('Starting content generation (legacy)', {
    clientId: options.clientId,
    topic: options.topic,
    articleCount: options.articleCount,
  });

  for (let i = 0; i < options.articleCount; i++) {
    try {
      // Choose prompt based on whether it's a counter-article
      const prompt = options.triggerMentionId && options.triggerMentionTitle
        ? getCounterArticlePrompt(
            options.triggerMentionTitle,
            options.triggerMentionUrl || '',
            options.clientName,
            options.targetKeywords,
            i
          )
        : getContentGenerationPrompt(
            options.topic,
            options.clientName,
            options.targetKeywords,
            options.articleCount,
            i
          );

      const response = await callOpenAI(async () => {
        const openai = await import('./openai').then(m => m.openai);
        if (!openai) throw new Error('OpenAI not configured');
        
        return openai.chat.completions.create({
          model: getModel('content'),
          messages: [
            {
              role: 'system',
              content: 'Você é um redator SEO especializado em gestão de reputação online. Sempre retorne JSON válido, sem formatação markdown.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7, // Slightly creative for content generation
          response_format: { type: 'json_object' },
        });
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as {
        title: string;
        content: string;
        meta_description: string;
        target_keywords: string[];
        word_count: number;
      };

      articles.push({
        title: result.title,
        content: result.content,
        metaDescription: result.meta_description || '',
        targetKeywords: result.target_keywords || options.targetKeywords,
        wordCount: result.word_count || 0,
      });

      logger.info(`Generated article ${i + 1}/${options.articleCount}`, {
        title: result.title,
        wordCount: result.word_count,
      });
    } catch (error) {
      logger.error(`Failed to generate article ${i + 1}`, error as Error);
      // Continue with other articles even if one fails
    }
  }

  return articles;
}

/**
 * Calculate SEO score for generated content
 * Simplified version - can be enhanced with more sophisticated analysis
 */
export function calculateSEOScore(
  content: string,
  title: string,
  metaDescription: string,
  targetKeywords: string[]
): number {
  let score = 0;

  // Title length (60-70 chars is optimal)
  const titleLength = title.length;
  if (titleLength >= 60 && titleLength <= 70) {
    score += 20;
  } else if (titleLength >= 50 && titleLength <= 80) {
    score += 15;
  } else {
    score += 10;
  }

  // Meta description length (150-160 chars is optimal)
  const metaLength = metaDescription.length;
  if (metaLength >= 150 && metaLength <= 160) {
    score += 20;
  } else if (metaLength >= 120 && metaLength <= 170) {
    score += 15;
  } else {
    score += 10;
  }

  // Keyword density (1-2% is optimal)
  const contentLower = content.toLowerCase();
  const totalWords = contentLower.split(/\s+/).length;
  
  for (const keyword of targetKeywords) {
    const keywordLower = keyword.toLowerCase();
    const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
    const density = (keywordCount / totalWords) * 100;
    
    if (density >= 1 && density <= 2) {
      score += 20;
    } else if (density >= 0.5 && density <= 3) {
      score += 15;
    } else {
      score += 10;
    }
  }

  // Content length (800-1500 words is optimal)
  if (totalWords >= 800 && totalWords <= 1500) {
    score += 20;
  } else if (totalWords >= 600 && totalWords <= 2000) {
    score += 15;
  } else {
    score += 10;
  }

  // Has headings (H2, H3)
  const hasH2 = /<h2[^>]*>/i.test(content);
  const hasH3 = /<h3[^>]*>/i.test(content);
  if (hasH2 && hasH3) {
    score += 20;
  } else if (hasH2 || hasH3) {
    score += 15;
  } else {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Calculate readability score (simplified Flesch Reading Ease)
 */
export function calculateReadabilityScore(content: string): number {
  // Remove HTML tags for analysis
  const text = content.replace(/<[^>]*>/g, ' ');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    // Simplified syllable count
    const wordLower = word.toLowerCase();
    const vowelGroups = wordLower.match(/[aeiouáéíóúâêôãõ]+/g) || [];
    return count + vowelGroups.length;
  }, 0);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Normalize to 0-100 scale
  return Math.max(0, Math.min(100, Math.round(score)));
}

