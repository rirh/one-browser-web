import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CountryFlag,
  resolveCountryCode,
} from '@/features/browser/components/country-flag';
import { normalizeProfileGroup } from '@/features/browser/profiles/group-utils';
import { formatDateTimeTitle, formatDisplayDateTime } from '@/lib/date-time';
import {
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreVerticalIcon,
  StopIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import type { RemoteEnvironmentListItem } from '../types';

export function EnvironmentCell({
  canEdit,
  environment,
  onEdit,
}: {
  canEdit: boolean;
  environment: RemoteEnvironmentListItem;
  onEdit: (environmentId: number) => void;
}) {
  return (
    <div className="flex min-w-56 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-2">
        {canEdit ? (
          <button
            type="button"
            className="min-w-0 truncate text-left font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            title={environment.name}
            aria-label={`编辑环境 ${environment.name}`}
            onClick={() => onEdit(environment.environment_id)}
          >
            {environment.name}
          </button>
        ) : (
          <span
            className="min-w-0 truncate font-medium"
            title={environment.name}
          >
            {environment.name}
          </span>
        )}
        <EnvironmentRuntimeBadge environment={environment} />
      </div>
      <span
        className="truncate text-muted-foreground"
        title={formatDateTimeTitle(environment.last_open_at)}
      >
        上次启动：
        {formatDisplayDateTime(environment.last_open_at, '没有启动时间')}
      </span>
    </div>
  );
}

export function ProxyCell({
  canEdit,
  environment,
  onEdit,
}: {
  canEdit: boolean;
  environment: RemoteEnvironmentListItem;
  onEdit: (environmentId: number) => void;
}) {
  const code = resolveCountryCode(
    environment.proxy_last_check_country_code,
    environment.proxy_last_check_country,
  );
  const locationCode =
    code ?? environment.proxy_last_check_country?.trim() ?? '未知国家';
  const location = environment.proxy_last_check_exit_ip
    ? `${locationCode} (${environment.proxy_last_check_exit_ip})`
    : locationCode;
  const locationTitle = [
    environment.proxy_last_check_country,
    environment.proxy_last_check_region,
    environment.proxy_last_check_exit_ip,
  ]
    .filter(Boolean)
    .join(' / ');
  return (
    <div className="flex min-w-44 flex-col gap-1">
      {canEdit ? (
        <button
          type="button"
          className="w-full min-w-0 truncate text-left font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          title={environment.proxy_name ?? undefined}
          onClick={() => onEdit(environment.environment_id)}
        >
          {environment.proxy_name || proxyLabel(environment.proxy_type)}
        </button>
      ) : (
        <span className="w-full min-w-0 truncate font-medium">
          {environment.proxy_name || proxyLabel(environment.proxy_type)}
        </span>
      )}
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <CountryFlag
          code={code}
          country={environment.proxy_last_check_country}
        />
        <span className="truncate" title={locationTitle || location}>
          {environment.proxy_id ? location : '未绑定代理'}
        </span>
      </div>
    </div>
  );
}

export function CreatedAtCell({
  environment,
}: {
  environment: RemoteEnvironmentListItem;
}) {
  const group = normalizeProfileGroup(environment.group_key);
  return (
    <div className="flex min-w-32 flex-col items-start justify-center gap-1 text-left">
      <span
        className="tabular-nums"
        title={formatDateTimeTitle(environment.created_at)}
      >
        {formatDisplayDateTime(environment.created_at)}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="cursor-help text-xs text-muted-foreground tabular-nums"
            tabIndex={0}
          >
            {environment.chromium_version || '跟随最新'}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          {environment.chromium_version
            ? `当前环境使用浏览器构建 ${environment.chromium_version}`
            : '当前环境跟随最新浏览器构建版本'}
        </TooltipContent>
      </Tooltip>
      {group ? (
        <span
          className="max-w-28 truncate text-xs text-muted-foreground"
          title={group}
        >
          {group}
        </span>
      ) : null}
    </div>
  );
}

export function EnvironmentRowActions({
  environment,
  canCreate,
  canUpdate,
  canDelete,
  canChangeStatus,
  isDeleting,
  isDuplicating,
  isDetailLoading,
  isStatusPending,
  onEdit,
  onDuplicate,
  onStatusChange,
  onDelete,
}: {
  environment: RemoteEnvironmentListItem;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  isDetailLoading: boolean;
  isStatusPending: boolean;
  onEdit: (environmentId: number) => void;
  onDuplicate: (environmentId: number) => void;
  onStatusChange: (environment: RemoteEnvironmentListItem) => void;
  onDelete: (environment: RemoteEnvironmentListItem) => void;
}) {
  if (!canCreate && !canUpdate && !canDelete && !canChangeStatus) {
    return null;
  }
  const deleteDisabledReason = isDeleting
    ? '正在删除，请稍候'
    : environment.runtime_status !== 'inactive'
      ? '已启动或启动中的环境不能删除，请先关闭'
      : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label="打开环境操作">
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canCreate ? (
            <DropdownMenuItem
              disabled={isDuplicating || isDetailLoading}
              onSelect={() => onDuplicate(environment.environment_id)}
            >
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
              复制
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem
              disabled={isDetailLoading}
              onSelect={() => onEdit(environment.environment_id)}
            >
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              编辑
            </DropdownMenuItem>
          ) : null}
          {canChangeStatus ? (
            <DropdownMenuItem
              disabled={isStatusPending}
              onSelect={() => onStatusChange(environment)}
            >
              <HugeiconsIcon
                icon={environment.status === '1' ? Tick02Icon : StopIcon}
                strokeWidth={2}
              />
              {environment.status === '1' ? '启用' : '停用'}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                aria-disabled={Boolean(deleteDisabledReason)}
                className={
                  deleteDisabledReason
                    ? 'cursor-not-allowed opacity-50 focus:bg-transparent focus:text-destructive'
                    : undefined
                }
                onSelect={(event) => {
                  if (deleteDisabledReason) {
                    event.preventDefault();
                    return;
                  }
                  onDelete(environment);
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                删除
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EnvironmentRuntimeBadge({
  environment,
}: {
  environment: RemoteEnvironmentListItem;
}) {
  const showRuntimeBadge =
    environment.runtime_status !== 'inactive' || environment.status === '1';
  if (!showRuntimeBadge) {
    return null;
  }
  if (environment.runtime_user_count > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="default"
            className="h-5 shrink-0 cursor-help px-1.5 text-[0.625rem]"
            tabIndex={0}
          >
            {environment.runtime_user_count}个用户使用中
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-72">
          使用中：
          {environment.runtime_user_names.length
            ? environment.runtime_user_names.join('、')
            : '用户信息暂不可用'}
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Badge
      variant={runtimeBadgeVariant(environment)}
      className="h-5 shrink-0 px-1.5 text-[0.625rem]"
    >
      {runtimeLabel(environment)}
    </Badge>
  );
}

function runtimeLabel(environment: RemoteEnvironmentListItem) {
  switch (environment.runtime_status) {
    case 'active':
      return '运行中';
    case 'starting':
      return '启动中';
    case 'stopping':
      return '停止中';
    case 'error':
      return '异常';
    default:
      return environment.status === '1' ? '停用' : '未启动';
  }
}

function runtimeBadgeVariant(
  environment: RemoteEnvironmentListItem,
): React.ComponentProps<typeof Badge>['variant'] {
  if (environment.runtime_status === 'active') {
    return 'default';
  }
  if (environment.runtime_status === 'error') {
    return 'destructive';
  }
  if (environment.status === '1') {
    return 'outline';
  }
  return 'secondary';
}

function proxyLabel(value?: string | null) {
  if (!value) {
    return '-';
  }
  if (value === 'socks5') {
    return 'SOCKS5';
  }
  if (value === 'http' || value === 'https') {
    return value.toUpperCase();
  }
  return value;
}
