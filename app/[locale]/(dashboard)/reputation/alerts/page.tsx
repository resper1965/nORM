'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Filter } from 'lucide-react';

interface Alert {
  id: string;
  client_id: string;
  type: 'serp_drop' | 'negative_mention' | 'reputation_drop' | 'crisis_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
  metadata: Record<string, any>;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

const severityConfig = {
  low: { color: 'bg-blue-100 text-blue-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
};

const statusConfig = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending', icon: Clock },
  acknowledged: { color: 'bg-blue-100 text-blue-800', label: 'Acknowledged', icon: AlertTriangle },
  resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved', icon: CheckCircle2 },
  dismissed: { color: 'bg-gray-100 text-gray-600', label: 'Dismissed', icon: CheckCircle2 },
};

const typeLabels = {
  serp_drop: 'SERP Position Drop',
  negative_mention: 'Negative Mention',
  reputation_drop: 'Reputation Score Drop',
  crisis_detected: 'Crisis Detected',
};

export default function AlertsPage() {
  const t = useTranslations('alerts');
  const searchParams = useSearchParams();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, [filterSeverity, filterStatus, filterType]);

  async function loadAlerts() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filterSeverity !== 'all') params.set('severity', filterSeverity);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterType !== 'all') params.set('type', filterType);

      const response = await fetch(`/api/alerts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load alerts');

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      alert('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsResolved(alertId: string) {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (!response.ok) throw new Error('Failed to update alert');

      loadAlerts();
    } catch (error) {
      console.error('Failed to mark alert as resolved:', error);
      alert('Failed to update alert');
    }
  }

  async function handleDismiss(alertId: string) {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      });

      if (!response.ok) throw new Error('Failed to update alert');

      loadAlerts();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      alert('Failed to update alert');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredAlerts = alerts;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reputation Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage reputation alerts across all clients
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="serp_drop">SERP Drop</SelectItem>
                  <SelectItem value="negative_mention">Negative Mention</SelectItem>
                  <SelectItem value="reputation_drop">Reputation Drop</SelectItem>
                  <SelectItem value="crisis_detected">Crisis Detected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">
                No alerts found. Your reputation is looking good!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon;

            return (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={severityConfig[alert.severity].color}>
                          {severityConfig[alert.severity].label}
                        </Badge>
                        <Badge variant="outline">{typeLabels[alert.type]}</Badge>
                        <Badge className={statusConfig[alert.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[alert.status].label}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{alert.title}</CardTitle>
                      <CardDescription className="mt-1">{alert.message}</CardDescription>
                    </div>

                    {alert.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsResolved(alert.id)}
                        >
                          Mark as Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Created: {new Date(alert.created_at).toLocaleString()}
                    </p>

                    {alert.metadata?.url && (
                      <a
                        href={alert.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View related content
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {alert.metadata?.position_change && (
                      <p className="font-medium text-orange-600">
                        Position change: {alert.metadata.position_change > 0 ? '+' : ''}
                        {alert.metadata.position_change}
                      </p>
                    )}

                    {alert.metadata?.score_change && (
                      <p className="font-medium text-orange-600">
                        Score change: {alert.metadata.score_change > 0 ? '+' : ''}
                        {alert.metadata.score_change}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
