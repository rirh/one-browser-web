import { SystemResourceTable } from '@/components/system-resource-table';
export default function JobPage() {
  return (
    <SystemResourceTable
      config={{
        title: '定时任务',
        description: '查看调度任务、Cron 表达式和运行状态。',
        endpoint: '/system/monitor/jobs',
        columns: [
          'job_id',
          'job_name',
          'job_group',
          'invoke_target',
          'cron_expression',
          'status',
          'updated_at',
        ],
      }}
    />
  );
}
