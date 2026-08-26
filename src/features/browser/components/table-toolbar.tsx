import {
  AnimatedSegmentedTabs,
  type AnimatedSegmentedTabsOption,
} from '@/components/ui/animated-segmented-tabs';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { refreshWithSuccessToast } from '@/features/browser/refresh';
import { cn } from '@/lib/utils';
import { Refresh01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

export type BrowserStatusFilter = 'all' | '0' | '1';

export const BROWSER_STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: '0', label: '启用' },
  { value: '1', label: '停用' },
] as const satisfies readonly AnimatedSegmentedTabsOption<BrowserStatusFilter>[];

type BrowserTableToolbarProps = {
  filters: React.ReactNode;
  actions: React.ReactNode;
};

export function BrowserTableToolbar({
  filters,
  actions,
}: BrowserTableToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5 border-b bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-4">
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center">
        {filters}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {actions}
      </div>
    </div>
  );
}

type BrowserTableFilterTabsProps<TValue extends string> = {
  label: string;
  options: readonly AnimatedSegmentedTabsOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
};

export function BrowserTableFilterTabs<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
}: BrowserTableFilterTabsProps<TValue>) {
  return (
    <AnimatedSegmentedTabs
      label={label}
      options={options}
      value={value}
      listClassName="h-6 rounded-md p-0.5"
      triggerClassName="rounded-sm px-2 text-xs"
      highlightClassName="rounded-sm"
      onValueChange={onValueChange}
    />
  );
}

type BrowserTableSearchFieldProps = {
  value: string;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  onValueChange: (value: string) => void;
};

export function BrowserTableSearchField({
  value,
  placeholder,
  ariaLabel,
  className,
  onValueChange,
}: BrowserTableSearchFieldProps) {
  return (
    <InputGroup className={cn('h-6', className)}>
      <InputGroupAddon className="h-full py-0">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupInput
        className="h-full py-0 text-xs/relaxed"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </InputGroup>
  );
}

type BrowserTableRefreshButtonProps = {
  isRefreshing: boolean;
  onRefresh: () => Promise<{ isError: boolean }>;
  successMessage: string;
};

export function BrowserTableRefreshButton({
  isRefreshing,
  onRefresh,
  successMessage,
}: BrowserTableRefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isRefreshing}
      aria-busy={isRefreshing || undefined}
      onClick={() => void refreshWithSuccessToast(onRefresh, successMessage)}
    >
      {isRefreshing ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <HugeiconsIcon
          icon={Refresh01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
      )}
      刷新
    </Button>
  );
}
