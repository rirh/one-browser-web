import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { RuntimeProfile } from '@/features/browser/contracts';
import { refreshWithSuccessToast } from '@/features/browser/refresh';
import { Refresh01Icon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { BrowserDataTable } from '../components/data-table';
import { MetricCard } from '../components/metric-card';
import {
  ProxyStatusBadge,
  RuntimeStatusBadge,
} from '../components/status-badge';
import {
  useCloseAllProfilesMutation,
  useCloseProfileMutation,
  useRuntimeQuery,
} from './queries';

export function RuntimePage() {
  const runtimeQuery = useRuntimeQuery();
  const closeProfileMutation = useCloseProfileMutation();
  const closeAllProfilesMutation = useCloseAllProfilesMutation();
  const runtime = runtimeQuery.data ?? [];
  const proxyOkCount = runtime.filter(
    (item) => item.proxyStatus.status === 'ok',
  ).length;

  const columns = useMemo<ColumnDef<RuntimeProfile>[]>(
    () => [
      {
        accessorKey: 'profileId',
        header: '环境',
        cell: ({ row }) => (
          <div className="flex min-w-40 flex-col">
            <span className="truncate font-medium">
              {row.original.profileId}
            </span>
            <span className="truncate text-muted-foreground">
              {row.original.userDataDir}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => <RuntimeStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'pid',
        header: 'PID',
        cell: ({ row }) => row.original.pid ?? '-',
      },
      {
        accessorKey: 'debugPort',
        header: '调试端口',
        cell: ({ row }) => row.original.debugPort ?? '-',
      },
      {
        accessorKey: 'proxyStatus',
        header: '代理',
        cell: ({ row }) => (
          <ProxyStatusBadge status={row.original.proxyStatus.status} />
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              closeProfileMutation.mutate({ profileId: row.original.profileId })
            }
          >
            <HugeiconsIcon
              icon={StopIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            关闭
          </Button>
        ),
      },
    ],
    [closeProfileMutation],
  );

  return (
    <section className="flex flex-col gap-4 p-3 lg:p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          title="运行中"
          value={runtime.length}
          description="当前活动环境"
        />
        <MetricCard
          title="代理正常"
          value={proxyOkCount}
          description="运行态检测正常"
        />
        <MetricCard
          title="调试端口"
          value={runtime.filter((item) => item.debugPort).length}
          description="自动化连接入口"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>运行中</CardTitle>
          <CardDescription>查看并关闭当前活动的浏览器窗口。</CardDescription>
          <CardAction className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void refreshWithSuccessToast(runtimeQuery.refetch)}
            >
              <HugeiconsIcon
                icon={Refresh01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              刷新
            </Button>
            <Button
              variant="destructive"
              onClick={() => closeAllProfilesMutation.mutate()}
              disabled={!runtime.length}
            >
              <HugeiconsIcon
                icon={StopIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              全部关闭
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <BrowserDataTable
            columns={columns}
            data={runtime}
            emptyTitle="暂无运行环境"
            emptyDescription="打开环境后，可在这里查看运行状态。"
            getRowId={(profile) => profile.profileId}
            isLoading={runtimeQuery.isLoading}
          />
        </CardContent>
      </Card>
    </section>
  );
}
