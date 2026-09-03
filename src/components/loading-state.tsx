import { SweepShine } from '@/components/ui/sweep-shine';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import * as React from 'react';

export function LoadingState({
  className,
  label = '加载中...',
}: {
  className?: string;
  label?: string;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(
        content,
        { autoAlpha: 0, y: 5 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
      );

      return () => tween.kill();
    });

    return () => media.revert();
  }, []);

  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        'bg-card flex min-h-40 flex-1 items-center justify-center px-4 py-10',
        className,
      )}
    >
      <div ref={contentRef}>
        <SweepShine className="text-muted-foreground text-sm font-medium">
          {label}
        </SweepShine>
      </div>
    </div>
  );
}
