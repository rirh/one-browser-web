import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const cellWidths = ['w-4', 'w-28', 'w-24', 'w-16', 'w-24', 'w-14'];

type LoadingSkeletonProps = {
  className?: string;
};

export function TableLoadingSkeleton({
  className,
  columnCount = 6,
  rowCount = 8,
}: LoadingSkeletonProps & {
  columnCount?: number;
  rowCount?: number;
}) {
  return (
    <div
      role="status"
      aria-label="加载中..."
      aria-busy="true"
      className={cn('min-h-full overflow-hidden bg-card', className)}
    >
      <Table className="min-w-[900px]">
        <TableHeader className="bg-muted/45">
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: columnCount }, (_, columnIndex) => (
              <TableHead key={columnIndex} className="h-8 px-3">
                <Skeleton
                  className={cn(
                    'h-2.5',
                    cellWidths[columnIndex % cellWidths.length],
                  )}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-transparent">
              {Array.from({ length: columnCount }, (_, columnIndex) => (
                <TableCell key={columnIndex} className="h-11 px-3 py-2">
                  <Skeleton
                    className={cn(
                      'h-3',
                      cellWidths[(rowIndex + columnIndex) % cellWidths.length],
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <span className="sr-only">加载中...</span>
    </div>
  );
}

export function PageLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="加载中..."
      aria-busy="true"
      className={cn('flex min-h-0 flex-1 flex-col bg-card', className)}
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-3">
        <Skeleton className="h-3.5 w-20" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <TableLoadingSkeleton />
      </div>
      <span className="sr-only">加载中...</span>
    </div>
  );
}

export function FormLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="加载中..."
      aria-busy="true"
      className={cn(
        'grid min-h-64 grid-cols-1 gap-x-5 gap-y-4 px-4 py-4 md:grid-cols-2',
        className,
      )}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      ))}
      <span className="sr-only">加载中...</span>
    </div>
  );
}

export function WorkspaceLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="正在加载工作区"
      aria-busy="true"
      className={cn(
        'flex min-h-0 w-full flex-1 overflow-hidden bg-background',
        className,
      )}
    >
      <aside className="hidden w-[11.75rem] shrink-0 flex-col border-r border-border/60 bg-sidebar/70 p-2 md:flex">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-14" />
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className={cn('h-7 w-full', index === 0 && 'bg-primary/15')}
            />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 px-1 py-1.5">
          <Skeleton className="size-7 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2 w-24" />
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40" />
        </div>
        <PageLoadingSkeleton />
        <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/60 px-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-2 w-28" />
        </div>
      </div>
      <span className="sr-only">正在加载工作区</span>
    </div>
  );
}
