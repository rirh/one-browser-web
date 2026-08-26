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
import { cn } from '@/lib/utils';
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { PermissionTableRow } from '../permission-tree';
import type { RemotePermissionResource, RemotePermissionType } from '../types';

export function usePermissionColumns({
  canCreate,
  canUpdate,
  canDelete,
  canUpdateStatus,
  isSaving,
  isDeleting,
  isStatusPending,
  onToggleExpanded,
  onStatusChange,
  onCreateChild,
  onEdit,
  onDelete,
}: {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canUpdateStatus: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isStatusPending: boolean;
  onToggleExpanded: (permissionId: number) => void;
  onStatusChange: (record: RemotePermissionResource, enabled: boolean) => void;
  onCreateChild: (record: RemotePermissionResource) => void;
  onEdit: (record: RemotePermissionResource) => void;
  onDelete: (record: RemotePermissionResource) => void;
}) {
  const hasRowActions = canCreate || canUpdate || canDelete;

  return React.useMemo<ColumnDef<PermissionTableRow>[]>(
    () => [
      ...(canDelete
        ? [
            {
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  aria-label="选择全部权限"
                  checked={
                    table.getIsAllRowsSelected()
                      ? true
                      : table.getIsSomeRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  disabled={
                    isDeleting ||
                    !table.getRowModel().rows.some((row) => row.getCanSelect())
                  }
                  onCheckedChange={(checked) =>
                    table.toggleAllRowsSelected(Boolean(checked))
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label={`选择权限 ${row.original.record.permission_name}`}
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect() || isDeleting}
                  onCheckedChange={(checked) =>
                    row.toggleSelected(Boolean(checked))
                  }
                />
              ),
              enableHiding: false,
              enableSorting: false,
            } satisfies ColumnDef<PermissionTableRow>,
          ]
        : []),
      {
        id: 'name',
        header: '权限名称',
        cell: ({ row }) => (
          <PermissionNameCell
            row={row.original}
            onToggleExpanded={onToggleExpanded}
          />
        ),
        meta: {
          headerClassName: 'min-w-36',
          cellClassName: 'min-w-36 max-w-48',
        },
      },
      {
        id: 'path',
        header: '路由路径',
        cell: ({ row }) => (
          <PermissionTextCell
            value={row.original.record.path}
            className="max-w-32"
          />
        ),
        meta: {
          headerClassName: 'w-32',
          cellClassName: 'w-32 max-w-32',
        },
      },
      {
        id: 'permissionCode',
        header: '权限标识',
        cell: ({ row }) => (
          <PermissionTextCell
            value={row.original.record.permission_code}
            className="max-w-44"
          />
        ),
        meta: {
          headerClassName: 'w-44',
          cellClassName: 'w-44 max-w-44',
        },
      },
      {
        id: 'type',
        header: '类型 / 范围',
        cell: ({ row }) => <PermissionTypeCell record={row.original.record} />,
        meta: {
          headerClassName: 'w-28',
          cellClassName: 'w-28',
        },
      },
      {
        id: 'status',
        header: '状态',
        cell: ({ row }) => (
          <Switch
            size="sm"
            checked={row.original.record.status === '0'}
            disabled={
              row.original.record.locked || !canUpdateStatus || isStatusPending
            }
            aria-label={`${row.original.record.permission_name}权限状态`}
            onCheckedChange={(checked) =>
              onStatusChange(row.original.record, checked)
            }
          />
        ),
        meta: {
          headerClassName: 'w-14',
          cellClassName: 'w-14',
        },
      },
      {
        id: 'createdAt',
        header: '创建时间',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDisplayDateTime(row.original.record.created_at)}
          </span>
        ),
      },
      ...(hasRowActions
        ? [
            {
              id: 'actions',
              header: '操作',
              cell: ({ row }) => (
                <PermissionActionsMenu
                  record={row.original.record}
                  canCreate={canCreate}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  disabled={isSaving || isDeleting || isStatusPending}
                  onCreateChild={onCreateChild}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
              enableHiding: false,
              meta: {
                headerClassName: 'w-12 border-l bg-muted/95 px-2 text-center',
                cellClassName:
                  'w-12 border-l bg-background px-2 text-center group-data-[state=selected]/row:bg-muted group-hover/row:bg-muted/50',
              },
            } satisfies ColumnDef<PermissionTableRow>,
          ]
        : []),
    ],
    [
      canCreate,
      canDelete,
      canUpdate,
      canUpdateStatus,
      hasRowActions,
      isDeleting,
      isSaving,
      isStatusPending,
      onCreateChild,
      onDelete,
      onEdit,
      onStatusChange,
      onToggleExpanded,
    ],
  );
}

function PermissionNameCell({
  row,
  onToggleExpanded,
}: {
  row: PermissionTableRow;
  onToggleExpanded: (permissionId: number) => void;
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      style={{ paddingLeft: row.depth * 24 }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={!row.hasChildren}
        aria-label={row.expanded ? '收起子权限' : '展开子权限'}
        onClick={() => onToggleExpanded(row.record.permission_id)}
      >
        {row.hasChildren ? (
          <HugeiconsIcon
            icon={row.expanded ? ArrowDown01Icon : ArrowRight01Icon}
            strokeWidth={2}
          />
        ) : null}
      </Button>
      <span className="truncate font-medium">{row.record.permission_name}</span>
      {row.record.visible === '1' && row.record.permission_type !== 'F' ? (
        <Badge variant="outline" className="text-muted-foreground">
          隐藏
        </Badge>
      ) : null}
      {row.record.locked ? (
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-primary"
        >
          受保护
        </Badge>
      ) : null}
    </div>
  );
}

function PermissionTextCell({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn('block truncate', className)}
      title={value || undefined}
    >
      {value || '—'}
    </span>
  );
}

function PermissionTypeCell({ record }: { record: RemotePermissionResource }) {
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline">
        {permissionTypeLabel(record.permission_type)}
      </Badge>
      <Badge
        variant="outline"
        className="border-primary/20 bg-primary/10 text-primary"
      >
        {record.permission_scope === 'G' ? '全局' : '团队'}
      </Badge>
    </div>
  );
}

function PermissionActionsMenu({
  record,
  canCreate,
  canUpdate,
  canDelete,
  disabled,
  onCreateChild,
  onEdit,
  onDelete,
}: {
  record: RemotePermissionResource;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  disabled: boolean;
  onCreateChild: (record: RemotePermissionResource) => void;
  onEdit: (record: RemotePermissionResource) => void;
  onDelete: (record: RemotePermissionResource) => void;
}) {
  const canCreateChild = canCreate && record.permission_type !== 'F';
  const canEditRecord = canUpdate && !record.locked;
  const canDeleteRecord = canDelete && !record.locked;
  if (!canCreateChild && !canEditRecord && !canDeleteRecord) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={`管理权限 ${record.permission_name}`}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canCreateChild ? (
            <DropdownMenuItem onSelect={() => onCreateChild(record)}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              新增子权限
            </DropdownMenuItem>
          ) : null}
          {canEditRecord ? (
            <DropdownMenuItem onSelect={() => onEdit(record)}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              编辑
            </DropdownMenuItem>
          ) : null}
          {canDeleteRecord ? (
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

function permissionTypeLabel(type: RemotePermissionType) {
  if (type === 'M') {
    return '目录';
  }
  if (type === 'C') {
    return '菜单';
  }
  return '按钮';
}
