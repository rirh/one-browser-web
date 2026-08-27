import { SystemResourceTable } from '@/components/system-resource-table';
export default function UserPage() {
  return (
    <SystemResourceTable
      config={{
        title: '用户管理',
        description: '查看 One Browser 用户、账号状态和系统角色。',
        endpoint: '/system/users',
        columns: [
          'user_id',
          'user_name',
          'nick_name',
          'email',
          'status',
          'created_at',
        ],
      }}
    />
  );
}
