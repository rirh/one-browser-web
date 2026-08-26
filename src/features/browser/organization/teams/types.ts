export type RemoteStatusFlag = '0' | '1';

export interface RemoteListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
  team_id?: number;
  joined_only?: boolean;
}

export interface RemotePageResponse<T> {
  list: T[];
  total: number;
}

export interface RemoteCreatedResource {
  id: number;
}

export interface RemoteTeamResource {
  team_id: number;
  team_key: string;
  team_name: string;
  owner_member_id: number | null;
  owner_name: string | null;
  status: RemoteStatusFlag;
  member_count: number;
  environment_count: number;
  proxy_count: number;
  can_leave: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string | null;
  remark: string;
}

export interface RemoteTeamPayload {
  team_key: string;
  team_name: string;
  owner_member_id?: number | null;
  status?: RemoteStatusFlag;
  remark?: string;
}

export interface RemoteTeamInviteResource {
  invite_id: number;
  invite_token: string;
  url: string;
  email?: string | null;
  role_key?: string | null;
  role_name?: string | null;
  expires_at: string;
}

export interface RemoteTeamInvitePayload {
  email?: string;
  role_key: string;
  turnstile_token?: string;
}

export interface RemoteTeamInviteRoleResource {
  role_key: string;
  role_name: string;
  remark?: string | null;
  permission_count: number;
}
