import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MonitorSmartphone } from 'lucide-react';

import { formatDateTime, formatDuration } from '../format';
import type { HealthSnapshot } from '../types';
import { InfoRow } from './info-row';

export function ServerInfoCard({
  server,
  lastUpdated,
}: {
  server: HealthSnapshot['server'];
  lastUpdated: string;
}) {
  const rows = [
    { label: '服务器名称', value: server.hostname || '-' },
    { label: '服务器系统', value: `${server.os} · ${server.arch}` },
    {
      label: '服务器运行时长',
      value: formatDuration(server.uptime_seconds),
    },
    { label: '当前时间', value: formatDateTime(server.current_time) },
  ];

  return (
    <Card className="dark:border-border/40 h-full border-none shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MonitorSmartphone className="text-muted-foreground size-5" />
          服务器信息
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          服务器级别的信息（区别于进程运行时），最近更新：{lastUpdated}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full flex-col gap-4 text-sm">
        <div className="grid grid-cols-1 gap-3">
          {rows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
