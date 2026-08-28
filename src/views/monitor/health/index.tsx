import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Cpu, HardDrive, MemoryStick, RefreshCcw } from 'lucide-react';
import { useMemo } from 'react';

import { DependencyStatusCard } from './components/dependency-status-card';
import { ProcessInfoCard } from './components/process-info-card';
import { QuickStatCard } from './components/quick-stat-card';
import { ServerInfoCard } from './components/server-info-card';
import {
  formatBytes,
  formatDateTime,
  formatLoad,
  formatPercent,
  safeNumber,
} from './format';
import { useHealthStream } from './use-health-stream';

export default function HealthPage() {
  const stream = useHealthStream();
  const status = stream.snapshot;
  const load = status?.system.load_average;
  const memory = status?.system.memory;
  const storage = status?.system.storage;

  const lastUpdated = useMemo(
    () =>
      stream.lastUpdated ? formatDateTime(stream.lastUpdated) : '尚未获取',
    [stream.lastUpdated],
  );

  const quickStats = useMemo(
    () => [
      {
        label: 'CPU',
        icon: Cpu,
        value: load?.usage_percent ?? 0,
        formatValue: formatPercent,
        hint: load
          ? `Load ${formatLoad(load.one)} / ${formatLoad(load.five)} / ${formatLoad(load.fifteen)}`
          : '当前平台未提供 CPU 指标',
        percent: safeNumber(load?.usage_percent),
      },
      {
        label: '内存',
        icon: MemoryStick,
        value: memory?.usage_percent ?? 0,
        formatValue: formatPercent,
        hint: memory
          ? `${formatBytes(memory.used_bytes)} / ${formatBytes(memory.total_bytes)}`
          : '当前平台未提供内存指标',
        percent: safeNumber(memory?.usage_percent),
      },
      {
        label: '存储',
        icon: HardDrive,
        value: storage?.usage_percent ?? 0,
        formatValue: formatPercent,
        hint: storage
          ? `${formatBytes(storage.used_bytes)} / ${formatBytes(storage.total_bytes)}`
          : '当前平台未提供存储指标',
        percent: safeNumber(storage?.usage_percent),
      },
    ],
    [load, memory, storage],
  );

  return (
    <main className="min-h-0 flex-1 overflow-auto p-3 lg:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="sr-only">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              服务监控
            </h1>
            <p className="text-muted-foreground text-sm">
              聚焦后台服务器程序，CPU / 内存 / 存储。
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <span
              className={`ml-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stream.isConnected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              <span
                className={`inline-block size-2.5 rounded-full ${stream.isConnected ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'}`}
              />
              {stream.isConnected ? '实时' : '已断开，等待重连'}
            </span>
            {!stream.isConnected ? (
              <Button
                type="button"
                variant="outline"
                onClick={stream.reconnect}
                disabled={stream.isLoading}
                className="md:w-auto"
              >
                {stream.isLoading ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    连接中
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 size-4" />
                    重新连接
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {!stream.isConnected && stream.error ? (
          <Card className="border-destructive/40 bg-destructive/10 text-destructive">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">实时流连接异常</CardTitle>
              <CardDescription className="text-destructive/80">
                {stream.error || '请稍后重试或刷新页面。'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {stream.isLoading && !status ? (
          <div className="text-muted-foreground flex min-h-64 items-center justify-center gap-2 text-sm">
            <Spinner /> 正在获取监控数据
          </div>
        ) : status ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-3">
                {quickStats.map((stat) => (
                  <QuickStatCard
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    hint={stat.hint}
                    percent={stat.percent}
                    formatValue={stat.formatValue}
                    className="h-full"
                  />
                ))}
              </div>
              <ServerInfoCard
                server={status.server}
                lastUpdated={lastUpdated}
              />
            </section>
            <DependencyStatusCard status={status} />
            <section>
              <ProcessInfoCard process={status.process} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
