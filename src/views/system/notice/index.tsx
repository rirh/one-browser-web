import { SystemResourceTable } from '@/components/system-resource-table';
export default function NoticePage() {
  return (
    <SystemResourceTable
      config={{
        title: '通知管理',
        description: '查看系统通知、公告类型和发布状态。',
        endpoint: '/system/notices',
        columns: [
          'notice_id',
          'notice_title',
          'notice_type',
          'status',
          'created_by',
          'created_at',
        ],
      }}
    />
  );
}
