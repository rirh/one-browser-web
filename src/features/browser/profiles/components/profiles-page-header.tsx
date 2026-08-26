import { Button } from '@/components/ui/button';
import { Add01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function ProfilesPageHeader({
  onCreate,
  onRefresh,
}: {
  onCreate: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 px-4 py-2">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-medium">环境</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <HugeiconsIcon
            icon={Refresh01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          刷新
        </Button>
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
