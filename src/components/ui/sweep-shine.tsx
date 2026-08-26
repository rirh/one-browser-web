import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';
import * as React from 'react';

type SweepShineProps = React.ComponentProps<'span'> & {
  active?: boolean;
  asChild?: boolean;
  variant?: 'surface' | 'text';
};

const SWEEP_SHINE_CSS = `
  @keyframes sweep-shine {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  .sweep-shine {
    -webkit-text-fill-color: transparent;
    background: linear-gradient(
        90deg,
        currentColor 0%,
        currentColor 40%,
        rgba(255, 255, 255, 0.9) 50%,
        currentColor 60%,
        currentColor 100%
      )
      0 0 / 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: 4s linear infinite sweep-shine;
  }

  .sweep-shine-surface {
    background: linear-gradient(
        90deg,
        var(--muted) 0%,
        var(--muted) 40%,
        color-mix(in oklch, var(--muted), var(--foreground) 16%) 50%,
        var(--muted) 60%,
        var(--muted) 100%
      )
      0 0 / 200% 100%;
    animation: 4s linear infinite sweep-shine;
  }

  @media (prefers-reduced-motion: reduce) {
    .sweep-shine {
      animation: none;
      -webkit-text-fill-color: currentColor;
      background: none;
    }

    .sweep-shine-surface {
      animation: none;
      background: var(--muted);
    }
  }
`;

function SweepShine({
  active = true,
  asChild = false,
  className,
  variant = 'text',
  ...props
}: SweepShineProps) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <>
      <style href="sweep-shine" precedence="default">
        {SWEEP_SHINE_CSS}
      </style>
      <Comp
        data-slot="sweep-shine"
        data-variant={variant}
        className={cn(
          active &&
            (variant === 'surface' ? 'sweep-shine-surface' : 'sweep-shine'),
          className,
        )}
        {...props}
      />
    </>
  );
}

export { SweepShine };
