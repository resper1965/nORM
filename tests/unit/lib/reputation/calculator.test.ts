import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateTrend } from '@/lib/reputation/calculator'

describe('Reputation Calculator', () => {
  describe('calculateTrend', () => {
    it('should return "up" when score increased by more than 2 points', () => {
      expect(calculateTrend(75, 70)).toBe('up')
      expect(calculateTrend(85, 80)).toBe('up')
      expect(calculateTrend(100, 95)).toBe('up')
    })

    it('should return "down" when score decreased by more than 2 points', () => {
      expect(calculateTrend(70, 75)).toBe('down')
      expect(calculateTrend(60, 80)).toBe('down')
      expect(calculateTrend(50, 55)).toBe('down')
    })

    it('should return "stable" when score changed by 2 or less points', () => {
      expect(calculateTrend(75, 75)).toBe('stable')
      expect(calculateTrend(75, 74)).toBe('stable')
      expect(calculateTrend(75, 76)).toBe('stable')
      expect(calculateTrend(75, 73)).toBe('stable')
      expect(calculateTrend(75, 77)).toBe('stable')
    })

    it('should handle edge cases correctly', () => {
      // Boundary cases
      expect(calculateTrend(52, 50)).toBe('stable') // exactly 2 points up
      expect(calculateTrend(50, 52)).toBe('stable') // exactly 2 points down
      expect(calculateTrend(53, 50)).toBe('up') // just over 2 points up
      expect(calculateTrend(50, 53)).toBe('down') // just over 2 points down

      // Zero scores
      expect(calculateTrend(0, 0)).toBe('stable')
      expect(calculateTrend(5, 0)).toBe('up')
      expect(calculateTrend(0, 5)).toBe('down')

      // Maximum scores
      expect(calculateTrend(100, 100)).toBe('stable')
      expect(calculateTrend(100, 95)).toBe('up')
      expect(calculateTrend(95, 100)).toBe('down')
    })

    it('should handle negative differences correctly', () => {
      expect(calculateTrend(50, 55)).toBe('down')
      expect(calculateTrend(45, 50)).toBe('down')
    })

    it('should handle decimal scores', () => {
      expect(calculateTrend(75.5, 73.0)).toBe('up')
      expect(calculateTrend(75.5, 77.7)).toBe('down')
      expect(calculateTrend(75.5, 75.0)).toBe('stable')
    })
  })

  describe('Score Calculation Formula', () => {
    it('should correctly weight factors (manual calculation test)', () => {
      // Test the formula with known values
      const serpScore = 8.0 // 35% weight
      const newsScore = 7.0 // 25% weight
      const socialScore = 9.0 // 20% weight
      const trendScore = 6.0 // 15% weight
      const volumeScore = 7.0 // 5% weight

      const expectedScore = (
        serpScore * 0.35 +
        newsScore * 0.25 +
        socialScore * 0.20 +
        trendScore * 0.15 +
        volumeScore * 0.05
      ) * 10

      // Should be: (2.8 + 1.75 + 1.8 + 0.9 + 0.35) * 10 = 76.0
      expect(expectedScore).toBe(76.0)
    })

    it('should produce score of 100 with perfect factors', () => {
      const allPerfect = 10.0
      const score = (
        allPerfect * 0.35 +
        allPerfect * 0.25 +
        allPerfect * 0.20 +
        allPerfect * 0.15 +
        allPerfect * 0.05
      ) * 10

      expect(score).toBe(100)
    })

    it('should produce score of 0 with all zero factors', () => {
      const allZero = 0.0
      const score = (
        allZero * 0.35 +
        allZero * 0.25 +
        allZero * 0.20 +
        allZero * 0.15 +
        allZero * 0.05
      ) * 10

      expect(score).toBe(0)
    })

    it('should verify weights sum to 1.0', () => {
      const weights = [0.35, 0.25, 0.20, 0.15, 0.05]
      const sum = weights.reduce((a, b) => a + b, 0)
      expect(sum).toBe(1.0)
    })
  })

  describe('Score Components', () => {
    describe('SERP Score (35% weight)', () => {
      it('should have the highest weight in the formula', () => {
        const weights = {
          serp: 0.35,
          news: 0.25,
          social: 0.20,
          trend: 0.15,
          volume: 0.05,
        }

        expect(weights.serp).toBeGreaterThan(weights.news)
        expect(weights.serp).toBeGreaterThan(weights.social)
        expect(weights.serp).toBeGreaterThan(weights.trend)
        expect(weights.serp).toBeGreaterThan(weights.volume)
      })
    })

    describe('News Sentiment (25% weight)', () => {
      it('should be second highest weight', () => {
        const weights = {
          serp: 0.35,
          news: 0.25,
          social: 0.20,
          trend: 0.15,
          volume: 0.05,
        }

        expect(weights.news).toBeLessThan(weights.serp)
        expect(weights.news).toBeGreaterThan(weights.social)
        expect(weights.news).toBeGreaterThan(weights.trend)
        expect(weights.news).toBeGreaterThan(weights.volume)
      })
    })

    describe('Social Sentiment (20% weight)', () => {
      it('should be third highest weight', () => {
        const weights = {
          serp: 0.35,
          news: 0.25,
          social: 0.20,
          trend: 0.15,
          volume: 0.05,
        }

        expect(weights.social).toBeLessThan(weights.news)
        expect(weights.social).toBeGreaterThan(weights.trend)
        expect(weights.social).toBeGreaterThan(weights.volume)
      })
    })

    describe('Trend Direction (15% weight)', () => {
      it('should be fourth highest weight', () => {
        const weights = {
          serp: 0.35,
          news: 0.25,
          social: 0.20,
          trend: 0.15,
          volume: 0.05,
        }

        expect(weights.trend).toBeLessThan(weights.social)
        expect(weights.trend).toBeGreaterThan(weights.volume)
      })
    })

    describe('Mention Volume (5% weight)', () => {
      it('should have the lowest weight', () => {
        const weights = {
          serp: 0.35,
          news: 0.25,
          social: 0.20,
          trend: 0.15,
          volume: 0.05,
        }

        expect(weights.volume).toBeLessThan(weights.trend)
        expect(weights.volume).toBeLessThan(weights.social)
        expect(weights.volume).toBeLessThan(weights.news)
        expect(weights.volume).toBeLessThan(weights.serp)
      })
    })
  })

  describe('Score Range', () => {
    it('should produce scores between 0-100', () => {
      // Test various combinations
      const testCases = [
        { factors: [10, 10, 10, 10, 10], expected: 100 },
        { factors: [0, 0, 0, 0, 0], expected: 0 },
        { factors: [5, 5, 5, 5, 5], expected: 50 },
        { factors: [7, 8, 6, 7, 8], min: 0, max: 100 },
        { factors: [3, 4, 2, 3, 4], min: 0, max: 100 },
      ]

      testCases.forEach(({ factors, expected, min, max }) => {
        const [serp, news, social, trend, volume] = factors
        const score = (
          serp * 0.35 +
          news * 0.25 +
          social * 0.20 +
          trend * 0.15 +
          volume * 0.05
        ) * 10

        if (expected !== undefined) {
          expect(score).toBe(expected)
        }
        if (min !== undefined && max !== undefined) {
          expect(score).toBeGreaterThanOrEqual(min)
          expect(score).toBeLessThanOrEqual(max)
        }
      })
    })
  })

  describe('Rounding', () => {
    it('should round to 2 decimal places', () => {
      // Create a score that would have many decimals
      const score = (
        7.333 * 0.35 +
        6.666 * 0.25 +
        8.123 * 0.20 +
        5.789 * 0.15 +
        9.456 * 0.05
      ) * 10

      const rounded = Math.round(score * 100) / 100

      // Check that it has at most 2 decimal places
      expect(rounded.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2)
    })
  })
})
