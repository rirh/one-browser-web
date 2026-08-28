import { NumberTicker } from '@/components/number-ticker';
import gsap from 'gsap';
import type { LucideIcon } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';

import { safeNumber } from '../format';

export function QuickStatCard({
  icon: Icon,
  label,
  value,
  hint,
  percent,
  formatValue,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  percent: number;
  formatValue: (value: number) => string;
  className?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const clampedPercent = safeNumber(percent);

  useLayoutEffect(() => {
    const node = barRef.current;
    if (!node) return;
    const context = gsap.context(() => {
      gsap.to(node, {
        width: `${clampedPercent}%`,
        duration: 0.6,
        ease: 'power2.out',
      });
    }, node);
    return () => context.revert();
  }, [clampedPercent]);

  return (
    <div
      className={`bg-card/80 relative overflow-hidden rounded-2xl px-4 py-4 shadow-none ${className ?? ''}`}
    >
      <div
        aria-hidden
        ref={barRef}
        className="from-primary/25 via-primary/10 pointer-events-none absolute inset-y-0 left-0 w-0 bg-gradient-to-r to-transparent transition-[width]"
        style={{ width: `${clampedPercent}%` }}
      />
      <div className="relative flex items-center gap-3">
        <span className="bg-muted/40 text-muted-foreground flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            {label}
          </span>
          <NumberTicker
            value={Number.isFinite(value) ? value : 0}
            formatValue={formatValue}
            className="text-foreground text-lg leading-none font-semibold"
          />
          <span
            className="text-muted-foreground/80 truncate text-xs"
            title={hint}
          >
            {hint}
          </span>
        </div>
      </div>
    </div>
  );
}
