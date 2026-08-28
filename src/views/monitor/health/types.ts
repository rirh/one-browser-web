export type HealthSnapshot = {
  status: string;
  service: string;
  environment: string;
  postgres: string;
  sea_orm: string;
  redis: string;
  updated_at: string;
  server: {
    hostname: string;
    os: string;
    arch: string;
    uptime_seconds: number | null;
    boot_time: string | null;
    current_time: string;
  };
  process: {
    pid: number;
    version: string;
    commit: string;
    runtime: string;
    runtime_version: string;
    started_at: string;
    uptime_seconds: number;
    cpu_usage_percent: number | null;
    cpu_time_seconds: number | null;
    user_cpu_seconds: number | null;
    system_cpu_seconds: number | null;
    rss_bytes: number | null;
    peak_rss_bytes: number | null;
    memory_footprint_bytes: number | null;
    virtual_memory_bytes: number | null;
    data_bytes: number | null;
    threads: number | null;
    fd_count: number | null;
    fd_limit: number | null;
    executable: string;
  };
  system: {
    load_average: {
      one: number;
      five: number;
      fifteen: number;
      cores: number;
      usage_percent: number;
    } | null;
    memory: {
      total_bytes: number;
      available_bytes: number;
      used_bytes: number;
      usage_percent: number;
    } | null;
    storage: {
      path: string;
      total_bytes: number | null;
      used_bytes: number | null;
      usage_percent: number | null;
    };
  };
};
