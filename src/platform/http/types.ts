export interface RequestConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  data?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status?: number;
  ok?: boolean;
  code?: number;
  message?: string | null;
  msg?: string | null;
}

export interface BackendResponse<T> {
  code: number;
  message?: string | null;
  msg?: string | null;
  data: T;
}

export type BackendErrorResponse = {
  code?: string | number;
  message?: string | null;
  msg?: string | null;
  details?: unknown;
};

export interface HttpResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: string;
}

export class HttpError extends Error {
  readonly status: number;
  readonly code: string | number;
  readonly details: unknown;

  constructor(
    status: number,
    code: string | number,
    message: string,
    details: unknown = null,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
