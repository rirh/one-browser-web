import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remoteTeamQueryKeys = {
  all: ['remote-browser'] as const,
  teams: () => [...remoteTeamQueryKeys.all, 'teams'] as const,
  list: (params?: RemoteListParams) =>
    [...remoteTeamQueryKeys.teams(), 'list', params ?? emptyParams] as const,
  inviteRoles: (teamId: number | null) =>
    [...remoteTeamQueryKeys.teams(), 'invite-roles', teamId] as const,
} as const;
