import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { formatDisplayDateTime } from '@/lib/date-time';
import {
  Delete02Icon,
  Edit02Icon,
  MoreVerticalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { RemoteTeamRoleResource } from '../types';

export function useRoleColumns({
  canUpdate,
  canDelete,
  isSaving,
  isDeleting,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  canUpdate: boolean;
  canDelete: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onStatusChange: (record: RemoteTeamRoleResource, enabled: boolean) => void;
  onEdit: (record: RemoteTeamRoleResource) => void;
  onDelete: (record: RemoteTeamRoleResource) => void;
}) {
  const hasActions = canUpdate || canDelete;

  return React.useMemo<ColumnDef<RemoteTeamRoleResource>[]>(
    () => [
      ...(canDelete
        ? [
            {
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  aria-label="选择全部角色"
                  checked={
                    table.getIsAllRowsSelected()
                      ? true
                      : table.getIsSomeRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  disabled={isDeleting}
                  onCheckedChange={(checked) =>
                    table.toggleAllRowsSelected(Boolean(checked))
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label={`选择角色 ${row.original.role_name}`}
                  checked={row.getIsSelected()}
                  disabled={isDeleting}
                  onCheckedChange={(checked) =>
                    row.toggleSelected(Boolean(checked))
                  }
                />
              ),
              enableHiding: false,
              enableSorting: false,
            } satisfies ColumnDef<RemoteTeamRoleResource>,
          ]
        : []),
      {
        accessorKey: 'role_name',
        header: '角色',
        cell: ({ row }) => <RoleNameCell record={row.original} />,
      },
      {
        accessorKey: 'permission_count',
        header: '权限',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-4 px-1.5">
              菜单 {row.original.menus.length}
            </Badge>
            <Badge variant="outline" className="h-4 px-1.5">
              按钮 {row.original.permissions.length}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => (
          <Switch
            size="sm"
            checked={row.original.status === '0'}
            disabled={!canUpdate || isSaving}
            aria-label={`${row.original.role_name}角色状态`}
            onCheckedChange={(checked) => onStatusChange(row.original, checked)}
          />
        ),
      },
      {
        accessorKey: 'updated_at',
        header: '最近更新',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDisplayDateTime(
              row.original.updated_at || row.original.created_at,
            )}
          </span>
        ),
      },
      ...(hasActions
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }) => (
                <RoleActionsMenu
                  record={row.original}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  disabled={isSaving || isDeleting}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
              enableHiding: false,
            } satisfies ColumnDef<RemoteTeamRoleResource>,
          ]
        : []),
    ],
    [
      canDelete,
      canUpdate,
      hasActions,
      isDeleting,
      isSaving,
      onDelete,
      onEdit,
      onStatusChange,
    ],
  );
}

function RoleNameCell({ record }: { record: RemoteTeamRoleResource }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="truncate text-xs font-medium">{record.role_name}</span>
      <span className="truncate font-mono text-[0.625rem] text-muted-foreground">
        {record.role_key}
      </span>
    </div>
  );
}

function RoleActionsMenu({
  record,
  canUpdate,
  canDelete,
  disabled,
  onEdit,
  onDelete,
}: {
  record: RemoteTeamRoleResource;
  canUpdate: boolean;
  canDelete: boolean;
  disabled: boolean;
  onEdit: (record: RemoteTeamRoleResource) => void;
  onDelete: (record: RemoteTeamRoleResource) => void;
}) {
  if (!canUpdate && !canDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={`管理角色 ${record.role_name}`}
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canUpdate ? (
            <DropdownMenuItem onSelect={() => onEdit(record)}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              编辑
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(record)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              删除
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
