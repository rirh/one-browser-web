import {
  clearAuthToken,
  markAuthExpiredNotice,
  readAuthTokens,
} from '@/features/auth/session';
import { isTauriRuntime } from '@/lib/desktop';
import { HttpClient } from '@/lib/http/client';
import { getApiBaseUrl } from '@/lib/http/url';

const resolvedApiBaseUrl = getApiBaseUrl();

export const http = new HttpClient({ baseURL: resolvedApiBaseUrl });
console.info('[request-debug] api base url resolved', {
  apiBaseUrl: resolvedApiBaseUrl,
  envApiUrl: import.meta.env.VITE_API_URL || null,
  origin: typeof window === 'undefined' ? 'server' : window.location.origin,
  protocol: typeof window === 'undefined' ? 'server' : window.location.protocol,
});

if (isTauriRuntime()) {
  const initialAuthTokens = readAuthTokens();
  if (initialAuthTokens) {
    http.updateTokens(initialAuthTokens);
  }
} else {
  clearAuthToken('browser-cookie-mode-startup');
}

export const get = http.get.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http);
export const upload = http.upload.bind(http);

export function expireStoredAuthSession(message: string) {
  const notice = message.trim() || '登录信息已过期，请重新登录';
  markAuthExpiredNotice(notice);
  http.updateTokens(null);
}

export { HttpClient } from '@/lib/http/client';
export { HttpError } from '@/lib/http/types';
export type {
  ApiResponse,
  RequestConfig,
  RequestOptions,
} from '@/lib/http/types';
export { getApiBaseUrl } from '@/lib/http/url';

export default http;
