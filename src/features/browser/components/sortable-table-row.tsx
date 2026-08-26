import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Row } from '@tanstack/react-table';
import * as React from 'react';

type SortableControls = Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners' | 'setActivatorNodeRef'
> & {
  disabled: boolean;
};

const SortableRowContext = React.createContext<SortableControls | null>(null);

export function SortableBrowserTableRow<TData>({
  row,
  disabled,
  children,
}: {
  row: Row<TData>;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.id, disabled });
  const controls = React.useMemo(
    () => ({
      attributes,
      disabled,
      listeners,
      setActivatorNodeRef,
    }),
    [attributes, disabled, listeners, setActivatorNodeRef],
  );
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <SortableRowContext.Provider value={controls}>
      <TableRow
        ref={setNodeRef}
        style={style}
        className={cn(
          'group/row',
          isDragging && 'relative bg-muted/80 shadow-sm',
        )}
        data-state={row.getIsSelected() ? 'selected' : undefined}
      >
        {children}
      </TableRow>
    </SortableRowContext.Provider>
  );
}

export function BrowserTableDragHandle({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const controls = React.useContext(SortableRowContext);

  if (!controls) {
    return null;
  }
  const {
    attributes,
    disabled: rowDisabled,
    listeners,
    setActivatorNodeRef,
  } = controls;

  return (
    <Button
      ref={setActivatorNodeRef}
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled || rowDisabled}
      className="cursor-grab text-muted-foreground active:cursor-grabbing"
      aria-label="拖拽调整排序"
      {...attributes}
      {...listeners}
    >
      <HugeiconsIcon icon={GripVerticalIcon} strokeWidth={2} />
    </Button>
  );
}
