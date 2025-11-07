'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import type { Alert } from '@/lib/types/domain';

interface AlertsListProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export function AlertsList({ alerts, isLoading }: AlertsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 rounded bg-muted/30"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: Info,
    low: Info,
  };

  const severityStyles: Record<Alert['severity'], { chip: string; badge: string }> = {
    critical: {
      chip: 'bg-destructive/20 text-destructive',
      badge: 'border-destructive/40 text-destructive',
    },
    high: {
      chip: 'bg-primary/15 text-primary',
      badge: 'border-primary/40 text-primary',
    },
    medium: {
      chip: 'bg-muted/40 text-muted-foreground',
      badge: 'border-muted-foreground/40 text-muted-foreground',
    },
    low: {
      chip: 'bg-muted/30 text-muted-foreground/90',
      badge: 'border-muted-foreground/30 text-muted-foreground/80',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-primary" />
            <p>No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity];
              const styles = severityStyles[alert.severity];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 border border-border/60 rounded-lg transition-colors hover:bg-muted/20"
                >
                  <div className={`p-2 rounded-full ${styles.chip}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant="outline" className={`${styles.badge} uppercase tracking-[0.08em]`}>{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="text-xs text-muted-foreground/80 mt-1">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

