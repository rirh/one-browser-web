import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { SweepShine } from '@/components/ui/sweep-shine';
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
import { useUpdateSettingsMutation } from '@/features/browser/settings/queries';
import { cn } from '@/lib/utils';
import { desktopInvoke, isTauriRuntime } from '@/platform/desktop';
import { ServerStack03Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type ReactNode, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const AUTO_EGRESS_VALUE = 'mode:auto';
const MANUAL_EGRESS_PREFIX = 'manual:';
const FAST_LATENCY_MS = 100;
const ACCEPTABLE_LATENCY_MS = 250;
const EMPTY_EGRESS_LINES: RemoteEgressLine[] = [];
const EMPTY_EGRESS_PROBES: EgressProbeResult[] = [];

export function EgressQuickSwitch({
  settings,
}: {
  settings: AppSettings | undefined;
}) {
  const snapshotQuery = useEgressLineSnapshotQuery();
  const refreshMutation = useRefreshEgressLinesMutation();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const snapshot = snapshotQuery.data;
  const lines = snapshot?.lines ?? EMPTY_EGRESS_LINES;
  const probes = snapshot?.probes ?? EMPTY_EGRESS_PROBES;
  const probesById = useMemo(
    () => new Map(probes.map((probe) => [probe.egressId, probe])),
    [probes],
  );
  const recommended = chooseRecommendedLine(lines, probes);
  const recommendedEgressId = recommended?.egress_id ?? null;
  const selectedValue =
    settings?.egressSelectionMode === 'manual' && settings.preferredEgressId
      ? `${MANUAL_EGRESS_PREFIX}${settings.preferredEgressId}`
      : AUTO_EGRESS_VALUE;
  const activeLine =
    settings?.egressSelectionMode === 'manual'
      ? lines.find((line) => line.egress_id === settings.preferredEgressId)
      : recommended;
  const activeProbe = activeLine
    ? probesById.get(activeLine.egress_id)
    : undefined;
  const isRetesting = snapshotQuery.isFetching || refreshMutation.isPending;

  useEffect(() => {
    if (!isTauriRuntime() || !snapshot || !settings) {
      return;
    }

    void desktopInvoke('sync_tray_egress_lines', {
      request: {
        lines: snapshot.lines.map((line) => ({
          egressId: line.egress_id,
          displayName: line.display_name || line.egress_id,
          latencyMs: probesById.get(line.egress_id)?.latencyMs ?? null,
          selectable: isSelectableLine(line),
        })),
        egressSelectionMode: settings.egressSelectionMode,
        preferredEgressId: settings.preferredEgressId,
        recommendedEgressId,
      },
    }).catch((error) => {
      console.warn('[tray-egress] failed to sync quick switch menu', error);
    });
  }, [probesById, recommendedEgressId, settings, snapshot]);

  function saveSelection(value: string) {
    const patch =
      value === AUTO_EGRESS_VALUE
        ? {
            egressSelectionMode: 'auto' as const,
            preferredEgressId: null,
          }
        : {
            egressSelectionMode: 'manual' as const,
            preferredEgressId: value.startsWith(MANUAL_EGRESS_PREFIX)
              ? value.slice(MANUAL_EGRESS_PREFIX.length)
              : null,
          };
    if (patch.egressSelectionMode === 'manual' && !patch.preferredEgressId) {
      return;
    }

    updateSettingsMutation.mutate(patch, {
      onSuccess: () => toast.success('默认节点已切换'),
    });
  }

  return (
    <HoverCard
      openDelay={120}
      closeDelay={120}
      onOpenChange={(open) => {
        if (open && snapshotQuery.isStale) {
          void snapshotQuery.refetch();
        }
      }}
    >
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label="快速切换节点"
          className="inline-flex h-full min-w-0 max-w-48 items-center gap-0.5 rounded-sm px-0.5 font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50"
          disabled={updateSettingsMutation.isPending}
        >
          <HugeiconsIcon
            icon={ServerStack03Icon}
            strokeWidth={2}
            className="size-2.5 shrink-0"
          />
          <ActiveEgressLabel
            line={activeLine}
            probe={activeProbe}
            isTesting={isRetesting}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={0}
        className="w-60 rounded-md p-0.5 text-[0.6875rem] leading-none"
      >
        <div className="flex h-6 items-center justify-between gap-2 border-b border-border/50 px-1.5 font-medium text-muted-foreground">
          <span className="truncate">快速切换节点</span>
          <button
            type="button"
            aria-busy={isRetesting}
            className="h-5 shrink-0 rounded-sm px-1 text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:opacity-50"
            disabled={isRetesting}
            onClick={(event) => {
              event.preventDefault();
              refreshMutation.mutate(undefined);
            }}
          >
            <SweepShine active={isRetesting}>
              {isRetesting ? '测速中' : '重新测速'}
            </SweepShine>
          </button>
        </div>
        <div className="flex flex-col py-0.5" role="radiogroup">
          <EgressOption
            checked={selectedValue === AUTO_EGRESS_VALUE}
            onSelect={() => saveSelection(AUTO_EGRESS_VALUE)}
          >
            <EgressMenuLabel
              name="自动选择"
              probe={
                recommended ? probesById.get(recommended.egress_id) : undefined
              }
              selectable={Boolean(recommended && isSelectableLine(recommended))}
              isTesting={isRetesting}
              detail={
                recommended
                  ? recommended.display_name || recommended.egress_id
                  : undefined
              }
            />
          </EgressOption>
          {lines.map((line) => (
            <EgressOption
              key={line.egress_id}
              checked={
                selectedValue === `${MANUAL_EGRESS_PREFIX}${line.egress_id}`
              }
              disabled={!isSelectableLine(line)}
              onSelect={() =>
                saveSelection(`${MANUAL_EGRESS_PREFIX}${line.egress_id}`)
              }
            >
              <EgressMenuLabel
                name={line.display_name || line.egress_id}
                probe={probesById.get(line.egress_id)}
                selectable={isSelectableLine(line)}
                isTesting={isRetesting}
              />
            </EgressOption>
          ))}
        </div>
        {snapshotQuery.isError ? (
          <div className="px-1.5 py-1 text-destructive">暂时无法读取节点</div>
        ) : null}
        {snapshotQuery.isSuccess && lines.length === 0 ? (
          <div className="px-1.5 py-1 text-muted-foreground">暂无可用节点</div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

function EgressOption({
  checked,
  children,
  disabled,
  onSelect,
}: {
  checked: boolean;
  children: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className="flex h-6 min-w-0 items-center gap-1 rounded-sm px-1.5 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-45"
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
      <span className="flex size-3 shrink-0 items-center justify-center">
        {checked ? (
          <HugeiconsIcon
            aria-hidden="true"
            icon={Tick02Icon}
            strokeWidth={2}
            className="size-3"
          />
        ) : null}
      </span>
    </button>
  );
}

function EgressMenuLabel({
  detail,
  isTesting,
  name,
  probe,
  selectable,
}: {
  detail?: string;
  isTesting: boolean;
  name: string;
  probe: EgressProbeResult | undefined;
  selectable: boolean;
}) {
  const online = isNodeOnline(selectable, probe);

  return (
    <SweepShine
      active={isTesting}
      className="flex min-w-0 flex-1 items-center gap-1.5"
    >
      <NodeStatusDot online={online} />
      <span className="min-w-0 flex-1 truncate">
        {name}
        {detail ? (
          <span className="ml-1 text-muted-foreground">· {detail}</span>
        ) : null}
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums',
          latencyToneClass(probe, selectable),
        )}
      >
        {latencyLabel(probe, selectable)}
      </span>
    </SweepShine>
  );
}

function ActiveEgressLabel({
  isTesting,
  line,
  probe,
}: {
  isTesting: boolean;
  line: RemoteEgressLine | undefined;
  probe: EgressProbeResult | undefined;
}) {
  if (isTesting) {
    return <SweepShine className="truncate">节点测速中...</SweepShine>;
  }
  if (!line) {
    return (
      <>
        <NodeStatusDot online={false} />
        <span className="truncate">选择节点</span>
      </>
    );
  }

  const selectable = isSelectableLine(line);
  const name = line.display_name || line.egress_id;
  return (
    <>
      <NodeStatusDot online={isNodeOnline(selectable, probe)} />
      <span className="truncate">{name}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums',
          latencyToneClass(probe, selectable),
        )}
      >
        {latencyLabel(probe, selectable)}
      </span>
    </>
  );
}

function NodeStatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'size-1.25 shrink-0 rounded-full',
        online
          ? 'bg-success ring-1 ring-success/20'
          : 'bg-muted-foreground/45 ring-1 ring-muted-foreground/10',
      )}
      title={online ? '在线' : '离线'}
    >
      <span className="sr-only">{online ? '在线' : '离线'}</span>
    </span>
  );
}

function isNodeOnline(
  selectable: boolean,
  probe: EgressProbeResult | undefined,
) {
  return selectable && probe?.success !== false;
}

function latencyToneClass(
  probe: EgressProbeResult | undefined,
  selectable: boolean,
) {
  if (
    !selectable ||
    !probe?.success ||
    probe.latencyMs === null ||
    !Number.isFinite(probe.latencyMs)
  ) {
    return 'text-muted-foreground';
  }
  if (probe.latencyMs <= FAST_LATENCY_MS) {
    return 'text-success';
  }
  if (probe.latencyMs <= ACCEPTABLE_LATENCY_MS) {
    return 'text-warning';
  }
  return 'text-destructive';
}

function latencyLabel(probe: EgressProbeResult | undefined, selectable = true) {
  if (!selectable) {
    return '不可用';
  }
  if (probe?.success && probe.latencyMs !== null) {
    return `${probe.latencyMs} ms`;
  }
  if (probe && !probe.success) {
    return '超时';
  }
  return '未测速';
}
