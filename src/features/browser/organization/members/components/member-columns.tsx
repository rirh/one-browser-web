import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DefaultUserAvatar } from '@/features/account/avatar';
import { getDefaultUserAvatarSeed } from '@/features/account/avatar';
import { formatDisplayDateTime } from '@/lib/date-time';
import {
  BrowserIcon,
  Delete02Icon,
  MoreVerticalIcon,
  ShieldUserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { RemoteTeamResource } from '../../teams/types';
import type { RemoteMemberResource, RemoteStatusFlag } from '../types';

export function useMemberColumns({
  selectedTeam,
  canChangeStatus,
  canConfigurePermissions,
  canRemoveMembers,
  isStatusPending,
  isSavingAccess,
  isRemovingMember,
  isCurrentUser,
  canConfigureAccess,
  onStatusChange,
  onAssignRoles,
  onAuthorizeEnvironments,
  onRemoveMember,
}: {
  selectedTeam: RemoteTeamResource | null;
  canChangeStatus: boolean;
  canConfigurePermissions: boolean;
  canRemoveMembers: boolean;
  isStatusPending: boolean;
  isSavingAccess: boolean;
  isRemovingMember: boolean;
  isCurrentUser: (record: RemoteMemberResource) => boolean;
  canConfigureAccess: (record: RemoteMemberResource) => boolean;
  onStatusChange: (
    record: RemoteMemberResource,
    status: RemoteStatusFlag,
  ) => void;
  onAssignRoles: (record: RemoteMemberResource) => void;
  onAuthorizeEnvironments: (record: RemoteMemberResource) => void;
  onRemoveMember: (record: RemoteMemberResource) => void;
}) {
  return React.useMemo<ColumnDef<RemoteMemberResource>[]>(() => {
    const nextColumns: ColumnDef<RemoteMemberResource>[] = [
      {
        accessorKey: 'display_name',
        header: '成员',
        cell: ({ row }) => <MemberNameCell record={row.original} />,
      },
      {
        accessorKey: 'email',
        header: '联系方式',
        cell: ({ row }) => <MemberContactCell record={row.original} />,
      },
      {
        accessorKey: 'role_names',
        header: '角色',
        cell: ({ row }) => (
          <MemberRolesCell record={row.original} selectedTeam={selectedTeam} />
        ),
      },
      {
        accessorKey: 'environment_count',
        header: '环境',
        cell: ({ row }) => (
          <MemberEnvironmentCount count={row.original.environment_count} />
        ),
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => {
          const currentUser = isCurrentUser(row.original);
          return (
            <MemberStatusCell
              label="成员状态"
              status={row.original.status}
              canChange={canChangeStatus}
              disabled={!canChangeStatus || isStatusPending || currentUser}
              title={currentUser ? '不能修改自己的成员状态' : undefined}
              onChange={(status) => onStatusChange(row.original, status)}
            />
          );
        },
      },
      {
        accessorKey: 'last_active_at',
        header: '最近活跃',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDisplayDateTime(
              row.original.last_active_at || row.original.updated_at,
            )}
          </span>
        ),
      },
    ];

    if (canConfigurePermissions || canRemoveMembers) {
      nextColumns.push({
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const record = row.original;
          return (
            <MemberRowActions
              record={record}
              canConfigureAccess={
                canConfigureAccess(record) && !isCurrentUser(record)
              }
              canRemoveMember={
                canRemoveMembers &&
                selectedTeam?.owner_member_id !== record.member_id
              }
              isSavingAccess={isSavingAccess}
              isRemovingMember={isRemovingMember}
              onAssignRoles={onAssignRoles}
              onAuthorizeEnvironments={onAuthorizeEnvironments}
              onRemoveMember={onRemoveMember}
            />
          );
        },
        enableHiding: false,
      });
    }

    return nextColumns;
  }, [
    canChangeStatus,
    canConfigureAccess,
    canConfigurePermissions,
    canRemoveMembers,
    isCurrentUser,
    isRemovingMember,
    isSavingAccess,
    isStatusPending,
    onAssignRoles,
    onAuthorizeEnvironments,
    onRemoveMember,
    onStatusChange,
    selectedTeam,
  ]);
}

function MemberStatusCell({
  label,
  status,
  canChange,
  disabled,
  title,
  onChange,
}: {
  label: string;
  status: RemoteStatusFlag;
  canChange: boolean;
  disabled: boolean;
  title?: string;
  onChange: (status: RemoteStatusFlag) => void;
}) {
  const checked = status === '0';
  if (!canChange) {
    return (
      <Badge variant={checked ? 'success' : 'secondary'}>
        {checked ? '启用' : '停用'}
      </Badge>
    );
  }
  return (
    <Switch
      size="sm"
      checked={checked}
      disabled={disabled}
      title={title}
      aria-label={label}
      onCheckedChange={(nextChecked) => onChange(nextChecked ? '0' : '1')}
    />
  );
}

function MemberRowActions({
  record,
  canConfigureAccess,
  canRemoveMember,
  isSavingAccess,
  isRemovingMember,
  onAssignRoles,
  onAuthorizeEnvironments,
  onRemoveMember,
}: {
  record: RemoteMemberResource;
  canConfigureAccess: boolean;
  canRemoveMember: boolean;
  isSavingAccess: boolean;
  isRemovingMember: boolean;
  onAssignRoles: (record: RemoteMemberResource) => void;
  onAuthorizeEnvironments: (record: RemoteMemberResource) => void;
  onRemoveMember: (record: RemoteMemberResource) => void;
}) {
  if (!canConfigureAccess && !canRemoveMember) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="打开成员操作"
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canConfigureAccess ? (
            <>
              <DropdownMenuItem
                disabled={isSavingAccess}
                onSelect={() => onAssignRoles(record)}
              >
                <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} />
                分配角色
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isSavingAccess}
                onSelect={() => onAuthorizeEnvironments(record)}
              >
                <HugeiconsIcon icon={BrowserIcon} strokeWidth={2} />
                环境授权
              </DropdownMenuItem>
            </>
          ) : null}
          {canConfigureAccess && canRemoveMember ? (
            <DropdownMenuSeparator />
          ) : null}
          {canRemoveMember ? (
            <DropdownMenuItem
              variant="destructive"
              disabled={isRemovingMember}
              onSelect={() => onRemoveMember(record)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              移出成员
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MemberNameCell({ record }: { record: RemoteMemberResource }) {
  const displayName =
    record.display_name || record.nick_name || record.user_name;
  const avatarSeed = getDefaultUserAvatarSeed(
    record.user_id,
    record.email,
    record.user_name,
    record.nick_name,
    record.display_name,
  );
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        <AvatarImage
          src={record.avatar || undefined}
          alt={`${displayName} 的头像`}
        />
        <AvatarFallback className="overflow-hidden p-0">
          <DefaultUserAvatar seed={avatarSeed} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">{displayName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {record.user_name}
        </div>
      </div>
    </div>
  );
}

function MemberContactCell({ record }: { record: RemoteMemberResource }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate">{record.email || '-'}</span>
      {record.phone_number ? (
        <span className="truncate text-xs text-muted-foreground">
          {record.phone_number}
        </span>
      ) : null}
    </div>
  );
}

function MemberEnvironmentCount({ count }: { count: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" aria-label={`${count} 个环境`}>
          <HugeiconsIcon icon={BrowserIcon} strokeWidth={2} />
          <span className="tabular-nums">{count}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">{count} 个环境</TooltipContent>
    </Tooltip>
  );
}

function MemberRolesCell({
  record,
  selectedTeam,
}: {
  record: RemoteMemberResource;
  selectedTeam: RemoteTeamResource | null;
}) {
  const isOwner = selectedTeam?.owner_member_id === record.member_id;
  const roleNames = isOwner
    ? ['Owner', ...record.role_names.filter((value) => value !== 'Owner')]
    : record.role_names.length
      ? record.role_names
      : ['未分配'];
  return (
    <div className="flex max-w-52 flex-wrap gap-1">
      {roleNames.slice(0, 3).map((value) => (
        <Badge key={value} variant={memberRoleBadgeVariant(value)}>
          {value}
        </Badge>
      ))}
      {roleNames.length > 3 ? (
        <Badge variant="secondary">+{roleNames.length - 3}</Badge>
      ) : null}
    </div>
  );
}

function memberRoleBadgeVariant(
  value: string,
): React.ComponentProps<typeof Badge>['variant'] {
  if (value === 'Owner') {
    return 'default';
  }
  if (value === '未分配') {
    return 'secondary';
  }
  return 'outline';
}
