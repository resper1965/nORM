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
              <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
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

  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className={`p-2 rounded-full ${severityColors[alert.severity]} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <div className="text-xs text-gray-500 mt-1">
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

