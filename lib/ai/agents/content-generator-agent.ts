/**
 * Content Generator Agent
 * Specialized AI agent for generating SEO-optimized content articles
 */

import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { getContentGenerationPrompt, getCounterArticlePrompt } from '../prompts';
import { logger } from '@/lib/utils/logger';

export interface ContentGenerationInput {
  topic: string;
  targetKeywords: string[];
  articleCount: number;
  triggerMentionId?: string;
  triggerMentionUrl?: string;
  triggerMentionTitle?: string;
  angle?: string;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  metaDescription: string;
  targetKeywords: string[];
  wordCount: number;
  seoScore?: number;
  readabilityScore?: number;
}

export interface ContentGenerationOutput {
  articles: GeneratedArticle[];
  totalGenerated: number;
  generationTime: number;
  qualityMetrics: {
    averageSEOScore: number;
    averageReadability: number;
    averageWordCount: number;
  };
}

export class ContentGeneratorAgent extends BaseAgent<ContentGenerationInput, ContentGenerationOutput> {
  constructor(context: AgentContext) {
    super(context, 'ContentGenerator');
  }

  protected getSystemPrompt(): string {
    return `Você é um agente especializado em geração de conteúdo SEO para gestão de reputação online.

Responsabilidades:
- Gerar artigos otimizados para SEO em português brasileiro (PT-BR)
- Garantir qualidade, relevância e otimização para mecanismos de busca
- Criar conteúdo positivo que contraponha conteúdo negativo
- Sempre retornar JSON válido, sem formatação markdown

Sempre:
- Use linguagem natural e fluente
- Mantenha tom profissional e positivo
- Otimize para palavras-chave sem comprometer legibilidade
- Estruture o conteúdo com H2 e H3
- Inclua exemplos e dados quando possível`;
  }

  async execute(input: ContentGenerationInput): Promise<AgentResponse<ContentGenerationOutput>> {
    const startTime = Date.now();

    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input: topic and targetKeywords are required',
        };
      }

      logger.info('ContentGeneratorAgent: Starting generation', {
        clientId: this.context.clientId,
        topic: input.topic,
        articleCount: input.articleCount,
      });

      const articles: GeneratedArticle[] = [];

      for (let i = 0; i < input.articleCount; i++) {
        try {
          const article = await this.generateSingleArticle(input, i);
          articles.push(article);
        } catch (error) {
          logger.error(`Failed to generate article ${i + 1}`, error as Error);
          // Continue with other articles
        }
      }

      if (articles.length === 0) {
        return {
          success: false,
          error: 'Failed to generate any articles',
        };
      }

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(articles);

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          articles,
          totalGenerated: articles.length,
          generationTime,
          qualityMetrics,
        },
        metadata: {
          processingTime: generationTime,
        },
      };
    } catch (error) {
      logger.error('ContentGeneratorAgent: Execution failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async generateSingleArticle(
    input: ContentGenerationInput,
    index: number
  ): Promise<GeneratedArticle> {
    const prompt = input.triggerMentionId && input.triggerMentionTitle
      ? getCounterArticlePrompt(
          input.triggerMentionTitle,
          input.triggerMentionUrl || '',
          this.context.clientName,
          input.targetKeywords,
          index
        )
      : getContentGenerationPrompt(
          input.topic,
          this.context.clientName,
          input.targetKeywords,
          input.articleCount,
          index
        );

    const response = await this.callAI(
      [
        {
          role: 'system',
          content: this.getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
          model: 'pro',
        temperature: 0.7,
        responseFormat: 'json_object',
      }
    );

    const result = JSON.parse(response) as {
      title: string;
      content: string;
      meta_description: string;
      target_keywords: string[];
      word_count: number;
    };

    // Calculate scores
    const seoScore = this.calculateSEOScore(
      result.content,
      result.title,
      result.meta_description,
      result.target_keywords
    );
    const readabilityScore = this.calculateReadability(result.content);

    return {
      title: result.title,
      content: result.content,
      metaDescription: result.meta_description || '',
      targetKeywords: result.target_keywords || input.targetKeywords,
      wordCount: result.word_count || 0,
      seoScore,
      readabilityScore,
    };
  }

  private calculateSEOScore(
    content: string,
    title: string,
    metaDescription: string,
    targetKeywords: string[]
  ): number {
    let score = 0;

    // Title length (60-70 chars is optimal)
    const titleLength = title.length;
    if (titleLength >= 60 && titleLength <= 70) score += 20;
    else if (titleLength >= 50 && titleLength <= 80) score += 15;
    else score += 10;

    // Meta description length (150-160 chars is optimal)
    const metaLength = metaDescription.length;
    if (metaLength >= 150 && metaLength <= 160) score += 20;
    else if (metaLength >= 120 && metaLength <= 170) score += 15;
    else score += 10;

    // Keyword density
    const contentLower = content.toLowerCase();
    const totalWords = contentLower.split(/\s+/).length;
    
    for (const keyword of targetKeywords) {
      const keywordLower = keyword.toLowerCase();
      const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      const density = (keywordCount / totalWords) * 100;
      
      if (density >= 1 && density <= 2) score += 20;
      else if (density >= 0.5 && density <= 3) score += 15;
      else score += 10;
    }

    // Content length
    if (totalWords >= 800 && totalWords <= 1500) score += 20;
    else if (totalWords >= 600 && totalWords <= 2000) score += 15;
    else score += 10;

    // Headings
    const hasH2 = /<h2[^>]*>/i.test(content);
    const hasH3 = /<h3[^>]*>/i.test(content);
    if (hasH2 && hasH3) score += 20;
    else if (hasH2 || hasH3) score += 15;
    else score += 10;

    return Math.min(100, score);
  }

  private calculateReadability(content: string): number {
    const text = content.replace(/<[^>]*>/g, ' ');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => {
      const wordLower = word.toLowerCase();
      const vowelGroups = wordLower.match(/[aeiouáéíóúâêôãõ]+/g) || [];
      return count + vowelGroups.length;
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateQualityMetrics(articles: GeneratedArticle[]) {
    const total = articles.length;
    if (total === 0) {
      return {
        averageSEOScore: 0,
        averageReadability: 0,
        averageWordCount: 0,
      };
    }

    const averageSEOScore = articles.reduce((sum, a) => sum + (a.seoScore || 0), 0) / total;
    const averageReadability = articles.reduce((sum, a) => sum + (a.readabilityScore || 0), 0) / total;
    const averageWordCount = articles.reduce((sum, a) => sum + a.wordCount, 0) / total;

    return {
      averageSEOScore: Math.round(averageSEOScore * 100) / 100,
      averageReadability: Math.round(averageReadability * 100) / 100,
      averageWordCount: Math.round(averageWordCount),
    };
  }
}

