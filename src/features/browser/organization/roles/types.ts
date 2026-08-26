import type { RemoteMemberPermissionOptionResource } from '../members/types';

export type RemoteStatusFlag = '0' | '1';

export interface RemoteListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
  team_id?: number;
}

export interface RemotePageResponse<T> {
  list: T[];
  total: number;
}

export interface RemoteBatchDeleteResult {
  deleted: number;
}

export type { RemoteMemberPermissionOptionResource };

export interface RemoteTeamRoleResource {
  role_id: number;
  team_id: number;
  role_name: string;
  role_key: string;
  role_sort: number;
  status: RemoteStatusFlag;
  is_builtin: boolean;
  permission_count: number;
  menus: string[];
  permissions: string[];
  created_at: string;
  updated_at: string | null;
  remark: string | null;
}

export interface RemoteTeamRolePayload {
  team_id: number;
  role_name: string;
  role_key: string;
  role_sort?: number;
  status?: RemoteStatusFlag;
  remark?: string;
  menus: string[];
  permissions: string[];
}

export interface RemoteTeamRoleBatchDeletePayload {
  team_id: number;
  role_ids: number[];
}
