'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

interface NotificationPreferences {
  email_enabled: boolean;
  email_address?: string;
  email_frequency: 'instant' | 'daily' | 'weekly';
  alert_types: {
    serp_drop: boolean;
    negative_mention: boolean;
    reputation_drop: boolean;
    crisis_detected: boolean;
  };
  severity_threshold: 'low' | 'medium' | 'high' | 'critical';
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export default function NotificationSettingsPage() {
  const t = useTranslations('settings');

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    email_address: '',
    email_frequency: 'instant',
    alert_types: {
      serp_drop: true,
      negative_mention: true,
      reputation_drop: true,
      crisis_detected: true,
    },
    severity_threshold: 'medium',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const response = await fetch('/api/user/notification-preferences');

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      setSuccessMessage('Notification preferences saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  }

  function updateAlertType(type: keyof NotificationPreferences['alert_types'], enabled: boolean) {
    setPreferences({
      ...preferences,
      alert_types: {
        ...preferences.alert_types,
        [type]: enabled,
      },
    });
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

  return (
    <div className="container mx-auto py-10 space-y-8">
      {successMessage && (
        <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how and when you receive reputation alerts
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Configure email alert delivery preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email_enabled" className="text-base">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive alerts via email when important events occur
              </p>
            </div>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, email_enabled: checked })
              }
            />
          </div>

          {preferences.email_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email_address">Email Address</Label>
                <Input
                  id="email_address"
                  type="email"
                  placeholder="your@email.com"
                  value={preferences.email_address || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, email_address: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use your account email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_frequency">Email Frequency</Label>
                <Select
                  value={preferences.email_frequency}
                  onValueChange={(value: 'instant' | 'daily' | 'weekly') =>
                    setPreferences({ ...preferences, email_frequency: value })
                  }
                >
                  <SelectTrigger id="email_frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant (as they happen)</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Alert Types</CardTitle>
          </div>
          <CardDescription>Choose which types of alerts you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="serp_drop" className="text-base">SERP Position Drops</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Get notified when your SERP rankings drop
              </p>
            </div>
            <Switch
              id="serp_drop"
              checked={preferences.alert_types.serp_drop}
              onCheckedChange={(checked) => updateAlertType('serp_drop', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="negative_mention" className="text-base">Negative Mentions</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Alert when negative content is detected about your brand
              </p>
            </div>
            <Switch
              id="negative_mention"
              checked={preferences.alert_types.negative_mention}
              onCheckedChange={(checked) => updateAlertType('negative_mention', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reputation_drop" className="text-base">Reputation Score Drops</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Notify when overall reputation score decreases
              </p>
            </div>
            <Switch
              id="reputation_drop"
              checked={preferences.alert_types.reputation_drop}
              onCheckedChange={(checked) => updateAlertType('reputation_drop', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="crisis_detected" className="text-base">Crisis Detection</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Immediate alerts for critical reputation threats
              </p>
            </div>
            <Switch
              id="crisis_detected"
              checked={preferences.alert_types.crisis_detected}
              onCheckedChange={(checked) => updateAlertType('crisis_detected', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Severity Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Threshold</CardTitle>
          <CardDescription>
            Only receive alerts at or above this severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.severity_threshold}
            onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
              setPreferences({ ...preferences, severity_threshold: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (all alerts)</SelectItem>
              <SelectItem value="medium">Medium and above</SelectItem>
              <SelectItem value="high">High and above</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Pause non-critical notifications during specific hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="quiet_hours_enabled" className="text-base">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Critical alerts will still be delivered
              </p>
            </div>
            <Switch
              id="quiet_hours_enabled"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, quiet_hours_enabled: checked })
              }
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_hours_start">Start Time</Label>
                <Input
                  id="quiet_hours_start"
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_start: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet_hours_end">End Time</Label>
                <Input
                  id="quiet_hours_end"
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_end: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
