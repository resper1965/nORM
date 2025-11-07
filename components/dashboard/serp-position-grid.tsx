'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { SERPResponse } from '@/lib/types/api';

interface SERPPositionGridProps {
  results: SERPResponse['results'];
  isLoading?: boolean;
}

export function SERPPositionGrid({ results, isLoading }: SERPPositionGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SERP Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-12 rounded bg-muted/30"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionClasses = (position: number | null) => {
    if (position === null) return 'bg-muted/40 text-muted-foreground/80 border border-transparent';
    if (position <= 3) return 'bg-primary/15 text-primary border border-primary/30';
    if (position <= 10) return 'bg-muted/30 text-muted-foreground border border-muted-foreground/20';
    return 'bg-destructive/15 text-destructive border border-destructive/30';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Positions</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No SERP data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border/60 rounded-lg bg-card/40"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPositionClasses(result.position)}>
                      {result.position || 'N/A'}
                    </Badge>
                    <span className="font-medium">{result.keyword}</span>
                  </div>
                  {result.title && (
                    <div className="text-sm text-muted-foreground truncate">
                      {result.title}
                    </div>
                  )}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      {result.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

