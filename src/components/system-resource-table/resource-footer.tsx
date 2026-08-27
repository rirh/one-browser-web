import { Button } from '@/components/ui/button';
import type { Table } from '@tanstack/react-table';
import type { SystemRecord } from './types';

export function ResourceFooter({ table }: { table: Table<SystemRecord> }) {
  const total = table.getFilteredRowModel().rows.length;
  if (!total) return null;
  return (
    <div className="bg-muted/30 flex h-10 shrink-0 items-center justify-between gap-2 border-t px-3">
      <span className="text-muted-foreground text-xs">共 {total} 条</span>
      {table.getPageCount() > 1 ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            第 {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount()} 页
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            上一页
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            下一页
          </Button>
        </div>
      ) : null}
    </div>
  );
}
