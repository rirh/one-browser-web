import { TableLoadingSkeleton } from '@/components/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshButton } from '@/components/refresh-button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProxyConfig, ProxyListItem } from '@/features/browser/contracts';
import { cn } from '@/lib/utils';
import { Route02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import {
  BulkActions,
  DeleteConfirmDialog,
  RowActions,
} from './components/proxy-table-actions';
import {
  NoteCell,
  ProxyAddressCell,
  ProxyEnabledSwitch,
  ProxyStatusCell,
} from './components/proxy-table-cells';
import { ipCheckerLabel, proxyTypeLabel } from './model/proxy-table';

type DeleteTarget = { proxyIds: string[] };

export const PROXY_TABLE_COLUMN_OPTIONS = [
  { id: 'proxyId', label: '代理' },
  { id: 'ipChecker', label: 'IP 检测' },
  { id: 'type', label: '类型' },
  { id: 'status', label: '状态' },
  { id: 'profileCount', label: '环境' },
  { id: 'remark', label: '备注' },
] as const;

interface ProxyTableProps {
  canCheck?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdate?: boolean;
  data: ProxyListItem[];
  isLoading?: boolean;
  isChecking?: boolean;
  isDeleting?: boolean;
  isDuplicating?: boolean;
  updatingProxyId?: string | null;
  updatingStatusProxyIds?: ReadonlySet<string>;
  checkingProxyIds?: Set<string>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  showHeaderRefresh?: boolean;
  onRefresh: () => void | Promise<{ isError?: boolean }>;
  onCheck: (proxyId: string) => void;
  onCheckMany: (proxyIds: string[]) => void;
  onEdit: (proxyId: string) => void;
  onDuplicate: (proxyId: string) => void;
  onDelete: (proxyIds: string[]) => void | Promise<void>;
  onUpdateRemark: (proxyId: string, remark: string) => Promise<void>;
  onStatusChange?: (proxyId: string, enabled: boolean) => void;
  onResolveCopyProxy: (proxyId: string) => Promise<ProxyConfig>;
  onCopyProxyText: (text: string) => Promise<void>;
}

export function ProxyTable({
  canCheck = true,
  canCreate = true,
  canDelete = true,
  canUpdate = true,
  data,
  isLoading,
  isChecking,
  isDeleting,
  isDuplicating,
  updatingProxyId,
  updatingStatusProxyIds,
  checkingProxyIds,
  columnVisibility,
  onColumnVisibilityChange,
  showHeaderRefresh = true,
  onRefresh,
  onCheck,
  onCheckMany,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateRemark,
  onStatusChange,
  onResolveCopyProxy,
  onCopyProxyText,
}: ProxyTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const canSelectProxies = canCheck || canDelete;

  useEffect(() => {
    const availableIds = new Set(data.map((proxy) => proxy.proxyId));
    setRowSelection((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([proxyId]) =>
          availableIds.has(proxyId),
        ),
      ),
    );
  }, [data]);

  const columns = useMemo<ColumnDef<ProxyListItem>[]>(
    () => [
      ...(canSelectProxies
        ? [
            {
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  aria-label="选择全部代理"
                  checked={
                    table.getIsAllRowsSelected()
                      ? true
                      : table.getIsSomeRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    table.toggleAllRowsSelected(Boolean(checked))
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label="选择代理"
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) =>
                    row.toggleSelected(Boolean(checked))
                  }
                />
              ),
              enableSorting: false,
              enableHiding: false,
            } satisfies ColumnDef<ProxyListItem>,
          ]
        : []),
      {
        accessorKey: 'proxyId',
        header: '代理',
        cell: ({ row }) => (
          <ProxyAddressCell
            canEdit={canUpdate}
            proxy={row.original}
            onEdit={onEdit}
            onResolveCopyProxy={onResolveCopyProxy}
            onCopyProxyText={onCopyProxyText}
          />
        ),
      },
      {
        accessorKey: 'ipChecker',
        header: 'IP 检测',
        cell: ({ row }) => (
          <Badge variant="outline">
            {ipCheckerLabel(row.original.ipChecker)}
          </Badge>
        ),
      },
      {
        accessorKey: 'type',
        header: '类型',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="bg-muted/40 text-muted-foreground h-5 rounded-md px-2 text-xs font-medium"
          >
            {proxyTypeLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: '状态',
        cell: ({ row }) =>
          row.original.enabled === undefined || !onStatusChange ? (
            <ProxyStatusCell result={row.original.lastCheck} />
          ) : (
            <ProxyEnabledSwitch
              proxy={row.original}
              canUpdate={canUpdate}
              isUpdating={Boolean(
                updatingStatusProxyIds?.has(row.original.proxyId),
              )}
              onChange={onStatusChange}
            />
          ),
        enableSorting: false,
      },
      {
        accessorKey: 'profileCount',
        header: '环境',
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.profileCount}
          </span>
        ),
      },
      {
        accessorKey: 'remark',
        header: '备注',
        cell: ({ row }) => (
          <NoteCell
            canEdit={canUpdate}
            proxy={row.original}
            isSaving={updatingProxyId === row.original.proxyId}
            onSave={onUpdateRemark}
          />
        ),
      },
      {
        id: 'actions',
        header: showHeaderRefresh
          ? () => (
              <div className="flex justify-end">
                <RefreshButton
                  variant="ghost"
                  size="icon-sm"
                  iconOnly
                  aria-label="刷新代理列表"
                  onRefresh={onRefresh}
                  successMessage="代理列表已刷新"
                />
              </div>
            )
          : '',
        cell: ({ row }) => (
          <RowActions
            canCheck={canCheck}
            canCreate={canCreate}
            canDelete={canDelete}
            canUpdate={canUpdate}
            proxy={row.original}
            isChecking={Boolean(
              isChecking && checkingProxyIds?.has(row.original.proxyId),
            )}
            isDeleting={Boolean(isDeleting)}
            isDuplicating={Boolean(isDuplicating)}
            onCheck={onCheck}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={(proxyId) => setDeleteTarget({ proxyIds: [proxyId] })}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [
      checkingProxyIds,
      canCheck,
      canCreate,
      canDelete,
      canSelectProxies,
      canUpdate,
      isChecking,
      isDeleting,
      isDuplicating,
      onCheck,
      onDuplicate,
      onEdit,
      onCopyProxyText,
      onRefresh,
      onResolveCopyProxy,
      onStatusChange,
      onUpdateRemark,
      showHeaderRefresh,
      updatingProxyId,
      updatingStatusProxyIds,
    ],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    enableRowSelection: canSelectProxies,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (proxy) => proxy.proxyId,
    onColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility: columnVisibility ?? {},
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedProxyIds = selectedRows.map((row) => row.original.proxyId);

  if (isLoading) {
    return (
      <div className="bg-card min-h-0 flex-1 overflow-auto">
        <TableLoadingSkeleton
          columnCount={table.getVisibleLeafColumns().length}
        />
      </div>
    );
  }

  if (!data.length) {
    return (
      <Empty className="min-h-0 flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Route02Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>暂无代理</EmptyTitle>
          <EmptyDescription>添加可复用代理，用于环境启动。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="bg-card relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-muted/45 sticky top-0 z-20 backdrop-blur-xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-8 py-1',
                      header.id === 'select' && 'w-9 pl-2',
                      header.id === 'proxyId' && 'min-w-[21rem]',
                      header.id === 'ipChecker' && 'min-w-28',
                      header.id === 'type' && 'min-w-20',
                      header.id === 'status' &&
                        (onStatusChange ? 'min-w-20' : 'min-w-32'),
                      header.id === 'profileCount' && 'min-w-20',
                      header.id === 'remark' && 'min-w-32',
                      header.id === 'actions' &&
                        'bg-muted/95 sticky right-0 z-30 w-10 border-l pr-2 text-right',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="group/row"
                data-state={row.getIsSelected() ? 'selected' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'h-11 px-2 py-1.5',
                      cell.column.id === 'select' && 'pl-2',
                      cell.column.id === 'actions' &&
                        'bg-card group-data-[state=selected]/row:bg-muted group-hover/row:bg-muted/50 sticky right-0 z-10 border-l pr-2 text-right',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
        <span>共 {data.length} 个代理</span>
        <div className="flex items-center gap-4">
          <span>每页 {data.length}</span>
          <span>第 1 / 1 页</span>
        </div>
      </div>

      {canSelectProxies && selectedProxyIds.length ? (
        <BulkActions
          canCheck={canCheck}
          canDelete={canDelete}
          selectedCount={selectedProxyIds.length}
          isChecking={isChecking}
          isDeleting={isDeleting}
          onClear={() => table.resetRowSelection()}
          onCheck={() => onCheckMany(selectedProxyIds)}
          onDelete={() => setDeleteTarget({ proxyIds: selectedProxyIds })}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmDialog
          proxyIds={deleteTarget.proxyIds}
          isDeleting={isDeleting}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={async (proxyIds) => {
            await onDelete(proxyIds);
            setDeleteTarget(null);
            table.resetRowSelection();
          }}
        />
      ) : null}
    </div>
  );
}
