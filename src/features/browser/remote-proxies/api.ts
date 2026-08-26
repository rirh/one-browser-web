import { http } from '@/platform/http';

import type {
  RemoteCreatedResource,
  RemoteListParams,
  RemotePageResponse,
  RemoteProxyCheckConfigResource,
  RemoteProxyCheckResultPayload,
  RemoteProxyPayload,
  RemoteProxyResource,
} from './types';

const proxyPath = '/browser/proxies';

function cleanParams(params?: RemoteListParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

export async function listRemoteProxies(params?: RemoteListParams) {
  const response = await http.get<RemotePageResponse<RemoteProxyResource>>(
    proxyPath,
    cleanParams(params),
  );
  return response.data;
}

export async function getRemoteProxy(proxyId: number) {
  const response = await http.get<RemoteProxyResource>(
    `${proxyPath}/${proxyId}`,
  );
  return response.data;
}

export async function getRemoteProxyCheckConfig(proxyId: number) {
  const response = await http.post<RemoteProxyCheckConfigResource>(
    `${proxyPath}/${proxyId}/check-config`,
  );
  return response.data;
}

export async function createRemoteProxy(payload: RemoteProxyPayload) {
  const response = await http.post<RemoteCreatedResource>(proxyPath, payload);
  return response.data;
}

export async function updateRemoteProxy(
  proxyId: number,
  payload: RemoteProxyPayload,
) {
  const response = await http.put<RemoteProxyResource>(
    `${proxyPath}/${proxyId}`,
    payload,
  );
  return response.data;
}

export async function deleteRemoteProxy(proxyId: number) {
  await http.delete<void>(`${proxyPath}/${proxyId}`);
}

export async function updateRemoteProxyCheckResult(
  proxyId: number,
  payload: RemoteProxyCheckResultPayload,
) {
  const response = await http.put<RemoteProxyResource>(
    `${proxyPath}/${proxyId}/check-result`,
    payload,
  );
  return response.data;
}
