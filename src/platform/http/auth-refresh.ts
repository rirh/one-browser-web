import {
  defaultStatusText,
  getHeader,
  parseJsonResponseBody,
  sendHttpRequest,
} from '@/platform/http/transport';
import type {
  BackendErrorResponse,
  BackendResponse,
} from '@/platform/http/types';
import { HttpError } from '@/platform/http/types';
import { buildRequestUrl } from '@/platform/http/url';

export async function refreshBrowserOidcSession(baseURL: string) {
  const refreshUrl = buildRequestUrl(baseURL, '/auth/refresh');
  const response = await sendHttpRequest(
    refreshUrl,
    { method: 'POST', credentials: 'same-origin' },
    { 'Content-Type': 'application/json' },
    undefined,
  );
  const contentType = getHeader(response.headers, 'content-type');
  const jsonResponse = contentType?.includes('application/json')
    ? (parseJsonResponseBody(response.body) as
        | BackendResponse<{ refreshed: boolean }>
        | BackendErrorResponse)
    : null;

  if (!response.ok) {
    throw new HttpError(
      response.status,
      jsonResponse?.code ?? 'HTTP_ERROR',
      jsonResponse?.message ||
        jsonResponse?.msg ||
        defaultStatusText(response.status),
      jsonResponse && 'details' in jsonResponse ? jsonResponse.details : null,
    );
  }
  if (
    !jsonResponse ||
    !('data' in jsonResponse) ||
    jsonResponse.data?.refreshed !== true
  ) {
    throw new HttpError(
      502,
      'INVALID_REFRESH_RESPONSE',
      '统一登录刷新响应无效',
    );
  }
}
