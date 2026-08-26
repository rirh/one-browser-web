import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { RemoteEnvironmentListItem } from '../types';
import {
  CreatedAtCell,
  EnvironmentCell,
  EnvironmentRowActions,
  ProxyCell,
} from './environment-table-cells';

export function useEnvironmentColumns({
  canSelect,
  canCreate,
  canUpdate,
  canDelete,
  canChangeStatus,
  canOpen,
  canClose,
  localRuntimeEnvironmentIds,
  allVisibleSelected,
  someVisibleSelected,
  selectedIdSet,
  isRuntimePending,
  isCheckingLaunchStatus,
  isDeleting,
  isDuplicating,
  isStatusPending,
  loadingDetailId,
  runtimeEnvironmentId,
  runtimeAction,
  onToggleVisible,
  onToggle,
  onEdit,
  onDuplicate,
  onStatusChange,
  onDelete,
  onOpen,
  onClose,
}: {
  canSelect: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canOpen: boolean;
  canClose: boolean;
  localRuntimeEnvironmentIds: ReadonlySet<number>;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  selectedIdSet: Set<number>;
  isRuntimePending: boolean;
  isCheckingLaunchStatus: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  isStatusPending: boolean;
  loadingDetailId: number | null;
  runtimeEnvironmentId?: number;
  runtimeAction?: 'open' | 'close';
  onToggleVisible: (checked: boolean) => void;
  onToggle: (environmentId: number, checked: boolean) => void;
  onEdit: (environmentId: number) => void;
  onDuplicate: (environmentId: number) => void;
  onStatusChange: (environment: RemoteEnvironmentListItem) => void;
  onDelete: (environment: RemoteEnvironmentListItem) => void;
  onOpen: (environmentId: number) => void;
  onClose: (environmentId: number) => void;
}) {
  const hasRowActions =
    canCreate ||
    canUpdate ||
    canDelete ||
    canChangeStatus ||
    canOpen ||
    canClose;

  return React.useMemo<ColumnDef<RemoteEnvironmentListItem>[]>(
    () => [
      ...(canSelect
        ? [
            {
              id: 'select',
              header: () => (
                <Checkbox
                  aria-label="选择当前筛选下的全部环境"
                  checked={
                    allVisibleSelected
                      ? true
                      : someVisibleSelected
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    onToggleVisible(Boolean(checked))
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label={`选择环境 ${row.original.name}`}
                  checked={selectedIdSet.has(row.original.environment_id)}
                  onCheckedChange={(checked) =>
                    onToggle(row.original.environment_id, Boolean(checked))
                  }
                />
              ),
              enableHiding: false,
            } satisfies ColumnDef<RemoteEnvironmentListItem>,
          ]
        : []),
      {
        accessorKey: 'name',
        header: '环境',
        cell: ({ row }) => (
          <EnvironmentCell
            canEdit={canUpdate}
            environment={row.original}
            onEdit={onEdit}
          />
        ),
      },
      {
        id: 'proxySummary',
        header: '代理',
        cell: ({ row }) => (
          <ProxyCell
            canEdit={canUpdate}
            environment={row.original}
            onEdit={onEdit}
          />
        ),
      },
      {
        id: 'createdAt',
        header: '创建时间',
        cell: ({ row }) => <CreatedAtCell environment={row.original} />,
      },
      ...(hasRowActions
        ? [
            {
              id: 'actions',
              header: '操作',
              cell: ({ row }) => {
                const environment = row.original;
                const isActive = environment.runtime_status === 'active';
                const hasLocalRuntime = localRuntimeEnvironmentIds.has(
                  environment.environment_id,
                );
                const shouldClose = isActive && hasLocalRuntime;
                const isOpening =
                  environment.runtime_status === 'starting' ||
                  (isRuntimePending &&
                    runtimeEnvironmentId === environment.environment_id &&
                    runtimeAction === 'open');
                const isClosing =
                  environment.runtime_status === 'stopping' ||
                  (isRuntimePending &&
                    runtimeEnvironmentId === environment.environment_id &&
                    runtimeAction === 'close');
                return (
                  <div className="flex items-center gap-1">
                    {(shouldClose ? canClose : canOpen) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        aria-busy={isOpening || isClosing || undefined}
                        disabled={
                          isRuntimePending ||
                          (isCheckingLaunchStatus && !shouldClose) ||
                          environment.status === '1' ||
                          (!isActive &&
                            environment.runtime_status !== 'inactive')
                        }
                        onClick={() =>
                          shouldClose
                            ? onClose(environment.environment_id)
                            : onOpen(environment.environment_id)
                        }
                      >
                        {isOpening || isClosing ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <HugeiconsIcon
                            icon={shouldClose ? StopIcon : PlayIcon}
                            strokeWidth={2}
                            data-icon="inline-start"
                          />
                        )}
                        {shouldClose
                          ? '关闭'
                          : isOpening
                            ? '启动中'
                            : environment.runtime_status === 'error'
                              ? '重试'
                              : '启动'}
                      </Button>
                    ) : null}
                    <EnvironmentRowActions
                      environment={environment}
                      canCreate={canCreate}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      canChangeStatus={canChangeStatus}
                      isDeleting={isDeleting}
                      isDuplicating={isDuplicating}
                      isDetailLoading={
                        loadingDetailId === environment.environment_id
                      }
                      isStatusPending={isStatusPending}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                    />
                  </div>
                );
              },
              enableHiding: false,
            } satisfies ColumnDef<RemoteEnvironmentListItem>,
          ]
        : []),
    ],
    [
      allVisibleSelected,
      canChangeStatus,
      canClose,
      canCreate,
      canDelete,
      canOpen,
      canSelect,
      canUpdate,
      hasRowActions,
      isCheckingLaunchStatus,
      isDeleting,
      isDuplicating,
      isRuntimePending,
      isStatusPending,
      loadingDetailId,
      localRuntimeEnvironmentIds,
      onClose,
      onDelete,
      onDuplicate,
      onEdit,
      onOpen,
      onStatusChange,
      onToggle,
      onToggleVisible,
      runtimeAction,
      runtimeEnvironmentId,
      selectedIdSet,
      someVisibleSelected,
    ],
  );
}
