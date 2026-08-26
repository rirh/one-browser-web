import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialogActionButton,
  AlertDialogCancelButton,
} from '@/components/ui/dialog-action-button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import {
  Alert01Icon,
  Delete02Icon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { collapseDescendantTargets } from '../permission-tree';
import type { RemotePermissionResource } from '../types';

export function PermissionDeleteDialog({
  targets,
  permissions,
  canDelete,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  targets: RemotePermissionResource[];
  permissions: RemotePermissionResource[];
  canDelete: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (targets: RemotePermissionResource[]) => void;
}) {
  return (
    <AlertDialog open={targets.length > 0} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {targets.length > 1
              ? `删除 ${targets.length} 个权限？`
              : '删除权限'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {targets.length > 1
              ? `将删除选中的 ${targets.length} 个权限；父级被删除时，其子权限也会一并删除。`
              : `删除“${targets[0]?.permission_name ?? ''}”后，角色将不再拥有该权限；其子权限也会一并删除。`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isDeleting} />
          <AlertDialogActionButton
            variant="destructive"
            disabled={isDeleting || targets.length === 0 || !canDelete}
            loading={isDeleting}
            loadingText="删除中..."
            onClick={(event) => {
              event.preventDefault();
              const requestTargets = collapseDescendantTargets(
                targets.filter((target) => !target.locked),
                permissions,
              );
              if (requestTargets.length) {
                onConfirm(requestTargets);
              }
            }}
          >
            删除
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PermissionBulkActions({
  selectedCount,
  isDeleting,
  onClear,
  onDelete,
}: {
  selectedCount: number;
  isDeleting: boolean;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10">
        <span className="text-muted-foreground">
          已选择{' '}
          <span className="font-medium tabular-nums">{selectedCount}</span> 项
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={onClear}
        >
          <HugeiconsIcon
            icon={MultiplicationSignIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          取消选择
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon
              icon={Delete02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          )}
          {isDeleting ? '删除中' : '批量删除'}
        </Button>
      </div>
    </div>
  );
}

export function PermissionLoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Empty className="min-h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>权限读取失败</EmptyTitle>
        <EmptyDescription>{message || '请稍后重试。'}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          重新加载
        </Button>
      </EmptyContent>
    </Empty>
  );
}
