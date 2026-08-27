import { http } from '@/lib/http';

import type {
  RemoteCreatedResource,
  RemoteListParams,
  RemotePageResponse,
  RemoteStatusFlag,
  RemoteTeamInvitePayload,
  RemoteTeamInviteResource,
  RemoteTeamInviteRoleResource,
  RemoteTeamPayload,
  RemoteTeamResource,
} from './types';

const teamPath = '/browser/teams';

function cleanParams(params?: RemoteListParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

export async function listRemoteTeams(params?: RemoteListParams) {
  const response = await http.get<RemotePageResponse<RemoteTeamResource>>(
    teamPath,
    cleanParams(params),
  );
  return response.data;
}

export async function createRemoteTeam(payload: RemoteTeamPayload) {
  const response = await http.post<RemoteCreatedResource>(teamPath, payload);
  return response.data;
}

export async function updateRemoteTeam(
  teamId: number,
  payload: RemoteTeamPayload,
) {
  const response = await http.put<RemoteTeamResource>(
    `${teamPath}/${teamId}`,
    payload,
  );
  return response.data;
}

export async function leaveRemoteTeam(teamId: number) {
  await http.delete<void>(`${teamPath}/${teamId}/membership`);
}

export async function transferRemoteTeamOwner(
  teamId: number,
  memberId: number,
) {
  const response = await http.put<RemoteTeamResource>(
    `${teamPath}/${teamId}/owner`,
    { member_id: memberId },
  );
  return response.data;
}

export async function dissolveRemoteTeam(teamId: number) {
  await http.delete<void>(`${teamPath}/${teamId}`);
}

export async function setRemoteTeamStatus(
  teamId: number,
  status: RemoteStatusFlag,
) {
  const response = await http.put<RemoteTeamResource>(
    `${teamPath}/${teamId}/status`,
    { status },
  );
  return response.data;
}

export async function createRemoteTeamInvite(
  teamId: number,
  payload: RemoteTeamInvitePayload,
) {
  const response = await http.post<
    RemoteTeamInviteResource,
    RemoteTeamInvitePayload
  >(`${teamPath}/${teamId}/invites`, payload);
  return response.data;
}

export async function listRemoteTeamInviteRoles(teamId: number) {
  const response = await http.get<RemoteTeamInviteRoleResource[]>(
    `${teamPath}/${teamId}/invite-roles`,
  );
  return response.data;
}
