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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { copyTextToClipboard } from '@/platform/clipboard';
import {
  Alert01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  MultiplicationSignIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';

import type { BrowserAssetResource } from '../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function BrowserAssetsPagination({
  pageIndex,
  pageSize,
  totalRows,
  isUpdating,
  onPageIndexChange,
  onPageSizeChange,
}: {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  isUpdating: boolean;
  onPageIndexChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
}) {
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);
  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const hasPreviousPage = pageIndex > 0;
  const hasNextPage = pageIndex < totalPages - 1;

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t bg-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-4">
      <div className="flex items-center gap-2 text-sm leading-none text-muted-foreground">
        <span>
          {firstRow}-{lastRow} / {totalRows}
        </span>
        {isUpdating ? <span>更新中</span> : null}
      </div>
      <div className="flex items-center gap-1.5">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger size="sm" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAGE_SIZE_OPTIONS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value} 条
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!hasPreviousPage}
          aria-label="第一页"
          onClick={() => onPageIndexChange(0)}
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!hasPreviousPage}
          aria-label="上一页"
          onClick={() => onPageIndexChange(Math.max(pageIndex - 1, 0))}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <div className="min-w-20 text-center text-sm leading-none text-muted-foreground">
          {pageIndex + 1} / {totalPages}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!hasNextPage}
          aria-label="下一页"
          onClick={() =>
            onPageIndexChange(Math.min(pageIndex + 1, totalPages - 1))
          }
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!hasNextPage}
          aria-label="最后一页"
          onClick={() => onPageIndexChange(totalPages - 1)}
        >
          <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

export function AssetBulkActions({
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

export function AssetNameCell({ record }: { record: BrowserAssetResource }) {
  const title = assetDisplayName(record);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2">
        {record.is_current ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-primary"
          />
        ) : null}
        <span
          className="block max-w-full min-w-0 truncate font-medium"
          title={title}
        >
          {title}
        </span>
      </div>
      <span
        className="block max-w-80 min-w-0 truncate text-xs text-muted-foreground"
        title={record.object_key || record.download_url}
      >
        {record.object_key || record.download_url}
      </span>
    </div>
  );
}

export function TargetCell({ record }: { record: BrowserAssetResource }) {
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="text-xs">
        {record.platform}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {record.arch}
      </Badge>
    </div>
  );
}

export function CurrentBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'default' : 'outline'} className="text-xs">
      {active ? '当前版本' : '历史版本'}
    </Badge>
  );
}

export function AssetActionsMenu({
  record,
  canSetCurrent,
  canDelete,
  isBusy,
  onSetCurrent,
  onDelete,
}: {
  record: BrowserAssetResource;
  canSetCurrent: boolean;
  canDelete: boolean;
  isBusy: boolean;
  onSetCurrent: (record: BrowserAssetResource) => void;
  onDelete: (record: BrowserAssetResource) => void;
}) {
  async function copyDownloadUrl() {
    try {
      await copyTextToClipboard(record.download_url);
      toast.success('下载 URL 已复制');
    } catch {
      toast.error('复制失败');
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="打开安装包操作"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => void copyDownloadUrl()}>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
            复制 URL
          </DropdownMenuItem>
          {canSetCurrent ? (
            <DropdownMenuItem
              disabled={record.is_current || isBusy}
              onSelect={() => onSetCurrent(record)}
            >
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
              设为当前
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={record.is_current || isBusy}
              onSelect={() => onDelete(record)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              删除
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AssetState({
  icon,
  title,
  description,
  onRetry,
}: {
  icon: typeof Alert01Icon;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Empty className="min-h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            重新加载
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function assetDisplayName(record: BrowserAssetResource) {
  return record.version
    ? `${record.version} (${record.platform} / ${record.arch})`
    : `${record.platform} / ${record.arch}`;
}
