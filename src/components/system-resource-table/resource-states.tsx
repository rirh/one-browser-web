import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { TableLoadingSkeleton } from '@/components/loading-skeleton';

export function ResourceTableSkeleton({ columns }: { columns: number }) {
  return <TableLoadingSkeleton columnCount={columns} />;
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
