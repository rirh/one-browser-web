import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

export function ResourceTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={row}
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(7rem, 1fr))`,
          }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} className="h-7 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ResourceError({ error }: { error: unknown }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>数据加载失败</EmptyTitle>
        <EmptyDescription>
          {error instanceof Error ? error.message : '请稍后重试'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function ResourceEmpty() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>暂无数据</EmptyTitle>
        <EmptyDescription>当前权限范围内没有可显示的记录。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
