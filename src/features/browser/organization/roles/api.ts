import { http } from '@/platform/http';

import type {
  RemoteBatchDeleteResult,
  RemoteListParams,
  RemoteMemberPermissionOptionResource,
  RemotePageResponse,
  RemoteTeamRoleBatchDeletePayload,
  RemoteTeamRolePayload,
  RemoteTeamRoleResource,
} from './types';

const rolePath = '/browser/roles';

function cleanParams(params?: RemoteListParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

export async function listRemoteTeamRoles(params?: RemoteListParams) {
  const response = await http.get<RemotePageResponse<RemoteTeamRoleResource>>(
    rolePath,
    cleanParams(params),
  );
  return response.data;
}

export async function listRemoteTeamRolePermissions(teamId: number) {
  const response = await http.get<RemoteMemberPermissionOptionResource[]>(
    '/browser/role-permissions',
    { team_id: teamId },
  );
  return response.data;
}

export async function createRemoteTeamRole(payload: RemoteTeamRolePayload) {
  const response = await http.post<
    RemoteTeamRoleResource,
    RemoteTeamRolePayload
  >(rolePath, payload);
  return response.data;
}

export async function updateRemoteTeamRole(
  roleId: number,
  payload: RemoteTeamRolePayload,
) {
  const response = await http.put<
    RemoteTeamRoleResource,
    RemoteTeamRolePayload
  >(`${rolePath}/${roleId}`, payload);
  return response.data;
}

export async function deleteRemoteTeamRole(roleId: number, teamId: number) {
  await http.delete<void>(`${rolePath}/${roleId}`, {
    params: { team_id: teamId },
  });
}

export async function batchDeleteRemoteTeamRoles(
  payload: RemoteTeamRoleBatchDeletePayload,
) {
  const response = await http.post<
    RemoteBatchDeleteResult,
    RemoteTeamRoleBatchDeletePayload
  >(`${rolePath}/batch-delete`, payload);
  return response.data;
}
