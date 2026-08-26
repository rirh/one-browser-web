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

export interface RemoteMemberResource {
  member_id: number;
  user_id: number;
  user_name: string;
  nick_name: string;
  avatar: string;
  display_name: string;
  email: string;
  phone_number: string;
  status: RemoteStatusFlag;
  last_active_at: string | null;
  team_id: number;
  team_name: string;
  role_names: string[];
  environment_count: number;
  created_at: string;
  updated_at: string | null;
  remark: string | null;
}

export interface RemoteMemberPermissionOptionResource {
  menu_id: number;
  parent_id: number | null;
  name: string;
  permission_code: string | null;
  menu_type: string;
  order_num: number;
  status: RemoteStatusFlag;
}

export interface RemoteMemberEnvironmentOptionResource {
  environment_id: number;
  environment_no: string | null;
  name: string;
  status: RemoteStatusFlag;
}

export interface RemoteMemberRoleOptionResource {
  role_id: number;
  role_name: string;
  role_key: string;
  is_builtin: boolean;
  permission_count: number;
  status: RemoteStatusFlag;
}

export interface RemoteMemberPermissionsResource {
  member: RemoteMemberResource;
  permission_options: RemoteMemberPermissionOptionResource[];
  granted_menus: string[];
  granted_permissions: string[];
  roles: RemoteMemberRoleOptionResource[];
  granted_role_ids: number[];
  environments: RemoteMemberEnvironmentOptionResource[];
  granted_environment_ids: number[];
}

export interface RemoteMemberPermissionsPayload {
  team_id: number;
  menus: string[];
  permissions: string[];
  role_ids: number[];
  environment_ids: number[];
}

export interface RemoteMemberRolesPayload {
  team_id: number;
  role_ids: number[];
}

export interface RemoteMemberEnvironmentAuthorizationPayload {
  team_id: number;
  environment_ids: number[];
}
