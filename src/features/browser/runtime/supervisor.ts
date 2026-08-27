import { readAuthTokens } from '@/features/auth/session';
import { isTauriRuntime } from '@/lib/desktop';
import * as React from 'react';

import type { RuntimeProfile, TunnelRoute } from '../contracts';
import { renewRemoteEnvironment } from '../environments/api';
import { parseRemoteEnvironmentProfileId } from '../environments/runtime-profile-id';
import type { RemoteTunnelRoute } from '../environments/types';
import { listRuntime, updateTunnelRoute } from './api';
import {
  isRuntimeRenewCandidate,
  nextRuntimeRenewDelay,
} from './supervisor-policy';

export function useRuntimeSupervisor() {
  React.useEffect(() => {
    if (!isTauriRuntime()) return;

    let stopped = false;
    let timer: number | null = null;
    let sweepPromise: Promise<void> | null = null;
    const renewals = new Map<number, Promise<void>>();

    const renewRuntime = (runtime: RuntimeProfile) => {
      const environmentId = parseRemoteEnvironmentProfileId(runtime.profileId);
      if (
        environmentId === null ||
        runtime.tunnelGeneration === null ||
        !runtime.tunnelRouteExpiresAt
      ) {
        return Promise.resolve();
      }
      const current = renewals.get(environmentId);
      if (current) return current;

      const renewal = renewRemoteEnvironment(environmentId, {
        generation: runtime.tunnelGeneration,
        routeExpiresAt: runtime.tunnelRouteExpiresAt,
      })
        .then((renewed) =>
          updateTunnelRoute({
            profileId: runtime.profileId,
            generation: renewed.generation,
            leaseExpiresAt: renewed.leaseExpiresAt,
            tunnelRoute: renewed.tunnelRoute
              ? toNativeTunnelRoute(renewed.tunnelRoute)
              : null,
          }),
        )
        .then(() => undefined)
        .catch((error) => {
          // The local SOCKS bridge remains fail-closed while connectivity or
          // the Server is unavailable. A definitive refresh 401 is handled by
          // the global authentication-expiry coordinator.
          console.warn(
            `[runtime-supervisor] failed to renew remote environment ${environmentId}`,
            error,
          );
        })
        .finally(() => {
          renewals.delete(environmentId);
        });
      renewals.set(environmentId, renewal);
      return renewal;
    };

    const sweep = () => {
      if (!readAuthTokens() || stopped) return Promise.resolve();
      if (sweepPromise) return sweepPromise;

      sweepPromise = listRuntime()
        .then((runtime) =>
          Promise.all(
            runtime.filter(isRuntimeRenewCandidate).map(renewRuntime),
          ),
        )
        .then(() => undefined)
        .catch((error) => {
          console.warn(
            '[runtime-supervisor] failed to list local runtime',
            error,
          );
        })
        .finally(() => {
          sweepPromise = null;
        });
      return sweepPromise;
    };

    const schedule = () => {
      if (stopped) return;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void sweep().finally(schedule);
      }, nextRuntimeRenewDelay());
    };
    const renewNow = () => {
      void sweep();
    };
    const renewWhenVisible = () => {
      if (document.visibilityState === 'visible') renewNow();
    };

    window.addEventListener('online', renewNow);
    window.addEventListener('focus', renewNow);
    document.addEventListener('visibilitychange', renewWhenVisible);
    renewNow();
    schedule();

    return () => {
      stopped = true;
      if (timer !== null) window.clearTimeout(timer);
      window.removeEventListener('online', renewNow);
      window.removeEventListener('focus', renewNow);
      document.removeEventListener('visibilitychange', renewWhenVisible);
    };
  }, []);
}

function toNativeTunnelRoute(route: RemoteTunnelRoute): TunnelRoute {
  return {
    transport: route.transport,
    endpoint: route.endpoint,
    tlsEnabled: route.tls_enabled,
    accessToken: route.access_token,
    expiresAt: route.expires_at,
    generation: route.generation,
    exitId: route.exit_id,
    expectedExitIp: route.expected_exit_ip,
    directFallback: route.direct_fallback,
  };
}
