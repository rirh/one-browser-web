import { TablePagination } from '@/components/table-pagination';
import type { Table } from '@tanstack/react-table';
import type { SystemRecord } from './types';

export function ResourceFooter({
  table,
  total: serverTotal,
}: {
  table: Table<SystemRecord>;
  total?: number;
}) {
  const total = serverTotal ?? table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <TablePagination
      currentPage={pageIndex + 1}
      pageSize={pageSize}
      total={total}
      onPageChange={(page) => table.setPageIndex(page - 1)}
    />
  );
}
