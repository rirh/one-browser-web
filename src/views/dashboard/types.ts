export type DashboardMetric = {
  key: string;
  title: string;
  value: number;
  secondary_label: string;
  secondary_value: number;
  href: string;
};

export type DashboardChartPoint = {
  key: string;
  label: string;
  value: number;
};

export type DashboardActivityPoint = {
  date: string;
  teams?: number;
  environments?: number;
  proxies?: number;
};

export type DashboardOverview = {
  generated_at: string;
  metrics: DashboardMetric[];
  charts: {
    resource_distribution: DashboardChartPoint[];
    environment_status: DashboardChartPoint[];
    proxy_status: DashboardChartPoint[];
    activity: DashboardActivityPoint[];
  };
};
