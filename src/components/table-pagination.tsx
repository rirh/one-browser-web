import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { SweepShine } from '@/components/ui/sweep-shine';
import { gsap } from 'gsap';
import * as React from 'react';

export function TablePagination({
  currentPage,
  isUpdating = false,
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions,
  total,
}: {
  currentPage: number;
  isUpdating?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  total?: number | null;
}) {
  const pagination = resolveTablePagination(total, pageSize, currentPage);
  const visible = Boolean(pagination);
  const page = pagination?.page ?? 0;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!visible || !container) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(
        container,
        { autoAlpha: 0, y: 6 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.26,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
      );

      return () => tween.kill();
    });

    return () => media.revert();
  }, [visible]);

  if (!pagination) return null;

  const { firstRow, hasNextPage, hasPreviousPage, lastRow, pageCount } =
    pagination;
  const pageItems = getPaginationItems(page, pageCount);

  return (
    <div
      ref={containerRef}
      className="bg-card/95 flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-1.5 backdrop-blur-xl lg:px-4"
    >
      <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
        <span className="shrink-0 tabular-nums">
          {firstRow}–{lastRow}
          <span className="text-border mx-1">/</span>
          {total} 条
        </span>
        {isUpdating ? <SweepShine>更新中...</SweepShine> : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {pageSizeOptions?.length && onPageSizeChange ? (
          <NativeSelect
            size="sm"
            aria-label="每页条数"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {value} 条/页
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : null}

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="上一页"
                size="sm"
                aria-label="上一页"
                aria-disabled={!hasPreviousPage}
                tabIndex={hasPreviousPage ? undefined : -1}
                className={
                  hasPreviousPage ? undefined : 'pointer-events-none opacity-50'
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (hasPreviousPage) onPageChange(page - 1);
                }}
              />
            </PaginationItem>

            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    size="icon-sm"
                    isActive={item === page}
                    aria-label={`第 ${item} 页`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (item !== page) onPageChange(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                text="下一页"
                size="sm"
                aria-label="下一页"
                aria-disabled={!hasNextPage}
                tabIndex={hasNextPage ? undefined : -1}
                className={
                  hasNextPage ? undefined : 'pointer-events-none opacity-50'
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (hasNextPage) onPageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export function resolveTablePagination(
  total: number | null | undefined,
  pageSize: number,
  currentPage: number,
) {
  if (
    typeof total !== 'number' ||
    !Number.isFinite(total) ||
    total <= pageSize
  ) {
    return null;
  }

  const pageCount = Math.ceil(total / pageSize);
  const page = Math.min(Math.max(currentPage, 1), pageCount);

  return {
    firstRow: (page - 1) * pageSize + 1,
    hasNextPage: page < pageCount,
    hasPreviousPage: page > 1,
    lastRow: Math.min(page * pageSize, total),
    page,
    pageCount,
  };
}

export function getPaginationItems(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', pageCount] as const;
  }

  if (page >= pageCount - 3) {
    return [
      1,
      'ellipsis',
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ] as const;
  }

  return [
    1,
    'ellipsis',
    page - 1,
    page,
    page + 1,
    'ellipsis',
    pageCount,
  ] as const;
}
