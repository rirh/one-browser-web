export type SystemRecord = Record<string, unknown>;

export type SystemResourceConfig = {
  columns: string[];
  description: string;
  endpoint: string;
  queryParams?: Record<string, string | number | boolean>;
  serverPagination?: boolean;
  title: string;
};

export type SystemResourcePage = {
  list: SystemRecord[];
  total: number;
};

export type StatusFilter = 'all' | 'enabled' | 'disabled';
