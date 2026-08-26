import { AnimatedSegmentedTabs } from '@/components/ui/animated-segmented-tabs';
import { cn } from '@/lib/utils';
import {
  ComputerIcon,
  Moon02Icon,
  Sun02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import { useTheme } from './runtime';
import { type ThemeName, applyThemeToRoot, getDomTheme } from './shared';

type ThemeMode = 'system' | 'light' | 'dark';
type ThemePointer = { x: number; y: number };

type ViewTransition = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => ViewTransition;
};

const themeModes = [
  { value: 'light', label: '浅色模式', icon: Sun02Icon },
  { value: 'dark', label: '深色模式', icon: Moon02Icon },
  { value: 'system', label: '跟随系统', icon: ComputerIcon },
] as const;

const THEME_TOGGLE_VIEW_TRANSITION_CSS = `
  @supports (view-transition-name: none) {
    :root {
      view-transition-name: root;
    }

    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    ::view-transition-old(root) {
      z-index: 1;
    }

    ::view-transition-new(root) {
      z-index: 9999;
    }

    [data-theme-switching='dark']::view-transition-old(root) {
      z-index: 9999;
    }

    [data-theme-switching='dark']::view-transition-new(root) {
      z-index: 1;
    }
  }
`;

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function getSystemTheme(): ThemeName {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveThemeMode(theme: ThemeMode): ThemeName {
  return theme === 'system' ? getSystemTheme() : theme;
}

function ThemeToggleViewTransitionStyles() {
  return <style>{THEME_TOGGLE_VIEW_TRANSITION_CSS}</style>;
}

export function ThemeModeToggle({
  className,
  display = 'compact',
}: {
  className?: string;
  display?: 'compact' | 'full';
}) {
  const { theme, setTheme } = useTheme();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pointerRef = React.useRef<ThemePointer | null>(null);
  const transitionFrameRef = React.useRef<number | null>(null);
  const value = isThemeMode(theme) ? theme : 'system';
  const options = React.useMemo(
    () =>
      themeModes.map((mode) => ({
        value: mode.value,
        tooltip: mode.label,
        label: (
          <>
            <HugeiconsIcon
              icon={mode.icon}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className={display === 'compact' ? 'sr-only' : undefined}>
              {mode.label}
            </span>
          </>
        ),
      })),
    [display],
  );

  React.useEffect(() => {
    return () => {
      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
    };
  }, []);

  function updateTheme(nextMode: ThemeMode, nextResolvedTheme: ThemeName) {
    applyThemeToRoot(nextResolvedTheme);
    setTheme(nextMode);
  }

  function getTransitionOrigin(): ThemePointer {
    const pointer = pointerRef.current;

    if (pointer) {
      return pointer;
    }

    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function startThemeTransition(nextTheme: ThemeMode, origin: ThemePointer) {
    const nextResolvedTheme = resolveThemeMode(nextTheme);
    if (getDomTheme() === nextResolvedTheme) {
      updateTheme(nextTheme, nextResolvedTheme);
      return;
    }

    const transitionDocument = document as DocumentWithViewTransition;
    const supportsTransition =
      typeof transitionDocument.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsTransition) {
      updateTheme(nextTheme, nextResolvedTheme);
      return;
    }

    const { x, y } = origin;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    if (nextResolvedTheme === 'dark') {
      document.documentElement.dataset.themeSwitching = 'dark';
    } else {
      delete document.documentElement.dataset.themeSwitching;
    }

    const transition = transitionDocument.startViewTransition(() => {
      updateTheme(nextTheme, nextResolvedTheme);
    });

    void transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath:
              nextResolvedTheme === 'dark' ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
            pseudoElement:
              nextResolvedTheme === 'dark'
                ? '::view-transition-old(root)'
                : '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        delete document.documentElement.dataset.themeSwitching;
      });

    window.setTimeout(() => {
      delete document.documentElement.dataset.themeSwitching;
    }, 550);
  }

  function handleThemeChange(nextTheme: ThemeMode) {
    if (nextTheme === value) {
      return;
    }

    const origin = getTransitionOrigin();

    if (transitionFrameRef.current !== null) {
      window.cancelAnimationFrame(transitionFrameRef.current);
    }

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      transitionFrameRef.current = window.requestAnimationFrame(() => {
        transitionFrameRef.current = null;
        startThemeTransition(nextTheme, origin);
      });
    });
  }

  return (
    <div
      ref={rootRef}
      className={cn('inline-flex shrink-0', className)}
      onPointerDownCapture={(event) => {
        pointerRef.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <ThemeToggleViewTransitionStyles />
      <AnimatedSegmentedTabs
        label="主题"
        options={options}
        value={value}
        onValueChange={handleThemeChange}
        className={display === 'full' ? 'w-full' : undefined}
        listClassName={cn(
          display === 'compact'
            ? 'h-6 rounded-md p-0.5'
            : 'grid h-auto w-full grid-cols-3 gap-2 rounded-none bg-transparent p-0',
        )}
        triggerClassName={cn(
          display === 'compact'
            ? 'min-w-6 px-1.5'
            : 'h-8 rounded-md border border-input px-1.5 text-xs text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:ring-1 data-[state=active]:ring-primary/40',
        )}
        highlightClassName={display === 'full' ? 'hidden' : undefined}
      />
    </div>
  );
}
