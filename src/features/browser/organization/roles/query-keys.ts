import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remoteRoleQueryKeys = {
  roles: () => ['remote-browser', 'roles'] as const,
  list: (params?: RemoteListParams) =>
    [...remoteRoleQueryKeys.roles(), 'list', params ?? emptyParams] as const,
  permissions: (teamId: number | null) =>
    [...remoteRoleQueryKeys.roles(), 'permissions', teamId] as const,
} as const;
