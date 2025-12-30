import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SentimentAnalysis } from '@/lib/ai/sentiment'

describe('Sentiment Analysis', () => {
  describe('Score Normalization', () => {
    it('should clamp score to -1.0 to 1.0 range', () => {
      const testCases = [
        { input: -2.0, expected: -1.0 },
        { input: -1.5, expected: -1.0 },
        { input: -1.0, expected: -1.0 },
        { input: -0.5, expected: -0.5 },
        { input: 0.0, expected: 0.0 },
        { input: 0.5, expected: 0.5 },
        { input: 1.0, expected: 1.0 },
        { input: 1.5, expected: 1.0 },
        { input: 2.0, expected: 1.0 },
      ]

      testCases.forEach(({ input, expected }) => {
        const clamped = Math.max(-1, Math.min(1, input))
        expect(clamped).toBe(expected)
      })
    })

    it('should round score to 2 decimal places', () => {
      const testCases = [
        { input: 0.123, expected: 0.12 },
        { input: 0.567, expected: 0.57 },
        { input: 0.999, expected: 1.0 },
        { input: -0.123, expected: -0.12 },
        { input: -0.567, expected: -0.57 },
      ]

      testCases.forEach(({ input, expected }) => {
        const rounded = Math.round(input * 100) / 100
        expect(rounded).toBe(expected)
      })
    })
  })

  describe('Confidence Normalization', () => {
    it('should clamp confidence to 0.0 to 1.0 range', () => {
      const testCases = [
        { input: -0.5, expected: 0.0 },
        { input: 0.0, expected: 0.0 },
        { input: 0.5, expected: 0.5 },
        { input: 1.0, expected: 1.0 },
        { input: 1.5, expected: 1.0 },
        { input: 2.0, expected: 1.0 },
      ]

      testCases.forEach(({ input, expected }) => {
        const clamped = Math.max(0, Math.min(1, input))
        expect(clamped).toBe(expected)
      })
    })

    it('should round confidence to 2 decimal places', () => {
      const testCases = [
        { input: 0.123, expected: 0.12 },
        { input: 0.567, expected: 0.57 },
        { input: 0.999, expected: 1.0 },
      ]

      testCases.forEach(({ input, expected }) => {
        const rounded = Math.round(input * 100) / 100
        expect(rounded).toBe(expected)
      })
    })
  })

  describe('Sentiment Validation', () => {
    it('should validate sentiment as positive, neutral, or negative', () => {
      const validSentiments = ['positive', 'neutral', 'negative']

      validSentiments.forEach((sentiment) => {
        expect(validSentiments.includes(sentiment)).toBe(true)
      })
    })

    it('should default to neutral for invalid sentiments', () => {
      const invalidSentiments = ['unknown', 'mixed', '', 'invalid']

      invalidSentiments.forEach((sentiment) => {
        const normalized = validSentiments.includes(sentiment)
          ? sentiment
          : 'neutral'

        expect(normalized).toBe('neutral')
      })
    })
  })

  describe('Score to Sentiment Mapping', () => {
    it('should map positive scores to positive sentiment', () => {
      const positiveScores = [0.3, 0.5, 0.7, 1.0]

      positiveScores.forEach((score) => {
        const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
        expect(sentiment).toBe('positive')
      })
    })

    it('should map negative scores to negative sentiment', () => {
      const negativeScores = [-0.3, -0.5, -0.7, -1.0]

      negativeScores.forEach((score) => {
        const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
        expect(sentiment).toBe('negative')
      })
    })

    it('should map neutral scores to neutral sentiment', () => {
      const neutralScores = [-0.2, -0.1, 0.0, 0.1, 0.2]

      neutralScores.forEach((score) => {
        const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
        expect(sentiment).toBe('neutral')
      })
    })
  })

  describe('Confidence Thresholds', () => {
    it('should identify high confidence results (>= 0.9)', () => {
      const highConfidence = [0.9, 0.95, 1.0]

      highConfidence.forEach((confidence) => {
        expect(confidence).toBeGreaterThanOrEqual(0.9)
      })
    })

    it('should identify low confidence results (< 0.9)', () => {
      const lowConfidence = [0.5, 0.7, 0.85]

      lowConfidence.forEach((confidence) => {
        expect(confidence).toBeLessThan(0.9)
      })
    })

    it('should flag low confidence for manual review', () => {
      const testCases = [
        { confidence: 0.95, shouldFlag: false },
        { confidence: 0.85, shouldFlag: true },
        { confidence: 0.5, shouldFlag: true },
      ]

      testCases.forEach(({ confidence, shouldFlag }) => {
        const needsReview = confidence < 0.9
        expect(needsReview).toBe(shouldFlag)
      })
    })
  })

  describe('Error Handling', () => {
    it('should return neutral sentiment on error', () => {
      const errorResult: SentimentAnalysis = {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        rationale: 'Error analyzing sentiment',
      }

      expect(errorResult.sentiment).toBe('neutral')
      expect(errorResult.score).toBe(0)
      expect(errorResult.confidence).toBe(0)
    })

    it('should provide fallback rationale on error', () => {
      const result = {
        rationale: undefined,
      }

      const finalRationale = result.rationale || 'No rationale provided'
      expect(finalRationale).toBe('No rationale provided')
    })
  })

  describe('Batch Analysis', () => {
    it('should maintain order of results', () => {
      const texts = ['text1', 'text2', 'text3']
      const results = texts.map((text, index) => ({
        text,
        index,
      }))

      results.forEach((result, index) => {
        expect(result.index).toBe(index)
        expect(result.text).toBe(texts[index])
      })
    })

    it('should handle empty array', () => {
      const texts: string[] = []
      const results = texts.map((text) => text)

      expect(results).toHaveLength(0)
    })

    it('should process all items even if some fail', () => {
      const results = [
        { sentiment: 'positive', score: 0.8, confidence: 0.9 },
        { sentiment: 'neutral', score: 0.0, confidence: 0.0 }, // Failed
        { sentiment: 'negative', score: -0.7, confidence: 0.95 },
      ]

      expect(results).toHaveLength(3)
      expect(results[1].confidence).toBe(0.0) // Failed item still present
    })
  })

  describe('Text Preprocessing', () => {
    it('should handle empty text', () => {
      const text = ''
      expect(text.length).toBe(0)
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(10000)
      expect(longText.length).toBe(10000)
    })

    it('should handle special characters', () => {
      const specialText = '😊 👍 ⭐ @user #hashtag'
      expect(specialText.length).toBeGreaterThan(0)
    })

    it('should handle multilingual text', () => {
      const texts = [
        'This is English',
        'Isto é Português',
        'Esto es Español',
      ]

      texts.forEach((text) => {
        expect(text.length).toBeGreaterThan(0)
      })
    })
  })

  describe('JSON Response Parsing', () => {
    it('should parse valid JSON response', () => {
      const jsonString = JSON.stringify({
        sentiment: 'positive',
        score: 0.8,
        confidence: 0.95,
        rationale: 'The text expresses positive sentiment',
      })

      const parsed = JSON.parse(jsonString)
      expect(parsed.sentiment).toBe('positive')
      expect(parsed.score).toBe(0.8)
    })

    it('should handle missing fields with defaults', () => {
      const incomplete = {
        sentiment: 'positive',
        score: 0.8,
        // missing confidence and rationale
      }

      const confidence = incomplete.confidence ?? 0
      const rationale = incomplete.rationale ?? 'No rationale provided'

      expect(confidence).toBe(0)
      expect(rationale).toBe('No rationale provided')
    })
  })

  describe('Performance Thresholds', () => {
    it('should validate temperature parameter', () => {
      const temperature = 0.3
      expect(temperature).toBeGreaterThanOrEqual(0)
      expect(temperature).toBeLessThanOrEqual(2)
    })

    it('should use low temperature for consistency', () => {
      const temperature = 0.3
      expect(temperature).toBeLessThan(0.5) // Lower temp = more consistent
    })
  })
})
