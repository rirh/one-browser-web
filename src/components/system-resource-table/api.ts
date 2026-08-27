import { http } from '@/lib/http';
import type { SystemRecord, SystemResourceConfig } from './types';

export async function listSystemResources(config: SystemResourceConfig) {
  const response = await http.get<unknown>(config.endpoint, { page_size: 100 });
  return normalizeRecords(response.data);
}

function normalizeRecords(value: unknown): SystemRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  if (Array.isArray(value.list)) return value.list.filter(isRecord);
  return [value];
}

function isRecord(value: unknown): value is SystemRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
