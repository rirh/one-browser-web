import { SystemResourceTable } from '@/components/system-resource-table';
export default function HealthPage() {
  return (
    <SystemResourceTable
      config={{
        title: '服务监控',
        description: '查看 Backend、PostgreSQL、Redis 和运行环境状态。',
        endpoint: '/system/monitor/health',
        columns: [
          'status',
          'service',
          'environment',
          'postgres',
          'sea_orm',
          'redis',
          'updated_at',
        ],
      }}
    />
  );
}
