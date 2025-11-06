/**
 * Trend Analyzer
 * Analyzes reputation trends over time
 */

import type { ReputationScore } from '@/lib/types/domain';

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: number; // days
  dataPoints: number;
}

/**
 * Analyze reputation trend
 * @param scores Historical reputation scores (ordered by date, newest first)
 * @param periodDays Number of days to analyze
 */
export function analyzeTrend(
  scores: ReputationScore[],
  periodDays: number = 30
): TrendAnalysis {
  if (scores.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      period: periodDays,
      dataPoints: scores.length,
    };
  }

  // Get scores within period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  
  const recentScores = scores
    .filter((score) => new Date(score.calculated_at) >= cutoffDate)
    .sort((a, b) => 
      new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime()
    );

  if (recentScores.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      period: periodDays,
      dataPoints: recentScores.length,
    };
  }

  const firstScore = recentScores[0].score;
  const lastScore = recentScores[recentScores.length - 1].score;
  const change = lastScore - firstScore;

  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (change > 2) {
    direction = 'up';
  } else if (change < -2) {
    direction = 'down';
  }

  return {
    direction,
    change: Math.round(change * 100) / 100,
    period: periodDays,
    dataPoints: recentScores.length,
  };
}

