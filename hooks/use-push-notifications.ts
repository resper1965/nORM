'use client';

import { useEffect, useCallback } from 'react';
import {
  sendAlertNotification,
  areNotificationsGranted,
} from '@/lib/notifications/push';
import type { Alert } from '@/lib/types/domain';

/**
 * Hook to handle push notifications for alerts
 */
export function usePushNotifications() {
  const sendAlertPush = useCallback(async (alert: Alert, clientName?: string) => {
    if (!areNotificationsGranted()) {
      return;
    }

    await sendAlertNotification({
      title: alert.title,
      message: alert.message || alert.title,
      severity: alert.severity,
      url: `/clients/${alert.client_id}`,
    });
  }, []);

  return { sendAlertPush };
}

/**
 * Hook to watch for new alerts and send push notifications
 */
export function useAlertNotifications(alerts: Alert[], previousAlertsCount: number) {
  const { sendAlertPush } = usePushNotifications();

  useEffect(() => {
    // Only send notifications for new alerts (when count increases)
    if (alerts.length > previousAlertsCount && previousAlertsCount > 0) {
      const newAlerts = alerts.slice(0, alerts.length - previousAlertsCount);
      
      // Send notification for the most recent alert
      if (newAlerts.length > 0) {
        const latestAlert = newAlerts[0];
        sendAlertPush(latestAlert).catch((error) => {
          console.error('Failed to send push notification:', error);
        });
      }
    }
  }, [alerts.length, previousAlertsCount, sendAlertPush]);
}
