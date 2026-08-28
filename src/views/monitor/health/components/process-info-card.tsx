import { NumberTicker } from '@/components/number-ticker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ServerCog } from 'lucide-react';

import {
  formatBytes,
  formatDuration,
  formatPercent,
  truncateCommit,
} from '../format';
import type { HealthSnapshot } from '../types';
import { InfoRow } from './info-row';

export function ProcessInfoCard({
  process,
}: {
  process: HealthSnapshot['process'];
}) {
  const processSummary = [
    {
      label: '版本号',
      value: process.version?.trim() || 'N/A',
      align: 'left' as const,
      valueClassName: 'font-mono text-sm',
    },
    {
      label: 'Commit',
      value:
        process.commit && process.commit !== 'unknown' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default font-mono text-xs">
                  {truncateCommit(process.commit)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-mono">{process.commit}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          '-'
        ),
      align: 'left' as const,
    },
    { label: 'PID', value: process.pid > 0 ? `#${process.pid}` : '-' },
    {
      label: '进程运行时长',
      value: formatDuration(process.uptime_seconds),
    },
    {
      label: '运行时',
      value: `${process.runtime} ${process.runtime_version}`,
    },
  ];

  const metrics = [
    {
      label: '进程 CPU 占用',
      value: process.cpu_usage_percent,
      formatValue: formatPercent,
    },
    {
      label: 'RSS 内存',
      value: process.rss_bytes,
      formatValue: formatBytes,
    },
    {
      label: '峰值 RSS',
      value: process.peak_rss_bytes,
      formatValue: formatBytes,
    },
    {
      label: '内存占用',
      value: process.memory_footprint_bytes,
      formatValue: formatBytes,
    },
    {
      label: '虚拟内存',
      value: process.virtual_memory_bytes,
      formatValue: formatBytes,
    },
    {
      label: '数据段',
      value: process.data_bytes,
      formatValue: formatBytes,
    },
    {
      label: '线程数',
      value: process.threads,
      formatValue: formatInteger,
    },
    {
      label: '文件描述符',
      value: process.fd_count,
      formatValue: formatInteger,
    },
  ];

  return (
    <Card className="h-full border-0 shadow-none ring-0">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <ServerCog className="text-muted-foreground size-5" />
          后端进程
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          展示部署版本 / Commit 以及 Rust 进程的 CPU、内存与运行资源。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:flex sm:gap-2">
        <div className="bg-muted/10 min-w-[300px] rounded-2xl p-4">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            部署信息
          </p>
          <div className="mt-3 space-y-3">
            {processSummary.map((item) => (
              <InfoRow
                key={item.label}
                label={item.label}
                value={item.value}
                align={item.align}
                valueClassName={item.valueClassName}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            运行指标
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <InfoRow
                key={metric.label}
                label={metric.label}
                value={
                  typeof metric.value === 'number' ? (
                    <NumberTicker
                      value={metric.value}
                      formatValue={metric.formatValue}
                      className="text-foreground font-semibold"
                      snap={0.1}
                    />
                  ) : (
                    '-'
                  )
                }
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatInteger(value: number) {
  return Math.max(0, Math.round(value)).toString();
}
