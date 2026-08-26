import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import { isTauriRuntime } from '@/platform/desktop';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  getAppStatus,
  getChromiumDownloadManifest,
  startChromiumDownload,
} from './api';
import { isNetworkUnavailable } from './network-guard';

const AUTO_UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const AUTO_UPDATE_STARTED_KEY = '__oneBrowserChromiumAutoUpdateStarted';

let lastAutoUpdateCheckAt = 0;
let autoUpdateCheckPromise: Promise<void> | null = null;

export function useChromiumAutoUpdate(queryClient: QueryClient) {
  useEffect(() => {
    if (!isTauriRuntime()) {
      return;
    }

    const state = window as Window & {
      [AUTO_UPDATE_STARTED_KEY]?: boolean;
    };
    if (state[AUTO_UPDATE_STARTED_KEY]) {
      return;
    }

    state[AUTO_UPDATE_STARTED_KEY] = true;
    void runChromiumAutoUpdateCheck(queryClient);
    const intervalId = window.setInterval(() => {
      void runChromiumAutoUpdateCheck(queryClient);
    }, AUTO_UPDATE_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      state[AUTO_UPDATE_STARTED_KEY] = false;
    };
  }, [queryClient]);
}

async function runChromiumAutoUpdateCheck(queryClient: QueryClient) {
  const now = Date.now();
  if (
    autoUpdateCheckPromise ||
    now - lastAutoUpdateCheckAt < AUTO_UPDATE_CHECK_INTERVAL_MS
  ) {
    return;
  }

  lastAutoUpdateCheckAt = now;
  autoUpdateCheckPromise = (async () => {
    try {
      const status = await queryClient.fetchQuery({
        queryKey: browserQueryKeys.status(),
        queryFn: getAppStatus,
        staleTime: 0,
      });

      if (
        isNetworkUnavailable(status) ||
        status.runningCount > 0 ||
        status.settings.chromiumPath
      ) {
        return;
      }

      const manifest = await getChromiumDownloadManifest();
      await startChromiumDownload(manifest);
    } catch (error) {
      console.warn('failed to check browser update', error);
    }
  })().finally(() => {
    autoUpdateCheckPromise = null;
  });

  await autoUpdateCheckPromise;
}
