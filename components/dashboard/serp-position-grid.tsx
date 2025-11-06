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
              <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionColor = (position: number | null) => {
    if (position === null) return 'bg-gray-500';
    if (position <= 3) return 'bg-green-500';
    if (position <= 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Positions</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No SERP data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPositionColor(result.position)}>
                      {result.position || 'N/A'}
                    </Badge>
                    <span className="font-medium">{result.keyword}</span>
                  </div>
                  {result.title && (
                    <div className="text-sm text-gray-600 truncate">
                      {result.title}
                    </div>
                  )}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
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

