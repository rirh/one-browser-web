import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldGroup } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppSettings } from '@/features/browser/contracts';
import {
  useEgressLineSnapshotQuery,
  useRefreshEgressLinesMutation,
} from '@/features/browser/egress/queries';
import {
  chooseRecommendedLine,
  isSelectableLine,
} from '@/features/browser/egress/selection';
import type {
  EgressProbeResult,
  RemoteEgressLine,
} from '@/features/browser/egress/types';
import { type Locale, translateText } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { AlertCircleIcon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

import { useUpdateSettingsMutation } from './queries';

const AUTO_VALUE = 'mode:auto';
const MANUAL_PREFIX = 'manual:';

export function DefaultEgressSettings({ settings }: { settings: AppSettings }) {
  const { locale } = useI18n();
  const snapshotQuery = useEgressLineSnapshotQuery();
  const refreshMutation = useRefreshEgressLinesMutation();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const snapshot = snapshotQuery.data;
  const lines = snapshot?.lines ?? [];
  const probes = snapshot?.probes ?? [];
  const probesById = new Map(probes.map((probe) => [probe.egressId, probe]));
  const recommended = chooseRecommendedLine(lines, probes);
  const selectionValue =
    settings.egressSelectionMode === 'manual' && settings.preferredEgressId
      ? `${MANUAL_PREFIX}${settings.preferredEgressId}`
      : AUTO_VALUE;
  const selectedLineMissing =
    snapshotQuery.isSuccess &&
    settings.egressSelectionMode === 'manual' &&
    Boolean(settings.preferredEgressId) &&
    !lines.some((line) => line.egress_id === settings.preferredEgressId);
  const isRefreshing = snapshotQuery.isFetching || refreshMutation.isPending;

  function saveSelection(value: string) {
    const patch =
      value === AUTO_VALUE
        ? {
            egressSelectionMode: 'auto' as const,
            preferredEgressId: null,
          }
        : {
            egressSelectionMode: 'manual' as const,
            preferredEgressId: value.startsWith(MANUAL_PREFIX)
              ? value.slice(MANUAL_PREFIX.length)
              : null,
          };
    if (patch.egressSelectionMode === 'manual' && !patch.preferredEgressId) {
      return;
    }

    updateSettingsMutation.mutate(patch, {
      onSuccess: () => toast.success('默认线路已更新'),
    });
  }

  function refreshLines() {
    refreshMutation.mutate(undefined, {
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : '线路测速失败');
      },
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <section className="mb-5">
        <h3 className="mb-1 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
          默认线路
        </h3>
        <p className="mb-2 text-[12px] leading-relaxed font-normal text-muted-foreground">
          仅影响新打开的浏览器环境；已运行或已绑定的环境不会自动切换，避免出口
          IP 漂移。
        </p>

        <RadioGroup
          className="gap-0 overflow-hidden rounded-lg border bg-card divide-y divide-border"
          value={selectionValue}
          onValueChange={saveSelection}
          disabled={updateSettingsMutation.isPending}
        >
          <LineChoice
            id="egress-line-auto"
            value={AUTO_VALUE}
            title="自动选择"
            description={recommendedDescription(
              recommended,
              probesById,
              locale,
            )}
            badge={
              <Badge
                variant="outline"
                className="h-auto gap-0.5 border-transparent bg-foreground/10 px-1.5 py-0.5 text-[11px] font-medium text-foreground [&>svg]:size-3!"
              >
                <Zap aria-hidden="true" />
                推荐
              </Badge>
            }
          />

          {lines.map((line) => (
            <LineChoice
              key={line.egress_id}
              id={`egress-line-${line.egress_id}`}
              value={`${MANUAL_PREFIX}${line.egress_id}`}
              title={line.display_name || line.egress_id}
              description={lineDescription(
                line,
                probesById.get(line.egress_id),
                isRefreshing,
                locale,
              )}
              detail={lineMeta(line)}
              disabled={!isSelectableLine(line)}
              badge={
                <Badge
                  variant={lineBadgeVariant(line)}
                  className="h-auto px-1.5 py-0.5 text-[11px] font-medium"
                >
                  {lineStatusText(line)}
                </Badge>
              }
            />
          ))}

          {selectedLineMissing ? (
            <LineChoice
              id="egress-line-missing"
              value={`${MANUAL_PREFIX}${settings.preferredEgressId}`}
              title={settings.preferredEgressId ?? '已选择线路'}
              description="该线路已不在服务器列表中；设置已保留，启动时将明确报错。"
              disabled
              badge={
                <Badge
                  variant="destructive"
                  className="h-auto px-1.5 py-0.5 text-[11px] font-medium"
                >
                  不可用
                </Badge>
              }
            />
          ) : null}
        </RadioGroup>

        {snapshotQuery.isLoading ? <LineSkeletons /> : null}
        {snapshotQuery.isError ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertTitle>暂时无法读取线路</AlertTitle>
            <AlertDescription>
              其他设置不受影响；启动环境时 Server 仍会按权威健康状态选择线路。
            </AlertDescription>
          </Alert>
        ) : null}
      </section>

      <div className="-mx-4 -mb-4 mt-auto flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-3 md:-mx-6 md:-mb-5 md:px-6">
        <FieldDescription className="text-[12px] leading-relaxed font-normal">
          {snapshot?.testedAt
            ? localizedPrefix(
                '最近测试：',
                formatTestedAt(snapshot.testedAt, locale),
                locale,
              )
            : '尚未完成本机数据面测速'}
        </FieldDescription>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-[12px] font-medium"
          disabled={isRefreshing}
          onClick={refreshLines}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {isRefreshing ? '测速中' : '重新测速'}
        </Button>
      </div>
    </div>
  );
}

function LineChoice({
  badge,
  description,
  detail,
  disabled,
  id,
  title,
  value,
}: {
  badge: React.ReactNode;
  description: string;
  detail?: string;
  disabled?: boolean;
  id: string;
  title: string;
  value: string;
}) {
  return (
    <label
      htmlFor={id}
      data-disabled={disabled || undefined}
      data-slot="egress-line-choice"
      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
    >
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className="disabled:opacity-100 data-checked:border-foreground data-checked:bg-foreground dark:data-checked:bg-foreground"
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-[14px] font-normal text-foreground">
          {title}
        </span>
        {badge}
      </span>
      <span className="shrink-0 text-[12px] leading-relaxed font-normal text-muted-foreground">
        {[detail, description].filter(Boolean).join(' · ')}
      </span>
    </label>
  );
}

function LineSkeletons() {
  return (
    <FieldGroup className="gap-1.5" aria-label="正在加载线路">
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center gap-2 px-2.5 py-1.5">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-64 max-w-[75%]" />
        </div>
      ))}
    </FieldGroup>
  );
}

function recommendedDescription(
  line: RemoteEgressLine | undefined,
  probesById: Map<string, EgressProbeResult>,
  locale: Locale,
) {
  if (!line) {
    if (probesById.size > 0) {
      return '本机测速未发现可用线路；启动会明确报错，不会直连或偷换出口。';
    }
    return '按线路健康、容量和环境粘性选择';
  }
  const probe = probesById.get(line.egress_id);
  const metrics = [
    probe?.success && probe.latencyMs !== null
      ? `${translateText('本机', locale)} ${probe.latencyMs} ms`
      : null,
    loadText(line.load_percent, locale),
  ].filter(Boolean);
  return localizedPrefix(
    '当前推荐：',
    `${line.display_name || line.egress_id}${metrics.length ? ` · ${metrics.join(' · ')}` : ''}`,
    locale,
  );
}

function lineDescription(
  line: RemoteEgressLine,
  probe: EgressProbeResult | undefined,
  isRefreshing: boolean,
  locale: Locale,
) {
  const metrics = [];
  if (isRefreshing && isSelectableLine(line)) {
    metrics.push(translateText('测速中', locale));
  } else if (probe?.success && probe.latencyMs !== null) {
    metrics.push(`${translateText('本机', locale)} ${probe.latencyMs} ms`);
  } else if (probe && probe.successfulSamples > 0) {
    metrics.push(translateText('连接波动', locale));
  } else if (probe) {
    metrics.push(translateText('本机不可达', locale));
  } else if (isSelectableLine(line)) {
    metrics.push(translateText('等待本机测速', locale));
  }
  const load = loadText(line.load_percent, locale);
  if (load) metrics.push(load);
  return metrics.join(' · ') || translateText('暂无质量数据', locale);
}

function lineMeta(line: RemoteEgressLine) {
  return [line.region, line.carrier].filter(Boolean).join(' · ');
}

function loadText(loadPercent: number | null, locale: Locale) {
  if (loadPercent === null) return null;
  const label = translateText('负载', locale);
  if (loadPercent >= 80) {
    return `${label} ${loadPercent}%${localizedSuffix('（繁忙）', locale)}`;
  }
  if (loadPercent >= 60) {
    return `${label} ${loadPercent}%${localizedSuffix('（较忙）', locale)}`;
  }
  return `${label} ${loadPercent}%`;
}

function localizedPrefix(source: string, value: string, locale: Locale) {
  const separator = locale === 'en-US' ? ' ' : '';
  return `${translateText(source, locale)}${separator}${value}`;
}

function localizedSuffix(source: string, locale: Locale) {
  const separator = locale === 'en-US' ? ' ' : '';
  return `${separator}${translateText(source, locale)}`;
}

function lineStatusText(line: RemoteEgressLine) {
  if ((line.load_percent ?? 0) >= 100) return '容量已满';
  if (line.status === 'healthy') {
    return (line.load_percent ?? 0) >= 80 ? '繁忙' : '正常';
  }
  if (line.status === 'degraded') return '降级';
  if (line.status === 'draining') return '维护中';
  if (line.status === 'init') return '初始化';
  return '不可用';
}

function lineBadgeVariant(line: RemoteEgressLine) {
  if (line.status === 'healthy' && (line.load_percent ?? 0) < 80) {
    return 'success' as const;
  }
  if (line.status === 'degraded' || line.status === 'healthy') {
    return 'secondary' as const;
  }
  if (line.status === 'unhealthy') return 'destructive' as const;
  return 'outline' as const;
}

function formatTestedAt(value: string, locale: Locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? translateText('刚刚', locale)
    : date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
}
