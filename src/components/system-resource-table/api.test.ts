import { afterEach, expect, it, vi } from 'vitest';
import { http } from '@/lib/http';
import { listSystemResources } from './api';

vi.mock('@/lib/http', () => ({ http: { get: vi.fn() } }));
afterEach(() => vi.resetAllMocks());

it('keeps the target team with pagination, search and status filters', async () => {
  vi.mocked(http.get).mockResolvedValue({
    data: { list: [], total: 0 },
  } as never);
  await listSystemResources(
    {
      endpoint: '/browser/roles',
      title: '角色管理',
      description: '',
      columns: [],
      serverPagination: true,
      queryParams: { team_id: 7 },
    },
    { page: 2, pageSize: 15, search: '操作员', status: 'enabled' },
  );
  expect(http.get).toHaveBeenCalledWith('/browser/roles', {
    team_id: 7,
    page: 2,
    page_size: 15,
    keyword: '操作员',
    status: '0',
  });
  await listSystemResources(
    {
      endpoint: '/browser/roles',
      title: '角色管理',
      description: '',
      columns: [],
      serverPagination: true,
      queryParams: { team_id: 8 },
    },
    { page: 1, pageSize: 15, search: '', status: 'all' },
  );
  expect(http.get).toHaveBeenLastCalledWith('/browser/roles', {
    team_id: 8,
    page: 1,
    page_size: 15,
  });
});
