import { http } from '@/lib/http';
import type {
  StatusFilter,
  SystemRecord,
  SystemResourceConfig,
  SystemResourcePage,
} from './types';

export async function listSystemResources(
  config: SystemResourceConfig,
  params?: {
    page: number;
    pageSize: number;
    search: string;
    status: StatusFilter;
  },
): Promise<SystemResourcePage> {
  const query: Record<string, string | number | boolean> = params
    ? { page: params.page, page_size: params.pageSize }
    : { page_size: 100 };
  if (params?.search) query.keyword = params.search;
  if (params && params.status !== 'all') {
    query.status = params.status === 'enabled' ? '0' : '1';
  }
  const response = await http.get<unknown>(config.endpoint, {
    ...query,
    ...config.queryParams,
  });
  return normalizePage(response.data);
}

function normalizePage(value: unknown): SystemResourcePage {
  if (Array.isArray(value)) {
    const list = value.filter(isRecord);
    return { list, total: list.length };
  }
  if (!isRecord(value)) return { list: [], total: 0 };
  if (Array.isArray(value.list)) {
    const list = value.list.filter(isRecord);
    return {
      list,
      total:
        typeof value.total === 'number' && Number.isFinite(value.total)
          ? value.total
          : list.length,
    };
  }
  return { list: [value], total: 1 };
}

function isRecord(value: unknown): value is SystemRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
