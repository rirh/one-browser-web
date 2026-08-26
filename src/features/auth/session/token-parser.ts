import type {
  AuthTokenPayload,
  AuthTokenSource,
  AuthTokens,
} from '@/features/auth/session/types';

export function createAuthTokens(
  payload: AuthTokenPayload,
  fallbackRefreshToken = '',
  source: AuthTokenSource = 'payload',
): AuthTokens | null {
  const accessToken = firstPlainTokenValue(
    payload.access_token,
    payload.accessToken,
    payload.token,
  );
  if (!accessToken) {
    return null;
  }

  const refreshTokenCandidate =
    firstPlainTokenValue(payload.refresh_token, payload.refreshToken) ||
    firstPlainTokenValue(fallbackRefreshToken);

  return {
    accessToken,
    refreshToken:
      refreshTokenCandidate && refreshTokenCandidate !== accessToken
        ? refreshTokenCandidate
        : '',
    expiresIn: optionalNumber(payload.expires_in ?? payload.expiresIn),
    refreshExpiresIn: optionalNumber(
      payload.refresh_expires_in ?? payload.refreshExpiresIn,
    ),
    source,
    receivedAt: Date.now(),
  };
}

export function normalizeStoredAuthTokens(value: unknown): AuthTokens | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const tokens = createAuthTokens(
    {
      accessToken: stringValue(record.accessToken),
      refreshToken: stringValue(record.refreshToken),
      expiresIn: numberValue(record.expiresIn),
      refreshExpiresIn: numberValue(record.refreshExpiresIn),
    },
    '',
    isAuthTokenSource(record.source) ? record.source : 'payload',
  );
  if (!tokens) {
    return null;
  }
  tokens.receivedAt = optionalNumber(record.receivedAt) ?? Date.now();
  return tokens;
}

export function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return (
    'access_token' in value ||
    'accessToken' in value ||
    'token' in value ||
    'refresh_token' in value ||
    'refreshToken' in value
  );
}

/**
 * Legacy compatibility only. The Tauri handoff path never calls this parser and
 * rejects callback URLs containing tokens before they reach the WebView.
 */
export function createLegacyAuthTokensFromCallbackUrl(
  value: string,
): AuthTokens | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    url.protocol !== 'one-browser:' ||
    url.hostname !== 'auth' ||
    url.pathname !== '/callback'
  ) {
    return null;
  }

  return createAuthTokens(
    {
      access_token: url.searchParams.get('access_token'),
      refresh_token: url.searchParams.get('refresh_token'),
      expires_in: url.searchParams.get('expires_in'),
      refresh_expires_in: url.searchParams.get('refresh_expires_in'),
    },
    '',
    'legacy-callback',
  );
}

function firstPlainTokenValue(...values: unknown[]) {
  for (const value of values) {
    const token = plainTokenValue(value);
    if (token) return token;
  }
  return '';
}

function plainTokenValue(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed || isAbsoluteUrl(trimmed) || hasTokenQueryParams(trimmed)) {
    return '';
  }
  return trimmed;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function isAuthTokenSource(value: unknown): value is AuthTokenSource {
  return (
    value === 'desktop-keychain' ||
    value === 'payload' ||
    value === 'legacy-callback'
  );
}

function hasTokenQueryParams(value: string) {
  return /(?:^|[?&])(?:access_token|accessToken|refresh_token|refreshToken|token)=/.test(
    value,
  );
}

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}
