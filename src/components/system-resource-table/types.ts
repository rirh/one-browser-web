export type SystemRecord = Record<string, unknown>;

export type SystemResourceConfig = {
  columns: string[];
  description: string;
  endpoint: string;
  title: string;
};

export type StatusFilter = 'all' | 'enabled' | 'disabled';
