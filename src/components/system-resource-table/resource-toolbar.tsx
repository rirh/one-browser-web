import { AnimatedSegmentedTabs } from '@/components/ui/animated-segmented-tabs';
import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  ArrowDown01Icon,
  Search01Icon,
  SlidersHorizontalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Table } from '@tanstack/react-table';
import { fieldLabels } from './labels';
import type { StatusFilter, SystemRecord } from './types';

const options = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
] satisfies Array<{ label: string; value: StatusFilter }>;

export function ResourceToolbar({
  hasStatus,
  isFetching,
  onRefresh,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  table,
  title,
  actions,
}: {
  hasStatus: boolean;
  isFetching: boolean;
  onRefresh: () => void | Promise<{ isError?: boolean }>;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  table: Table<SystemRecord>;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40 flex shrink-0 flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        {hasStatus ? (
          <AnimatedSegmentedTabs
            label="状态筛选"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={options}
          />
        ) : null}
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`搜索${title}`}
          />
        </InputGroup>
      </div>
      <div className="flex items-center justify-end gap-2">
        {actions}
        <RefreshButton
          size="sm"
          variant="outline"
          isRefreshing={isFetching}
          onRefresh={onRefresh}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              <HugeiconsIcon
                icon={SlidersHorizontalIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              列
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>显示列</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(Boolean(checked))
                    }
                  >
                    {fieldLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
