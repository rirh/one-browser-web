import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remoteMemberQueryKeys = {
  members: () => ['remote-browser', 'members'] as const,
  list: (params?: RemoteListParams) =>
    [
      ...remoteMemberQueryKeys.members(),
      'list',
      params ?? emptyParams,
    ] as const,
  permissions: (memberId: number | null, teamId: number | null) =>
    [
      ...remoteMemberQueryKeys.members(),
      'permissions',
      memberId,
      teamId,
    ] as const,
} as const;
