export type RemoteStatusFlag = '0' | '1';
export type RemoteProxyType =
  | 'no_proxy'
  | 'http'
  | 'https'
  | 'socks5'
  | 'fixed_servers'
  | 'pac_script';
export type RemoteProxyCheckStatus =
  | 'unchecked'
  | 'checking'
  | 'ok'
  | 'blocked'
  | 'error';

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

export interface RemoteCreatedResource {
  id: number;
}

export interface RemoteProxyResource {
  proxy_id: number;
  proxy_key: string;
  name: string;
  type: RemoteProxyType;
  host: string | null;
  port: number | null;
  username: string | null;
  has_password: boolean;
  server: string | null;
  pac_url: string | null;
  refresh_url: string | null;
  ip_checker: string | null;
  last_check_status: RemoteProxyCheckStatus;
  last_check_exit_ip: string | null;
  last_check_country_code: string | null;
  last_check_country: string | null;
  last_check_region: string | null;
  last_check_asn: string | null;
  last_check_latency_ms: number | null;
  last_check_checked_at: string | null;
  last_check_message: string;
  status: RemoteStatusFlag;
  owner_member_id: number | null;
  owner_name: string | null;
  team_id: number;
  team_name: string;
  linked_environment_count: number;
  linked_environment_names: string[];
  created_at: string;
  updated_at: string | null;
  remark: string;
}

export interface RemoteProxyCheckConfigResource {
  proxy_id: number;
  type: RemoteProxyType;
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
  server: string | null;
  pac_url: string | null;
  ip_checker: string | null;
}

export interface RemoteProxyPayload {
  team_id: number;
  owner_member_id?: number | null;
  proxy_key: string;
  name: string;
  type: RemoteProxyType;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  server?: string | null;
  pac_url?: string | null;
  refresh_url?: string | null;
  ip_checker?: string | null;
  status?: RemoteStatusFlag;
  remark?: string;
}

export interface RemoteProxyCheckResultPayload {
  last_check_status: RemoteProxyCheckStatus;
  exit_ip?: string | null;
  country_code?: string | null;
  country?: string | null;
  region?: string | null;
  asn?: string | null;
  latency_ms?: number | null;
  message?: string;
}
