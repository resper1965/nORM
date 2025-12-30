"use client"

import { useState, useCallback } from 'react'
import { useChat, useCompletion } from 'ai/react'

/**
 * Hook para chat com IA usando streaming
 *
 * Example:
 * ```tsx
 * const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIChat()
 * ```
 */
export function useAIChat(options?: {
  initialMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  onFinish?: (message: string) => void
}) {
  return useChat({
    api: '/api/ai/chat',
    initialMessages: options?.initialMessages,
    onFinish: (message) => {
      options?.onFinish?.(message.content)
    },
  })
}

/**
 * Hook para geração de conteúdo com streaming
 *
 * Example:
 * ```tsx
 * const { content, generate, isLoading, error } = useContentGeneration()
 *
 * await generate({
 *   topic: 'SEO Tips',
 *   keywords: ['seo', 'optimization'],
 *   tone: 'professional',
 *   length: 'medium'
 * })
 * ```
 */
export function useContentGeneration() {
  const [error, setError] = useState<string | null>(null)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/generate-content-stream',
    onError: (err) => {
      setError(err.message)
    },
  })

  const generate = useCallback(
    async (params: {
      topic: string
      keywords: string[]
      tone?: 'professional' | 'casual' | 'technical'
      length?: 'short' | 'medium' | 'long'
    }) => {
      setError(null)

      try {
        await complete('', {
          body: params,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate content')
        throw err
      }
    },
    [complete]
  )

  return {
    content: completion,
    generate,
    isLoading,
    error,
  }
}

/**
 * Hook genérico para qualquer chamada de IA com streaming
 */
export function useAIStream(endpoint: string) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (body: any) => {
      setContent('')
      setError(null)
      setIsLoading(true)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          const chunk = decoder.decode(value)
          accumulated += chunk
          setContent(accumulated)
        }

        return accumulated

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Stream failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint]
  )

  const reset = useCallback(() => {
    setContent('')
    setError(null)
  }, [])

  return {
    content,
    generate,
    isLoading,
    error,
    reset,
  }
}
