'use client';

import { Badge } from '@/components/ui/badge';
import type { Sentiment } from '@/lib/types/domain';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  score?: number;
  confidence?: number;
}

export function SentimentBadge({ sentiment, score, confidence }: SentimentBadgeProps) {
  const colors = {
    positive: 'bg-green-100 text-green-800 border-green-300',
    neutral: 'bg-gray-100 text-gray-800 border-gray-300',
    negative: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <Badge className={colors[sentiment]} variant="outline">
      {sentiment}
      {score !== undefined && (
        <span className="ml-1">
          ({score > 0 ? '+' : ''}{score.toFixed(2)})
        </span>
      )}
      {confidence !== undefined && confidence < 0.9 && (
        <span className="ml-1 text-xs opacity-75">⚠️</span>
      )}
    </Badge>
  );
}

