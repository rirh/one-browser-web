import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Alert01Icon,
  Delete02Icon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { RemoteTeamRoleResource } from '../types';

export function RoleBulkActions({
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
    <div className="pointer-events-none fixed inset-x-0 bottom-12 flex justify-center px-4 md:left-(--sidebar-width)">
      <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
        <Badge
          variant="outline"
          className="h-6 rounded-md bg-muted/40 px-2.5 text-xs"
        >
          <span className="font-semibold tabular-nums">{selectedCount}</span>
          <span className="text-muted-foreground">已选</span>
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="清除选择"
          disabled={isDeleting}
          onClick={onClear}
        >
          <HugeiconsIcon icon={MultiplicationSignIcon} strokeWidth={2} />
        </Button>
        <Separator orientation="vertical" className="h-5" />
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

export function RoleLoadErrorState({
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
        <EmptyTitle>角色读取失败</EmptyTitle>
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

export function RoleDeleteDialog({
  targets,
  canDelete,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  targets: RemoteTeamRoleResource[];
  canDelete: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
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
              ? `删除 ${targets.length} 个角色？`
              : '删除角色'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {targets.length > 1
              ? `删除选中的 ${targets.length} 个角色后，成员将不再继承这些角色权限。`
              : `删除“${targets[0]?.role_name ?? ''}”后，成员将不再继承该角色权限。`}
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
              onConfirm();
            }}
          >
            删除
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
