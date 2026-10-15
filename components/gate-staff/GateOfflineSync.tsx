'use client';

import * as React from 'react';
import { listQueuedScans, removeQueuedScan } from '@/lib/offline/checkin-queue';
import { syncOfflineScans } from '@/lib/api/platform';

export function GateOfflineSync() {
  const flush = React.useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const queued = await listQueuedScans();
    if (!queued.length) return;
    try {
      await syncOfflineScans(queued);
      await Promise.all(queued.map((row) => removeQueuedScan(row.clientScanId)));
    } catch {
      // Stay queued until the next online event.
    }
  }, []);

  React.useEffect(() => {
    void flush();
    window.addEventListener('online', flush);
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw-gate.js');
    }
    return () => window.removeEventListener('online', flush);
  }, [flush]);

  return null;
}
