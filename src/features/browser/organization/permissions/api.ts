import { http } from '@/lib/http';

import type {
  RemoteBatchDeleteResult,
  RemoteListParams,
  RemotePageResponse,
  RemotePermissionBatchDeletePayload,
  RemotePermissionPayload,
  RemotePermissionResource,
  RemoteStatusFlag,
} from './types';

const permissionPath = '/browser/permissions';

function cleanParams(params?: RemoteListParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

export async function listRemotePermissions(params?: RemoteListParams) {
  const response = await http.get<RemotePageResponse<RemotePermissionResource>>(
    permissionPath,
    cleanParams(params),
  );
  return response.data;
}

export async function getRemotePermission(permissionId: number) {
  const response = await http.get<RemotePermissionResource>(
    `${permissionPath}/${permissionId}`,
  );
  return response.data;
}

export async function createRemotePermission(payload: RemotePermissionPayload) {
  const response = await http.post<
    RemotePermissionResource,
    RemotePermissionPayload
  >(permissionPath, payload);
  return response.data;
}

export async function updateRemotePermission(
  permissionId: number,
  payload: RemotePermissionPayload,
) {
  const response = await http.put<
    RemotePermissionResource,
    RemotePermissionPayload
  >(`${permissionPath}/${permissionId}`, payload);
  return response.data;
}

export function setRemotePermissionOrder(
  record: RemotePermissionResource,
  orderNum: number,
) {
  return updateRemotePermission(record.permission_id, {
    permission_name: record.permission_name,
    parent_id: record.parent_id,
    order_num: orderNum,
    path: record.path,
    permission_type: record.permission_type,
    permission_scope: record.permission_scope,
    visible: record.visible,
    status: record.status,
    permission_code: record.permission_code,
    icon: record.icon,
    remark: record.remark,
  });
}

export async function deleteRemotePermission(permissionId: number) {
  await http.delete<void>(`${permissionPath}/${permissionId}`);
}

export async function batchDeleteRemotePermissions(
  payload: RemotePermissionBatchDeletePayload,
) {
  const response = await http.post<
    RemoteBatchDeleteResult,
    RemotePermissionBatchDeletePayload
  >(`${permissionPath}/batch-delete`, payload);
  return response.data;
}

export async function setRemotePermissionStatus(
  permissionId: number,
  status: RemoteStatusFlag,
) {
  const response = await http.put<
    RemotePermissionResource,
    { status: RemoteStatusFlag }
  >(`${permissionPath}/${permissionId}/status`, { status });
  return response.data;
}
