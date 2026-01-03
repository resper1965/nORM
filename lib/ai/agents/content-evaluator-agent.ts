/**
 * Content Evaluator Agent
 * Specialized AI agent for evaluating and analyzing generated content quality
 */

import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { logger } from '@/lib/utils/logger';

export interface ContentEvaluationInput {
  title: string;
  content: string;
  metaDescription: string;
  targetKeywords: string[];
  wordCount: number;
  contentType?: 'article' | 'counter-article' | 'blog-post';
}

export interface ContentEvaluationOutput {
  overallScore: number; // 0-100
  seoScore: number;
  readabilityScore: number;
  relevanceScore: number;
  qualityScore: number;
  breakdown: {
    title: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    content: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    seo: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    readability: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
  };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export class ContentEvaluatorAgent extends BaseAgent<ContentEvaluationInput, ContentEvaluationOutput> {
  constructor(context: AgentContext) {
    super(context, 'ContentEvaluator');
  }

  protected getSystemPrompt(): string {
    return `Você é um agente especializado em avaliação de conteúdo para gestão de reputação online.

Responsabilidades:
- Avaliar qualidade, SEO, legibilidade e relevância de artigos
- Identificar pontos fortes e fracos
- Fornecer recomendações práticas de melhoria
- Sempre retornar JSON válido com análise detalhada

Critérios de avaliação:
- SEO: otimização para palavras-chave, meta tags, estrutura
- Legibilidade: clareza, estrutura, facilidade de leitura
- Relevância: adequação ao tópico e público-alvo
- Qualidade: gramática, estilo, profissionalismo`;
  }

  async execute(input: ContentEvaluationInput): Promise<AgentResponse<ContentEvaluationOutput>> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input: title, content, and targetKeywords are required',
        };
      }

      logger.info('ContentEvaluatorAgent: Starting evaluation', {
        clientId: this.context.clientId,
        title: input.title,
      });

      const evaluationPrompt = this.buildEvaluationPrompt(input);

      const response = await this.callAI(
        [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: evaluationPrompt,
          },
        ],
        {
          model: 'pro',
          temperature: 0.3, // Lower temperature for more consistent evaluation
          responseFormat: 'json_object',
        }
      );

      const evaluation = JSON.parse(response) as ContentEvaluationOutput;

      // Validate and normalize scores
      evaluation.overallScore = Math.max(0, Math.min(100, evaluation.overallScore || 0));
      evaluation.seoScore = Math.max(0, Math.min(100, evaluation.seoScore || 0));
      evaluation.readabilityScore = Math.max(0, Math.min(100, evaluation.readabilityScore || 0));
      evaluation.relevanceScore = Math.max(0, Math.min(100, evaluation.relevanceScore || 0));
      evaluation.qualityScore = Math.max(0, Math.min(100, evaluation.qualityScore || 0));

      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      logger.error('ContentEvaluatorAgent: Evaluation failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildEvaluationPrompt(input: ContentEvaluationInput): string {
    return `Avalie o seguinte conteúdo em português brasileiro (PT-BR):

TÍTULO:
${input.title}

CONTEÚDO:
${input.content.substring(0, 4000)}${input.content.length > 4000 ? '...' : ''}

META DESCRIÇÃO:
${input.metaDescription}

PALAVRAS-CHAVE ALVO:
${input.targetKeywords.join(', ')}

CONTAGEM DE PALAVRAS:
${input.wordCount}

TIPO DE CONTEÚDO:
${input.contentType || 'article'}

CLIENTE:
${this.context.clientName}

Avalie o conteúdo considerando:
1. SEO (0-100): Otimização para palavras-chave, meta tags, estrutura HTML
2. Legibilidade (0-100): Clareza, estrutura, facilidade de leitura
3. Relevância (0-100): Adequação ao tópico e público-alvo
4. Qualidade (0-100): Gramática, estilo, profissionalismo, tom

Forneça:
- Score geral (média ponderada: SEO 30%, Legibilidade 25%, Relevância 25%, Qualidade 20%)
- Breakdown detalhado para título, conteúdo, SEO e legibilidade
- Pontos fortes
- Pontos fracos
- Recomendações práticas de melhoria

Formato JSON:
{
  "overallScore": 85,
  "seoScore": 90,
  "readabilityScore": 80,
  "relevanceScore": 85,
  "qualityScore": 85,
  "breakdown": {
    "title": {
      "score": 90,
      "issues": ["..."],
      "suggestions": ["..."]
    },
    "content": {
      "score": 85,
      "issues": ["..."],
      "suggestions": ["..."]
    },
    "seo": {
      "score": 90,
      "issues": ["..."],
      "suggestions": ["..."]
    },
    "readability": {
      "score": 80,
      "issues": ["..."],
      "suggestions": ["..."]
    }
  },
  "recommendations": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."]
}

Retorne apenas JSON válido, sem markdown.`;
  }
}

