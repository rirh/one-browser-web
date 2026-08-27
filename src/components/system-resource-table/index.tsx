import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { listSystemResources } from './api';
import { fieldLabels } from './labels';
import type { StatusFilter, SystemRecord, SystemResourceConfig } from './types';
import { filterByStatus, renderResourceCell } from './resource-cell';
import { ResourceFooter } from './resource-footer';
import {
  ResourceEmpty,
  ResourceError,
  ResourceTableSkeleton,
} from './resource-states';
import { ResourceToolbar } from './resource-toolbar';

export function SystemResourceTable({
  config,
}: {
  config: SystemResourceConfig;
}) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const query = useQuery({
    queryKey: ['system-resource', config.endpoint],
    queryFn: () => listSystemResources(config),
  });
  const columns = React.useMemo<ColumnDef<SystemRecord>[]>(
    () =>
      config.columns.map((field) => ({
        accessorKey: field,
        header: fieldLabels[field] ?? field,
        cell: ({ getValue, row }) =>
          renderResourceCell(field, getValue(), row.original),
        meta: { label: fieldLabels[field] ?? field },
      })),
    [config.columns],
  );
  const records = React.useMemo(
    () => filterByStatus(query.data ?? [], statusFilter),
    [query.data, statusFilter],
  );
  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { columnVisibility, globalFilter: search },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    initialState: { pagination: { pageSize: 15 } },
  });
  return (
    <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <ResourceToolbar
        hasStatus={(query.data ?? []).some((record) => 'status' in record)}
        isFetching={query.isFetching}
        onRefresh={() => void query.refetch()}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        table={table}
        title={config.title}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {query.isLoading ? (
          <ResourceTableSkeleton columns={columns.length} />
        ) : query.isError ? (
          <ResourceError error={query.error} />
        ) : table.getRowModel().rows.length === 0 ? (
          <ResourceEmpty />
        ) : (
          <Table>
            <TableHeader className="bg-muted/70 sticky top-0 z-10 backdrop-blur-xl">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <ResourceFooter table={table} />
    </section>
  );
}
