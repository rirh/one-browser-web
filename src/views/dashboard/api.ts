import { http } from '@/lib/http';

import type { DashboardOverview } from './types';

export async function getDashboardOverview() {
  const response = await http.get<DashboardOverview>('/dashboard/overview');
  return response.data;
}
