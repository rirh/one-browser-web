import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remoteProxyQueryKeys = {
  proxies: () => ['remote-browser', 'proxies'] as const,
  list: (params?: RemoteListParams) =>
    [...remoteProxyQueryKeys.proxies(), 'list', params ?? emptyParams] as const,
} as const;
