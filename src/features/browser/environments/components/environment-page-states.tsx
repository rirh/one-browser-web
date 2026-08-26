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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Delete02Icon,
  MoreVerticalIcon,
  MultiplicationSignIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function EnvironmentBulkActions({
  canDelete,
  canOpen,
  selectedCount,
  openableCount,
  isDeleting,
  isOpening,
  openDisabled,
  deleteDisabled,
  deleteDisabledTitle,
  onClear,
  onOpen,
  onDelete,
}: {
  canDelete: boolean;
  canOpen: boolean;
  selectedCount: number;
  openableCount: number;
  isDeleting?: boolean;
  isOpening?: boolean;
  openDisabled?: boolean;
  deleteDisabled?: boolean;
  deleteDisabledTitle?: string;
  onClear: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  if (!canOpen && !canDelete) {
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
        {canOpen ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={openDisabled}
            onClick={onOpen}
          >
            {isOpening ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={PlayIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
            )}
            {isOpening ? '启动中' : `启动 ${openableCount}`}
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
                  disabled={deleteDisabled || isDeleting}
                  title={deleteDisabledTitle}
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

export function DeleteEnvironmentsConfirmDialog({
  environmentIds,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  environmentIds: number[];
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (environmentIds: number[]) => void;
}) {
  const count = environmentIds.length;
  const title = count > 1 ? `删除 ${count} 个环境？` : '删除这个环境？';
  const description =
    count > 1
      ? `将删除选中的 ${count} 个环境。此操作不可撤销。`
      : '将删除这个环境。此操作不可撤销。';
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
              onConfirm(environmentIds);
            }}
          >
            确认删除
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
