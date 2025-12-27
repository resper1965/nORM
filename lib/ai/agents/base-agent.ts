/**
 * Base AI Agent
 * Abstract base class for all AI agents in the nORM system
 * Uses Google Gemini Pro for AI operations
 */

import { generateWithGemini, callGemini, GEMINI_MODELS } from '../gemini';
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
   * Call Gemini with agent-specific configuration
   */
  protected async callAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: 'pro' | 'flash';
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json_object';
    }
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // Combine messages into a single prompt for Gemini
      // Gemini doesn't have separate system/user roles like OpenAI
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

      let prompt = '';
      if (systemMessage) {
        prompt += `${systemMessage.content}\n\n`;
      }
      prompt += userMessages.map(m => m.content).join('\n\n');

      // Add JSON instruction if needed
      if (options?.responseFormat === 'json_object') {
        prompt += '\n\nRetorne sua resposta como um objeto JSON válido, sem formatação markdown.';
      }

      const content = await callGemini(async () => {
        return await generateWithGemini(prompt, {
          model: options?.model || 'pro',
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens,
        });
      });

      const processingTime = Date.now() - startTime;

      logger.info(`Agent ${this.agentName} completed`, {
        clientId: this.context.clientId,
        processingTime,
        model: GEMINI_MODELS[options?.model || 'pro'],
      });

      return content;
    } catch (error) {
      logger.error(`Agent ${this.agentName} failed`, error as Error);
      throw new ExternalAPIError('Gemini', `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`, error as Error);
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

