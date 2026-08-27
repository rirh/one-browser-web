import { SystemResourceTable } from '@/components/system-resource-table';
export default function LoginLogPage() {
  return (
    <SystemResourceTable
      config={{
        title: '登录日志',
        description: '查看用户登录结果、地址和登录时间。',
        endpoint: '/system/login-logs',
        columns: [
          'info_id',
          'user_name',
          'ip_addr',
          'status',
          'msg',
          'login_at',
        ],
      }}
    />
  );
}
