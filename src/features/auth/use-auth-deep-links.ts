import {
  type AuthTokens,
  clearAuthExpiredNotice,
} from '@/features/auth/session';
import { desktopInvoke, isTauriRuntime } from '@/lib/desktop';
import { http } from '@/lib/http';
import * as React from 'react';

const desktopAuthSessionUpdatedEvent = 'one-browser-auth-session-updated';
const desktopAuthSessionErrorEvent = 'one-browser-auth-session-error';

type DesktopAuthAccessSnapshot = {
  accessToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  receivedAt: number;
};

export function useAuthDeepLinks(onAuthenticated: () => void, enabled = true) {
  const handledAccessTokenRef = React.useRef('');
  const [ready, setReady] = React.useState(() => !isTauriRuntime());

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!isTauriRuntime()) {
      return;
    }

    let cancelled = false;

    async function applyDesktopAuthSession() {
      const snapshot = await desktopInvoke<DesktopAuthAccessSnapshot | null>(
        'read_desktop_auth_session',
      );
      if (cancelled || !snapshot?.accessToken) {
        return;
      }

      const tokens = desktopAccessSnapshotToTokens(snapshot);
      http.updateTokens(tokens);
      clearAuthExpiredNotice();
      if (handledAccessTokenRef.current !== tokens.accessToken) {
        handledAccessTokenRef.current = tokens.accessToken;
        onAuthenticated();
      }
    }

    function handleAuthSessionUpdated() {
      void applyDesktopAuthSession().catch(() => {
        // AuthGate performs the user-visible fail-closed session check.
      });
    }

    function handleAuthSessionError() {
      // Rust has already rejected the callback. Keep any existing valid session.
    }

    window.addEventListener(
      desktopAuthSessionUpdatedEvent,
      handleAuthSessionUpdated,
    );
    window.addEventListener(
      desktopAuthSessionErrorEvent,
      handleAuthSessionError,
    );

    void applyDesktopAuthSession()
      .catch(() => {
        // AuthGate performs the user-visible fail-closed session check.
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      window.removeEventListener(
        desktopAuthSessionUpdatedEvent,
        handleAuthSessionUpdated,
      );
      window.removeEventListener(
        desktopAuthSessionErrorEvent,
        handleAuthSessionError,
      );
    };
  }, [enabled, onAuthenticated]);

  return enabled ? ready : true;
}

function desktopAccessSnapshotToTokens(
  snapshot: DesktopAuthAccessSnapshot,
): AuthTokens {
  return {
    accessToken: snapshot.accessToken,
    refreshToken: '',
    expiresIn: snapshot.expiresIn,
    refreshExpiresIn: snapshot.refreshExpiresIn,
    receivedAt: snapshot.receivedAt,
    source: 'desktop-keychain',
  };
}
