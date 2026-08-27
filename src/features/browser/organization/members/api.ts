import { http } from '@/lib/http';

import type {
  RemoteListParams,
  RemoteMemberEnvironmentAuthorizationPayload,
  RemoteMemberPermissionsPayload,
  RemoteMemberPermissionsResource,
  RemoteMemberResource,
  RemoteMemberRolesPayload,
  RemotePageResponse,
  RemoteStatusFlag,
} from './types';

const memberPath = '/browser/members';
const teamPath = '/browser/teams';

function cleanParams(params?: RemoteListParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

export async function listRemoteMembers(params?: RemoteListParams) {
  const response = await http.get<RemotePageResponse<RemoteMemberResource>>(
    memberPath,
    cleanParams(params),
  );
  return response.data;
}

export async function removeRemoteTeamMember(teamId: number, memberId: number) {
  await http.delete<void>(`${teamPath}/${teamId}/members/${memberId}`);
}

export async function setRemoteMemberStatus(
  memberId: number,
  payload: { team_id: number; status: RemoteStatusFlag },
) {
  const response = await http.put<RemoteMemberResource>(
    `${memberPath}/${memberId}/status`,
    payload,
  );
  return response.data;
}

export async function getRemoteMemberPermissions(
  memberId: number,
  teamId: number,
) {
  const response = await http.get<RemoteMemberPermissionsResource>(
    `${memberPath}/${memberId}/permissions`,
    { team_id: teamId },
  );
  return response.data;
}

export async function updateRemoteMemberPermissions(
  memberId: number,
  payload: RemoteMemberPermissionsPayload,
) {
  const response = await http.put<
    RemoteMemberPermissionsResource,
    RemoteMemberPermissionsPayload
  >(`${memberPath}/${memberId}/permissions`, payload);
  return response.data;
}

export async function updateRemoteMemberRoles(
  memberId: number,
  payload: RemoteMemberRolesPayload,
) {
  const response = await http.put<
    RemoteMemberPermissionsResource,
    RemoteMemberRolesPayload
  >(`${memberPath}/${memberId}/roles`, payload);
  return response.data;
}

export async function updateRemoteMemberEnvironmentAuthorization(
  memberId: number,
  payload: RemoteMemberEnvironmentAuthorizationPayload,
) {
  const response = await http.put<
    RemoteMemberPermissionsResource,
    RemoteMemberEnvironmentAuthorizationPayload
  >(`${memberPath}/${memberId}/environments`, payload);
  return response.data;
}
