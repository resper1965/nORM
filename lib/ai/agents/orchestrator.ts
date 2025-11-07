/**
 * AI Agents Orchestrator
 * Coordinates multiple AI agents for complex workflows
 */

import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { ContentGeneratorAgent, ContentGenerationInput, ContentGenerationOutput } from './content-generator-agent';
import { ContentEvaluatorAgent, ContentEvaluationInput, ContentEvaluationOutput } from './content-evaluator-agent';
import { ReputationAnalyzerAgent, ReputationAnalysisInput, ReputationAnalysisOutput } from './reputation-analyzer-agent';
import { logger } from '@/lib/utils/logger';

export interface OrchestrationResult<T = unknown> {
  success: boolean;
  data?: T;
  results: Array<{
    agent: string;
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
  metadata?: {
    totalProcessingTime: number;
    agentsUsed: string[];
  };
}

/**
 * Orchestrate content generation with evaluation
 */
export async function orchestrateContentGenerationWithEvaluation(
  context: AgentContext,
  input: ContentGenerationInput
): Promise<OrchestrationResult<ContentGenerationOutput & { evaluations: ContentEvaluationOutput[] }>> {
  const startTime = Date.now();
  const results: OrchestrationResult<ContentGenerationOutput & { evaluations: ContentEvaluationOutput[] }>['results'] = [];

  try {
    // Step 1: Generate content
    logger.info('Orchestrator: Starting content generation', {
      clientId: context.clientId,
      topic: input.topic,
    });

    const generator = new ContentGeneratorAgent(context);
    const generationResult = await generator.execute(input);

    if (!generationResult.success || !generationResult.data) {
      return {
        success: false,
        results: [
          {
            agent: 'ContentGenerator',
            success: false,
            error: generationResult.error || 'Content generation failed',
          },
        ],
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          agentsUsed: ['ContentGenerator'],
        },
      };
    }

    results.push({
      agent: 'ContentGenerator',
      success: true,
      data: generationResult.data,
    });

    // Step 2: Evaluate each generated article
    logger.info('Orchestrator: Starting content evaluation', {
      clientId: context.clientId,
      articleCount: generationResult.data.articles.length,
    });

    const evaluator = new ContentEvaluatorAgent(context);
    const evaluations: ContentEvaluationOutput[] = [];

    for (const article of generationResult.data.articles) {
      const evaluationInput: ContentEvaluationInput = {
        title: article.title,
        content: article.content,
        metaDescription: article.metaDescription,
        targetKeywords: article.targetKeywords,
        wordCount: article.wordCount,
        contentType: input.triggerMentionId ? 'counter-article' : 'article',
      };

      const evaluationResult = await evaluator.execute(evaluationInput);

      if (evaluationResult.success && evaluationResult.data) {
        evaluations.push(evaluationResult.data);
      } else {
        logger.warn('Content evaluation failed for article', {
          title: article.title,
          error: evaluationResult.error,
        });
      }
    }

    results.push({
      agent: 'ContentEvaluator',
      success: evaluations.length > 0,
      data: evaluations,
    });

    return {
      success: true,
      results,
      data: {
        ...generationResult.data,
        evaluations,
      },
      metadata: {
        totalProcessingTime: Date.now() - startTime,
        agentsUsed: ['ContentGenerator', 'ContentEvaluator'],
      },
    };
  } catch (error) {
    logger.error('Orchestrator: Execution failed', error as Error);
    return {
      success: false,
      results,
      metadata: {
        totalProcessingTime: Date.now() - startTime,
        agentsUsed: results.map(r => r.agent),
      },
    };
  }
}

/**
 * Orchestrate reputation analysis
 */
export async function orchestrateReputationAnalysis(
  context: AgentContext,
  input: ReputationAnalysisInput
): Promise<OrchestrationResult<ReputationAnalysisOutput>> {
  const startTime = Date.now();

  try {
    logger.info('Orchestrator: Starting reputation analysis', {
      clientId: context.clientId,
    });

    const analyzer = new ReputationAnalyzerAgent(context);
    const analysisResult = await analyzer.execute(input);

    return {
      success: analysisResult.success,
      results: [
        {
          agent: 'ReputationAnalyzer',
          success: analysisResult.success,
          data: analysisResult.data,
          error: analysisResult.error,
        },
      ],
      metadata: {
        totalProcessingTime: Date.now() - startTime,
        agentsUsed: ['ReputationAnalyzer'],
      },
    };
  } catch (error) {
    logger.error('Orchestrator: Reputation analysis failed', error as Error);
    return {
      success: false,
      results: [
        {
          agent: 'ReputationAnalyzer',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
      metadata: {
        totalProcessingTime: Date.now() - startTime,
        agentsUsed: ['ReputationAnalyzer'],
      },
    };
  }
}

/**
 * Create agent context from client/user data
 */
export function createAgentContext(
  clientId: string,
  clientName: string,
  userId?: string,
  metadata?: Record<string, unknown>
): AgentContext {
  return {
    clientId,
    clientName,
    userId,
    metadata,
  };
}

