import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  DashboardBrowsingIcon,
  Delete02Icon,
  Edit02Icon,
  MoreVerticalIcon,
  Route02Icon,
  UserMultipleIcon,
  UserRemove01Icon,
  UserSwitchIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { RemoteStatusFlag, RemoteTeamResource } from '../types';

export function TeamActionsMenu({
  record,
  canUpdate,
  canLeave,
  isOwner,
  isUpdating,
  isLeaving,
  isTransferring,
  isDissolving,
  onRename,
  onLeave,
  onTransfer,
  onDissolve,
}: {
  record: RemoteTeamResource;
  canUpdate: boolean;
  canLeave: boolean;
  isOwner: boolean;
  isUpdating: boolean;
  isLeaving: boolean;
  isTransferring: boolean;
  isDissolving: boolean;
  onRename: (record: RemoteTeamResource) => void;
  onLeave: (record: RemoteTeamResource) => void;
  onTransfer: (record: RemoteTeamResource) => void;
  onDissolve: (record: RemoteTeamResource) => void;
}) {
  const canActuallyLeave = canLeave && record.can_leave;
  if (!canUpdate && !canActuallyLeave && !isOwner) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label="打开团队操作">
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canUpdate ? (
            <DropdownMenuItem
              disabled={isUpdating}
              onSelect={() => onRename(record)}
            >
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              重命名
            </DropdownMenuItem>
          ) : null}
          {isOwner ? (
            <DropdownMenuItem
              disabled={isTransferring}
              onSelect={() => onTransfer(record)}
            >
              <HugeiconsIcon icon={UserSwitchIcon} strokeWidth={2} />
              转移所有者
            </DropdownMenuItem>
          ) : null}
          {canActuallyLeave ? (
            <DropdownMenuItem
              variant="destructive"
              disabled={isLeaving}
              onSelect={() => onLeave(record)}
            >
              <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2} />
              退出团队
            </DropdownMenuItem>
          ) : null}
          {isOwner ? (
            <DropdownMenuItem
              variant="destructive"
              disabled={isDissolving}
              onSelect={() => onDissolve(record)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              解散团队
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StatusSwitchCell({
  label,
  status,
  disabled,
  onChange,
}: {
  label: string;
  status: RemoteStatusFlag;
  disabled: boolean;
  onChange: (status: RemoteStatusFlag) => void;
}) {
  const checked = status === '0';
  return (
    <Switch
      size="sm"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onCheckedChange={(nextChecked) => onChange(nextChecked ? '0' : '1')}
    />
  );
}

export function TeamNameCell({ record }: { record: RemoteTeamResource }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium">{record.team_name}</div>
      <div className="truncate text-xs text-muted-foreground">
        {record.team_key}
      </div>
    </div>
  );
}

export function TeamOwnerCell({ record }: { record: RemoteTeamResource }) {
  return (
    <div className="min-w-0">
      <div className="max-w-40 truncate font-medium">
        {record.owner_name || '-'}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <ResourceStat
          icon={UserMultipleIcon}
          value={record.member_count}
          label="Members"
        />
        <ResourceStat
          icon={DashboardBrowsingIcon}
          value={record.environment_count}
          label="Environments"
        />
        <ResourceStat
          icon={Route02Icon}
          value={record.proxy_count}
          label="Proxies"
        />
      </div>
    </div>
  );
}

function ResourceStat({
  icon,
  value,
  label,
}: {
  icon: typeof DashboardBrowsingIcon;
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-1"
      aria-label={`${label}: ${value}`}
      title={`${label}: ${value}`}
    >
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="size-3.5 shrink-0 text-muted-foreground/80"
      />
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
