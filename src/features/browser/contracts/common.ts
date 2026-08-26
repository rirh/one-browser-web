export type ApiEnvelope<T> =
  | { code: 0 | 200 | 201; msg: 'success'; data: T }
  | { code: number; msg: string; data: null };

export type AppErrorCode = 40001 | 40401 | 40901 | 42301 | 50101 | 50001;

export type SortOrder = 'asc' | 'desc';

export interface AppErrorPayload {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}
