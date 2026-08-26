export type RemoteStatusFlag = '0' | '1';
export type RemotePermissionType = 'M' | 'C' | 'F';
export type RemotePermissionScope = 'T' | 'G';

export interface RemoteListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
}

export interface RemotePageResponse<T> {
  list: T[];
  total: number;
}

export interface RemoteBatchDeleteResult {
  deleted: number;
}

export interface RemotePermissionResource {
  permission_id: number;
  permission_name: string;
  parent_id: number | null;
  order_num: number;
  path: string;
  permission_type: RemotePermissionType;
  permission_scope: RemotePermissionScope;
  visible: RemoteStatusFlag;
  status: RemoteStatusFlag;
  permission_code: string | null;
  icon: string;
  created_at: string;
  updated_at: string | null;
  remark: string;
  locked: boolean;
}

export interface RemotePermissionPayload {
  permission_name: string;
  parent_id: number | null;
  order_num?: number;
  path: string;
  permission_type: RemotePermissionType;
  permission_scope: RemotePermissionScope;
  visible: RemoteStatusFlag;
  status: RemoteStatusFlag;
  permission_code: string | null;
  icon: string;
  remark: string;
}

export interface RemotePermissionBatchDeletePayload {
  permission_ids: number[];
}

export interface RemotePermissionOrderUpdate {
  record: RemotePermissionResource;
  order_num: number;
}
