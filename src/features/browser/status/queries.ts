import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type { AppStatus } from '@/features/browser/contracts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  appStatusEvent,
  appStatusFromEvent,
  getAppStatus,
  readInjectedAppStatus,
} from './api';

export function useAppStatusQuery() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const cachedStatus = readInjectedAppStatus();
    if (cachedStatus) {
      queryClient.setQueryData<AppStatus>(
        browserQueryKeys.status(),
        cachedStatus,
      );
    }

    function handleAppStatus(event: Event) {
      const status = appStatusFromEvent(event);
      if (!status) {
        return;
      }

      queryClient.setQueryData<AppStatus>(browserQueryKeys.status(), status);
    }

    window.addEventListener(appStatusEvent, handleAppStatus);

    return () => {
      window.removeEventListener(appStatusEvent, handleAppStatus);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: browserQueryKeys.status(),
    queryFn: getAppStatus,
  });
}
