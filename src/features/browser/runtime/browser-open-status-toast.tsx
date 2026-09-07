import { CopyButton } from '@/components/ui/copy-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SweepShine } from '@/components/ui/sweep-shine';
import { cn } from '@/lib/utils';
import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export type BrowserOpenToastStatus = 'loading' | 'success' | 'error';

type BrowserOpenStatusToastProps = {
  status: BrowserOpenToastStatus;
  title: string;
  description?: string;
  currentStep?: number;
  totalSteps?: number;
  onClose?: () => void;
};

const statusPresentation = {
  loading: null,
  success: {
    icon: CheckmarkCircle02Icon,
    iconClassName: 'text-success',
  },
  error: {
    icon: AlertCircleIcon,
    iconClassName: 'text-destructive',
  },
} as const;

export function BrowserOpenStatusToast({
  status,
  title,
  description,
  currentStep,
  totalSteps,
  onClose,
}: BrowserOpenStatusToastProps) {
  const presentation = statusPresentation[status];
  const hasProgress =
    status === 'loading' &&
    currentStep !== undefined &&
    totalSteps !== undefined;
  const progress = hasProgress
    ? Math.min((currentStep / totalSteps) * 100, 100)
    : 0;

  return (
    <section
      role={status === 'error' ? 'alert' : 'status'}
      aria-live={status === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="border-border bg-popover text-popover-foreground h-auto w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border shadow-lg"
    >
      <div className="flex items-start gap-2.5 p-3">
        {presentation ? (
          <div
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center',
              presentation.iconClassName,
            )}
            aria-hidden="true"
          >
            <HugeiconsIcon
              icon={presentation.icon}
              strokeWidth={2}
              className="size-4"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <SweepShine active={status === 'loading'} asChild>
              <h2 className="min-w-0 text-sm/5 font-semibold break-words">
                {title}
              </h2>
            </SweepShine>
            {hasProgress ? (
              <span className="text-muted-foreground shrink-0 pt-0.5 text-xs/4 tabular-nums">
                {currentStep}/{totalSteps}
              </span>
            ) : null}
          </div>
          {description ? (
            <SweepShine active={status === 'loading'} asChild>
              <p className="text-muted-foreground mt-0.5 max-h-60 overflow-y-auto text-xs/5 break-words whitespace-pre-wrap select-text">
                {description}
              </p>
            </SweepShine>
          ) : null}
          {hasProgress ? (
            <Progress
              value={progress}
              aria-label={`浏览器启动进度 ${currentStep}/${totalSteps}`}
              className="mt-2"
            />
          ) : null}
        </div>

        {status === 'error' ? (
          <CopyButton
            text={[title, description].filter(Boolean).join('\n')}
            variant="ghost"
            size="icon-sm"
            idleLabel="复制错误信息"
          />
        ) : null}
        {status !== 'loading' && onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="关闭启动状态提示"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
