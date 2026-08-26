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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import type { ProxyListItem } from '@/features/browser/contracts';
import {
  Copy01Icon,
  Delete02Icon,
  Edit01Icon,
  MoreVerticalIcon,
  MultiplicationSignIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function DeleteConfirmDialog({
  proxyIds,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  proxyIds: string[];
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (proxyIds: string[]) => void | Promise<void>;
}) {
  const count = proxyIds.length;
  const title = count > 1 ? `删除 ${count} 个代理？` : '删除这个代理？';
  const description =
    count > 1
      ? `将删除选中的 ${count} 个代理配置，关联环境将无法继续使用这些代理。此操作不可撤销。`
      : '将删除这个代理配置，关联环境将无法继续使用该代理。此操作不可撤销。';

  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isDeleting} />
          <AlertDialogActionButton
            variant="destructive"
            disabled={isDeleting}
            loading={isDeleting}
            loadingText="删除中..."
            onClick={(event) => {
              event.preventDefault();
              void onConfirm(proxyIds);
            }}
          >
            确认删除
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RowActions({
  canCheck,
  canCreate,
  canDelete,
  canUpdate,
  proxy,
  isChecking,
  isDeleting,
  isDuplicating,
  onCheck,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  canCheck: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
  proxy: ProxyListItem;
  isChecking: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  onCheck: (proxyId: string) => void;
  onEdit: (proxyId: string) => void;
  onDuplicate: (proxyId: string) => void;
  onDelete: (proxyId: string) => void;
}) {
  if (!canCheck && !canCreate && !canUpdate && !canDelete) {
    return null;
  }

  const proxyId = proxy.proxyId;
  const hasPrimaryActions = canCheck || canCreate || canUpdate;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="打开代理操作"
        >
          {isChecking ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasPrimaryActions ? (
          <DropdownMenuGroup>
            {canCheck ? (
              <DropdownMenuItem onSelect={() => onCheck(proxyId)}>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                检测
              </DropdownMenuItem>
            ) : null}
            {canCreate ? (
              <DropdownMenuItem
                disabled={isDuplicating}
                onSelect={() => onDuplicate(proxyId)}
              >
                <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                复制
              </DropdownMenuItem>
            ) : null}
            {canUpdate ? (
              <DropdownMenuItem onSelect={() => onEdit(proxyId)}>
                <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
                编辑
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        ) : null}
        {canDelete ? (
          <>
            {hasPrimaryActions ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                disabled={isDeleting}
                onSelect={() => onDelete(proxyId)}
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

export function BulkActions({
  canCheck,
  canDelete,
  selectedCount,
  isChecking,
  isDeleting,
  onClear,
  onCheck,
  onDelete,
}: {
  canCheck: boolean;
  canDelete: boolean;
  selectedCount: number;
  isChecking?: boolean;
  isDeleting?: boolean;
  onClear: () => void;
  onCheck: () => void;
  onDelete: () => void;
}) {
  if (!canCheck && !canDelete) {
    return null;
  }

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
          onClick={onClear}
        >
          <HugeiconsIcon icon={MultiplicationSignIcon} strokeWidth={2} />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        {canCheck ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isChecking}
            onClick={onCheck}
          >
            {isChecking ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
            )}
            {isChecking ? '检测中' : '检测'}
          </Button>
        ) : null}
        {canDelete ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="批量操作"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isDeleting}
                  onSelect={onDelete}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  删除
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
