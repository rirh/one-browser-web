import { Button } from '@/components/ui/button';
import { SweepShine } from '@/components/ui/sweep-shine';
import { Dialog } from '@base-ui/react/dialog';
import * as React from 'react';

export interface UpdateAvailableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void | Promise<void>;
  title?: string;
  description?: string;
  updateLabel?: string;
  updatingLabel?: string;
  closeLabel?: string;
  resetUpdatingAfterUpdate?: boolean;
}

export function UpdateAvailableDialog({
  open,
  onOpenChange,
  onUpdate,
  title = '发现新版本',
  description = '新版本已经准备好，更新后即可使用。',
  updateLabel = '更新',
  updatingLabel = '正在更新…',
  closeLabel = '关闭',
  resetUpdatingAfterUpdate = false,
}: UpdateAvailableDialogProps) {
  const [updating, setUpdating] = React.useState(false);

  async function handleUpdate() {
    setUpdating(true);
    try {
      await onUpdate?.();
    } finally {
      if (resetUpdatingAfterUpdate) {
        setUpdating(false);
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <Dialog.Popup
          initialFocus={false}
          finalFocus={false}
          aria-live="polite"
          aria-atomic="true"
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-5xl origin-bottom rounded-2xl border border-border/70 bg-popover/95 px-5 py-5 text-popover-foreground shadow-xl shadow-foreground/10 outline-none backdrop-blur-xl transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none data-[starting-style]:translate-y-2 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:translate-y-2 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 sm:inset-x-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-5 text-muted-foreground sm:text-base">
                {description}
              </Dialog.Description>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
              <Button
                type="button"
                size="lg"
                onClick={() => void handleUpdate()}
                disabled={updating}
                aria-busy={updating || undefined}
                className="min-w-24 rounded-xl px-5"
              >
                {updating ? (
                  <SweepShine>{updatingLabel}</SweepShine>
                ) : (
                  updateLabel
                )}
              </Button>
              <Dialog.Close
                render={
                  <Button type="button" variant="ghost" size="lg" />
                }
                disabled={updating}
                className="min-w-20 rounded-xl px-4"
              >
                {closeLabel}
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
