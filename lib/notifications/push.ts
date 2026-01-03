/**
 * Web Push Notifications
 * Browser push notifications using Web Push API
 */

import { logger } from '@/lib/utils/logger';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    logger.warn('Browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Check if notifications are granted
 */
export function areNotificationsGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a push notification
 */
export async function sendPushNotification(
  options: PushNotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported()) {
    logger.warn('Push notifications not supported');
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    logger.warn('Notification permission not granted');
    return false;
  }

  try {
    const notificationOptions: NotificationOptions = {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/icon-192x192.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
    };

    const notification = new Notification(options.title, notificationOptions);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to relevant page if data contains URL
      if (options.data?.url) {
        window.location.href = options.data.url as string;
      }
    };

    // Auto-close after 5 seconds (unless requireInteraction is true)
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return true;
  } catch (error) {
    logger.error('Failed to send push notification', error as Error);
    return false;
  }
}

/**
 * Send alert notification
 */
export async function sendAlertNotification(
  alert: {
    title: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    url?: string;
  }
): Promise<boolean> {
  const icon = alert.severity === 'critical' 
    ? '/icons/alert-critical.png'
    : alert.severity === 'high'
    ? '/icons/alert-high.png'
    : '/icons/alert-medium.png';

  return sendPushNotification({
    title: alert.title,
    body: alert.message,
    icon,
    tag: `alert-${alert.severity}`,
    data: {
      type: 'alert',
      severity: alert.severity,
      url: alert.url || '/dashboard',
    },
    requireInteraction: alert.severity === 'critical' || alert.severity === 'high',
  });
}

/**
 * Send reputation score notification
 */
export async function sendReputationNotification(
  clientName: string,
  score: number,
  change: number,
  url?: string
): Promise<boolean> {
  const isPositive = change > 0;
  const emoji = isPositive ? '📈' : '📉';
  
  return sendPushNotification({
    title: `${emoji} Reputation Score Update`,
    body: `${clientName}: ${score.toFixed(1)} (${isPositive ? '+' : ''}${change.toFixed(1)})`,
    icon: '/icons/reputation.png',
    tag: 'reputation-update',
    data: {
      type: 'reputation',
      score,
      change,
      url: url || '/dashboard',
    },
  });
}
