import type {
  AuthSessionStatus,
  AuthTokens,
} from '@/features/auth/session/types';
import { desktopInvoke, isTauriRuntime } from '@/lib/desktop';

export const AUTH_TOKEN_STORAGE_KEY = 'one-browser:app-auth-token';
export const AUTH_TOKENS_STORAGE_KEY = 'one-browser:app-auth-tokens';
export const AUTH_TOKENS_CHANGED_EVENT = 'one-browser:auth-tokens-changed';
export const AUTH_SESSION_EXPIRED_EVENT = 'one-browser:auth-session-expired';
const AUTH_EXPIRED_NOTICE_KEY = 'one-browser:app-auth-expired-notice';
let authSessionGeneration = 0;
let inMemoryAuthTokens: AuthTokens | null = null;

type DesktopAuthAccessSnapshot = {
  accessToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  receivedAt: number;
};

export function getAuthSessionGeneration() {
  return authSessionGeneration;
}

export function advanceAuthSessionGeneration() {
  authSessionGeneration += 1;
}

export function readAuthTokens(): AuthTokens | null {
  return inMemoryAuthTokens;
}

export function readAuthToken() {
  return inMemoryAuthTokens?.accessToken || '';
}

export function isAuthAccessTokenStale(
  tokens: AuthTokens | null,
  skewMs = 30_000,
) {
  if (!tokens?.accessToken) return true;
  if (!tokens.expiresIn) return false;
  return tokens.receivedAt + tokens.expiresIn * 1000 <= Date.now() + skewMs;
}

export function storeAuthTokens(tokens: AuthTokens) {
  inMemoryAuthTokens = {
    ...tokens,
    refreshToken: isTauriRuntime() ? '' : tokens.refreshToken,
  };
}

export function storeAuthToken(token: string) {
  storeAuthTokens({
    accessToken: token,
    refreshToken: '',
    receivedAt: Date.now(),
  });
}

export function clearAuthToken(reason = 'unspecified') {
  void reason;
  inMemoryAuthTokens = null;
  clearLegacyBrowserTokenStorage();
  if (isTauriRuntime()) {
    void desktopInvoke<void>('clear_desktop_auth_session').catch(() => {
      // Fail closed: the in-memory access token is already gone.
    });
  }
  advanceAuthSessionGeneration();
}

export function consumeAuthExpiredNotice() {
  if (typeof window === 'undefined') return null;
  try {
    const notice = window.sessionStorage.getItem(AUTH_EXPIRED_NOTICE_KEY);
    window.sessionStorage.removeItem(AUTH_EXPIRED_NOTICE_KEY);
    return notice;
  } catch {
    return null;
  }
}

export function clearAuthExpiredNotice() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(AUTH_EXPIRED_NOTICE_KEY);
  } catch {
    // A fresh session remains authoritative if storage is unavailable.
  }
}

export function markAuthExpiredNotice(message: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(AUTH_EXPIRED_NOTICE_KEY, message);
  } catch {
    // Authentication state remains authoritative if storage is unavailable.
  }
}

export function notifyAuthTokensChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_TOKENS_CHANGED_EVENT));
}

export function notifyAuthSessionExpired(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
      detail: {
        generation: getAuthSessionGeneration(),
        message,
      },
    }),
  );
}

export async function readAuthSessionStatus(): Promise<AuthSessionStatus> {
  clearLegacyBrowserTokenStorage();
  if (!isTauriRuntime()) {
    return { authenticated: false };
  }

  const snapshot = await desktopInvoke<DesktopAuthAccessSnapshot | null>(
    'read_desktop_auth_session',
  );
  if (!snapshot?.accessToken) {
    inMemoryAuthTokens = null;
    return { authenticated: false };
  }

  inMemoryAuthTokens = {
    accessToken: snapshot.accessToken,
    refreshToken: '',
    expiresIn: snapshot.expiresIn,
    refreshExpiresIn: snapshot.refreshExpiresIn,
    receivedAt: snapshot.receivedAt,
    source: 'desktop-keychain',
  };
  return { authenticated: true };
}

function clearLegacyBrowserTokenStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_TOKENS_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Legacy storage may be unavailable; it is never read by the new path.
  }
}
