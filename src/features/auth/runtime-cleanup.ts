import {
  AUTH_SESSION_EXPIRED_EVENT,
  getAuthSessionGeneration,
} from '@/features/auth/session';
import { closeAllProfiles } from '@/features/browser/runtime/api';
import { isTauriRuntime } from '@/lib/desktop';
import * as React from 'react';

type AuthSessionExpiredPayload = {
  generation: number;
  message: string;
};

export function useAuthRuntimeCleanup() {
  React.useEffect(() => {
    if (!isTauriRuntime()) return;

    let cleaningGeneration: number | null = null;
    let cleanupPromise: Promise<void> | null = null;

    const handleAuthSessionExpired = (event: Event) => {
      const payload = (event as CustomEvent<unknown>).detail;
      const generation = isAuthSessionExpiredPayload(payload)
        ? payload.generation
        : getAuthSessionGeneration();
      if (cleaningGeneration === generation) return;

      cleaningGeneration = generation;
      const previousCleanup = cleanupPromise ?? Promise.resolve();
      const nextCleanup = previousCleanup
        .then(() => closeAllProfiles())
        .then(() => undefined)
        .catch((error) => {
          console.error(
            '[auth-runtime-cleanup] failed to close local browser profiles',
            error,
          );
        });
      const finalCleanup = nextCleanup.finally(() => {
        if (cleanupPromise === finalCleanup) {
          cleanupPromise = null;
        }
      });
      cleanupPromise = finalCleanup;
    };

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleAuthSessionExpired,
    );
    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleAuthSessionExpired,
      );
    };
  }, []);
}

function isAuthSessionExpiredPayload(
  payload: unknown,
): payload is AuthSessionExpiredPayload {
  if (!payload || typeof payload !== 'object') return false;
  const value = payload as Partial<AuthSessionExpiredPayload>;
  return (
    typeof value.generation === 'number' && typeof value.message === 'string'
  );
}
