import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remotePermissionQueryKeys = {
  permissions: () => ['remote-browser', 'permissions'] as const,
  list: (params?: RemoteListParams) =>
    [
      ...remotePermissionQueryKeys.permissions(),
      'list',
      params ?? emptyParams,
    ] as const,
} as const;
