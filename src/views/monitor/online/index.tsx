import { SystemResourceTable } from '@/components/system-resource-table';
export default function OnlinePage() {
  return (
    <SystemResourceTable
      config={{
        title: '在线用户',
        description: '查看当前在线会话、客户端类型和剩余有效期。',
        endpoint: '/system/monitor/online-users',
        columns: [
          'user_name',
          'credential_type',
          'ip_addr',
          'browser',
          'os',
          'login_at',
          'expires_in',
        ],
      }}
    />
  );
}
