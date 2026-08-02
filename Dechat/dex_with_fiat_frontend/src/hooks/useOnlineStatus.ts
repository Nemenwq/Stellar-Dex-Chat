'use client';

import { useEffect, useState, useCallback } from 'react';
<<<<<<< HEAD
=======
import { chatTelemetry } from '@/lib/chatTelemetry';

/**
 * Verify actual internet connectivity by pinging a reliable endpoint.
 * Detects captive portals and other cases where navigator.onLine is misleading.
 */
async function verifyConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    void response;

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}
>>>>>>> emwulrd/main

/**
 * Hook to track network online/offline status
 * Provides isOnline state and watchers for online/offline events
<<<<<<< HEAD
=======
 *
 * Uses navigator.onLine as the primary indicator but also performs
 * real connectivity checks to detect captive portals and false positives.
>>>>>>> emwulrd/main
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Set initial state
    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
<<<<<<< HEAD
    }

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
=======
      chatTelemetry.networkStatus({
        status: window.navigator.onLine ? 'online' : 'offline',
        source: 'initial',
      });
    }

    const handleOnline = async () => {
      const hasConnectivity = await verifyConnectivity();
      setIsOnline(hasConnectivity);
      chatTelemetry.networkStatus({
        status: hasConnectivity ? 'online' : 'offline',
        source: 'connectivity-check',
      });
      if (hasConnectivity) {
        setWasOffline(true);
      }
>>>>>>> emwulrd/main
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
<<<<<<< HEAD
=======
      chatTelemetry.networkStatus({ status: 'offline', source: 'browser-event' });
>>>>>>> emwulrd/main
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const resetWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  return {
    isOnline,
    wasOffline,
    resetWasOffline,
  };
}
