'use client';

import { Badge } from '@/components/ui/badge';
import type { Sentiment } from '@/lib/types/domain';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  score?: number;
  confidence?: number;
}

export function SentimentBadge({ sentiment, score, confidence }: SentimentBadgeProps) {
  const styles: Record<Sentiment, string> = {
    positive: 'bg-primary/15 text-primary border-primary/30',
    neutral: 'bg-muted/40 text-muted-foreground border-border/40',
    negative: 'bg-destructive/15 text-destructive border-destructive/30',
  };

  return (
    <Badge className={styles[sentiment]} variant="outline">
      {sentiment}
      {score !== undefined && (
        <span className="ml-1">
          ({score > 0 ? '+' : ''}{score.toFixed(2)})
        </span>
      )}
      {confidence !== undefined && confidence < 0.9 && (
        <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">low confidence</span>
      )}
    </Badge>
  );
}

