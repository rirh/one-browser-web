import type { ReactNode } from 'react';

export function InfoRow({
  label,
  value,
  align = 'right',
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  align?: 'left' | 'right';
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </span>
      <span
        className={`text-foreground text-sm font-medium ${align === 'left' ? 'text-left' : 'text-right'} ${valueClassName ?? ''}`}
      >
        {value}
      </span>
    </div>
  );
}
