/**
 * AI Gateway
 *
 * Camada de abstração para chamadas de IA com:
 * - Cache inteligente de respostas
 * - Rate limiting
 * - Fallback automático entre modelos
 * - Cost tracking integrado
 * - Retry com exponential backoff
 * - Streaming support
 */

import { OpenAI } from 'openai'
import { trackOpenAICost } from '@/lib/monitoring/cost-tracker'
import { performanceMonitor } from '@/lib/utils/performance'
import { logger } from '@/lib/utils/logger'
import { TTLCache } from '@/lib/utils/performance'

// Types
export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'

export interface AIGatewayConfig {
  model: AIModel
  temperature?: number
  maxTokens?: number
  useCache?: boolean
  cacheTTL?: number // milliseconds
  enableFallback?: boolean
  retries?: number
}

export interface AIResponse {
  content: string
  model: AIModel
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cached: boolean
  cost: number
}

// Singleton OpenAI instance
let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

// Cache para respostas (1 hora TTL por padrão)
const responseCache = new TTLCache<string, AIResponse>(60 * 60 * 1000)

// Rate limiter simples (em memória)
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove requests fora da janela
    const validRequests = requests.filter(time => now - time < windowMs)

    if (validRequests.length >= limit) {
      return false
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}

const rateLimiter = new RateLimiter()

// Model costs per 1K tokens
const MODEL_COSTS = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
}

// Fallback chain
const FALLBACK_CHAIN: Record<AIModel, AIModel | null> = {
  'gpt-4': 'gpt-4-turbo',
  'gpt-4-turbo': 'gpt-3.5-turbo',
  'gpt-3.5-turbo': null,
}

/**
 * Generate cache key for request
 */
function generateCacheKey(
  messages: any[],
  config: AIGatewayConfig
): string {
  const content = JSON.stringify(messages)
  const configStr = JSON.stringify({
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  })

  // Simple hash function
  let hash = 0
  const str = content + configStr
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return `ai:${Math.abs(hash).toString(36)}`
}

/**
 * Calculate cost based on tokens and model
 */
function calculateCost(
  model: AIModel,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = MODEL_COSTS[model]
  return (
    (promptTokens / 1000) * costs.input +
    (completionTokens / 1000) * costs.output
  )
}

/**
 * AI Gateway - Main function
 */
export async function callAIGateway(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIGatewayConfig = { model: 'gpt-4' }
): Promise<AIResponse> {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 2000,
    useCache = true,
    cacheTTL = 60 * 60 * 1000,
    enableFallback = true,
    retries = 3,
  } = config

  // Check cache
  if (useCache) {
    const cacheKey = generateCacheKey(messages, config)
    const cached = responseCache.get(cacheKey)
    if (cached) {
      logger.info('AI Gateway cache hit', { model, cacheKey })
      return { ...cached, cached: true }
    }
  }

  // Rate limiting (100 requests per hour)
  const rateLimitKey = `ai:${model}`
  const canProceed = await rateLimiter.checkLimit(
    rateLimitKey,
    parseInt(process.env.MAX_OPENAI_REQUESTS_PER_HOUR || '100'),
    60 * 60 * 1000
  )

  if (!canProceed) {
    logger.warn('AI Gateway rate limit exceeded', { model })
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  // Call with retry and fallback
  return performanceMonitor.track(
    `ai-gateway-${model}`,
    async () => {
      let currentModel = model
      let lastError: Error | null = null

      while (currentModel) {
        try {
          const result = await callOpenAIWithRetry(
            messages,
            currentModel,
            temperature,
            maxTokens,
            retries
          )

          // Cache result
          if (useCache) {
            const cacheKey = generateCacheKey(messages, config)
            responseCache.set(cacheKey, result)
          }

          // Track cost
          await trackOpenAICost(
            currentModel === 'gpt-3.5-turbo' ? 'gpt-3.5-turbo' : 'gpt-4',
            result.usage.promptTokens,
            result.usage.completionTokens,
            { messages: messages.length }
          )

          logger.info('AI Gateway success', {
            model: currentModel,
            tokens: result.usage.totalTokens,
            cost: result.cost,
          })

          return result

        } catch (error) {
          lastError = error as Error
          logger.error(`AI Gateway error with ${currentModel}`, { error })

          // Try fallback
          if (enableFallback && FALLBACK_CHAIN[currentModel]) {
            currentModel = FALLBACK_CHAIN[currentModel]!
            logger.info('AI Gateway fallback', { from: model, to: currentModel })
            continue
          }

          throw error
        }
      }

      throw lastError || new Error('All AI models failed')
    },
    { model, messagesCount: messages.length }
  )
}

/**
 * Call OpenAI with retry logic
 */
async function callOpenAIWithRetry(
  messages: any[],
  model: AIModel,
  temperature: number,
  maxTokens: number,
  retries: number
): Promise<AIResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const openai = getOpenAI()

      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      })

      const choice = response.choices[0]
      if (!choice || !choice.message) {
        throw new Error('No response from OpenAI')
      }

      const usage = response.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      }

      const cost = calculateCost(
        model,
        usage.prompt_tokens,
        usage.completion_tokens
      )

      return {
        content: choice.message.content || '',
        model,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cached: false,
        cost,
      }

    } catch (error) {
      lastError = error as Error

      // Don't retry on certain errors
      if (
        error instanceof Error &&
        (error.message.includes('invalid_request_error') ||
          error.message.includes('insufficient_quota'))
      ) {
        throw error
      }

      // Exponential backoff
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        logger.warn(`AI Gateway retry ${attempt + 1}/${retries}`, {
          model,
          delay,
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('OpenAI call failed after retries')
}

/**
 * Stream AI response (para UI em tempo real)
 */
export async function streamAIGateway(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIGatewayConfig = { model: 'gpt-4' },
  onChunk: (chunk: string) => void
): Promise<AIResponse> {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 2000,
  } = config

  const openai = getOpenAI()
  let fullContent = ''
  let promptTokens = 0
  let completionTokens = 0

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      fullContent += content
      onChunk(content)
    }
  }

  // Estimate tokens (rough approximation)
  promptTokens = Math.ceil(JSON.stringify(messages).length / 4)
  completionTokens = Math.ceil(fullContent.length / 4)

  const cost = calculateCost(model, promptTokens, completionTokens)

  // Track cost
  await trackOpenAICost(
    model === 'gpt-3.5-turbo' ? 'gpt-3.5-turbo' : 'gpt-4',
    promptTokens,
    completionTokens,
    { streaming: true }
  )

  return {
    content: fullContent,
    model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    cached: false,
    cost,
  }
}

/**
 * Clear cache
 */
export function clearAICache() {
  responseCache.clear()
  logger.info('AI Gateway cache cleared')
}
