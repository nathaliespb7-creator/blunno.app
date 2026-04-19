'use client';

import { useEffect, type ReactElement } from 'react';

/**
 * Prevent stale PWA/service-worker caches from masking UI updates during `next dev`.
 * Previously we only cleared on `localhost` / `127.0.0.1`, but opening the dev server
 * via LAN (e.g. `192.168.x.x:3000`) skipped cleanup and left old bundles cached.
 */
export function DevCacheReset(): ReactElement | null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    void navigator.serviceWorker
      ?.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {
        // Ignore SW cleanup failures on unsupported browsers.
      });

    void caches
      ?.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {
        // Ignore Cache API cleanup failures.
      });
  }, []);

  return null;
}
