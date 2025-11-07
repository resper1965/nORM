'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReputationResponse } from '@/lib/types/api';

interface ReputationScoreCardProps {
  score: ReputationResponse | null;
  isLoading?: boolean;
}

export function ReputationScoreCard({ score, isLoading }: ReputationScoreCardProps) {
  if (isLoading || !score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reputation Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
        <div className="h-16 rounded bg-muted/30"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor =
    score.score >= 76 ? 'text-primary' :
    score.score >= 51 ? 'text-foreground/80' :
    'text-destructive';

  const TrendIcon = score.trend === 'up' ? TrendingUp :
                    score.trend === 'down' ? TrendingDown :
                    Minus;

  const trendColor = score.trend === 'up' ? 'text-primary' :
                     score.trend === 'down' ? 'text-destructive' :
                     'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reputation Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-6xl font-bold ${scoreColor}`}>
              {Math.round(score.score)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">out of 100</div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon className="w-5 h-5" />
              <span className="font-semibold">
                {score.change > 0 ? '+' : ''}{score.change.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">last 7 days</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="text-sm font-medium mb-2">Score Breakdown</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>SERP Position</span>
              <span className="font-medium">{score.breakdown.serp.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>News Sentiment</span>
              <span className="font-medium">{score.breakdown.news.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Social Sentiment</span>
              <span className="font-medium">{score.breakdown.social.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Trend</span>
              <span className="font-medium">{score.breakdown.trend.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Volume</span>
              <span className="font-medium">{score.breakdown.volume.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

