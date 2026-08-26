import { SweepShine } from '@/components/ui/sweep-shine';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <SweepShine variant="surface" asChild>
      <div
        data-slot="skeleton"
        className={cn('rounded-md', className)}
        {...props}
      />
    </SweepShine>
  );
}

export { Skeleton };
