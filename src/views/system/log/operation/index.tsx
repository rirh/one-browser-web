import { SystemResourceTable } from '@/components/system-resource-table';
export default function OperationLogPage() {
  return (
    <SystemResourceTable
      config={{
        title: '操作日志',
        description: '查看系统操作、请求结果和执行耗时。',
        endpoint: '/system/operation-logs',
        columns: [
          'oper_id',
          'title',
          'request_method',
          'oper_name',
          'oper_ip',
          'status',
          'operated_at',
          'cost_time',
        ],
      }}
    />
  );
}
