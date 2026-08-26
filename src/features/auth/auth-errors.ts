import { HttpError } from '@/platform/http';

export function isUnauthorizedAuthError(error: unknown) {
  if (error instanceof HttpError) {
    return error.status === 401 || error.code === 401 || error.code === '401';
  }
  if (!error || typeof error !== 'object') return false;
  const record = error as Record<string, unknown>;
  return record.status === 401 || record.code === 401 || record.code === '401';
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}
