/**
 * Base AI Agent
 * Abstract base class for all AI agents in the nORM system
 */

import { callOpenAI, getModel } from '../openai';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

export interface AgentContext {
  clientId: string;
  clientName: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

export abstract class BaseAgent<TInput = unknown, TOutput = unknown> {
  protected context: AgentContext;
  protected agentName: string;

  constructor(context: AgentContext, agentName: string) {
    this.context = context;
    this.agentName = agentName;
  }

  /**
   * Execute the agent's main task
   */
  abstract execute(input: TInput): Promise<AgentResponse<TOutput>>;

  /**
   * Call OpenAI with agent-specific configuration
   */
  protected async callAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json_object';
    }
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const response = await callOpenAI(async () => {
        const openai = await import('../openai').then(m => m.openai);
        if (!openai) throw new Error('OpenAI not configured');

        return openai.chat.completions.create({
          model: options?.model || getModel('content'),
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens,
          response_format: options?.responseFormat === 'json_object' 
            ? { type: 'json_object' }
            : undefined,
        });
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;

      logger.info(`Agent ${this.agentName} completed`, {
        clientId: this.context.clientId,
        processingTime,
        tokensUsed,
        model: response.model,
      });

      return content;
    } catch (error) {
      logger.error(`Agent ${this.agentName} failed`, error as Error);
      throw new ExternalAPIError('OpenAI', `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`, error as Error);
    }
  }

  /**
   * Get system prompt for this agent
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Validate agent input
   */
  protected validateInput(input: TInput): boolean {
    return input !== null && input !== undefined;
  }
}

