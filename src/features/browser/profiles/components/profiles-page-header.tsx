import { RefreshButton } from '@/components/refresh-button';
import { Button } from '@/components/ui/button';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function ProfilesPageHeader({
  onCreate,
  isRefreshing,
  onRefresh,
}: {
  onCreate: () => void;
  isRefreshing: boolean;
  onRefresh: () => Promise<{ isError: boolean }>;
}) {
  return (
    <div className="border-border/60 flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-medium">环境</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RefreshButton
          variant="outline"
          size="sm"
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          successMessage="环境列表已刷新"
        />
        <Button size="sm" onClick={onCreate}>
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          新建
        </Button>
      </div>
    </div>
  );
}
