'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import {
  requestNotificationPermission,
  areNotificationsGranted,
  isNotificationSupported,
} from '@/lib/notifications/push';

export function PushNotificationButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setIsGranted(areNotificationsGranted());
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const permission = await requestNotificationPermission();
      setIsGranted(permission === 'granted');
      
      if (permission === 'granted') {
        // Show success message
        console.log('Notifications enabled');
      } else if (permission === 'denied') {
        alert('Notifications were denied. Please enable them in your browser settings.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  if (isGranted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Bell className="w-4 h-4 mr-2" />
        Notifications Enabled
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnableNotifications}
      disabled={isLoading}
    >
      {isLoading ? (
        'Enabling...'
      ) : (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}
