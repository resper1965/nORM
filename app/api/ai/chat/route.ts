import { OpenAIStream, StreamingTextResponse } from 'ai'
import { OpenAI } from 'openai'
import { NextRequest } from 'next/server'
import { callAIGateway } from '@/lib/ai/gateway'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * POST /api/ai/chat
 *
 * Streaming chat endpoint usando Vercel AI SDK
 *
 * Request body:
 * {
 *   messages: [{ role: 'user' | 'system' | 'assistant', content: string }],
 *   model?: 'gpt-4' | 'gpt-3.5-turbo',
 *   temperature?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'gpt-4', temperature = 0.7 } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages are required', { status: 400 })
    }

    // Create streaming response
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      stream: true,
    })

    // Convert to Vercel AI SDK stream
    const stream = OpenAIStream(response)

    // Return streaming response
    return new StreamingTextResponse(stream, {
      headers: {
        'X-Model-Used': model,
        'X-Stream-Type': 'openai',
      },
    })

  } catch (error) {
    logger.error('AI chat streaming error', { error })

    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
