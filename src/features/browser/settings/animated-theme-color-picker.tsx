import { THEME_COLOR_OPTIONS, type ThemeColor } from '@/components/theme';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { gsap } from 'gsap';
import { Check } from 'lucide-react';
import * as React from 'react';

const SWATCH_SIZE = 20;
const SWATCH_GAP = 6;
const INDICATOR_SIZE = 28;
const INDICATOR_STEP = SWATCH_SIZE + SWATCH_GAP;
const PICKER_WIDTH =
  INDICATOR_SIZE + (THEME_COLOR_OPTIONS.length - 1) * INDICATOR_STEP;

export function AnimatedThemeColorPicker({
  labelledBy,
  onValueChange,
  value,
}: {
  labelledBy: string;
  onValueChange: (value: ThemeColor) => void;
  value: ThemeColor;
}) {
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const checkRefs = React.useRef(new Map<ThemeColor, SVGSVGElement>());
  const initializedRef = React.useRef(false);

  const setCheckRef = React.useCallback(
    (optionValue: ThemeColor) => (node: SVGSVGElement | null) => {
      if (node) {
        checkRefs.current.set(optionValue, node);
        return;
      }
      checkRefs.current.delete(optionValue);
    },
    [],
  );

  React.useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const selectedIndex = THEME_COLOR_OPTIONS.findIndex(
      (option) => option.value === value,
    );
    const reducedMotion = prefersReducedMotion();
    const shouldAnimate = initializedRef.current && !reducedMotion;

    if (!indicator || selectedIndex < 0) return;

    const indicatorX = selectedIndex * INDICATOR_STEP;
    gsap.killTweensOf(indicator);

    if (shouldAnimate) {
      gsap.to(indicator, {
        autoAlpha: 1,
        duration: 0.32,
        ease: 'power3.out',
        overwrite: 'auto',
        x: indicatorX,
      });
    } else {
      gsap.set(indicator, { autoAlpha: 1, x: indicatorX });
    }

    checkRefs.current.forEach((check, optionValue) => {
      const selected = optionValue === value;
      gsap.killTweensOf(check);

      if (!shouldAnimate) {
        gsap.set(check, {
          autoAlpha: selected ? 1 : 0,
          rotation: 0,
        });
        return;
      }

      if (selected) {
        gsap.fromTo(
          check,
          { autoAlpha: 0, rotation: -24 },
          {
            autoAlpha: 1,
            duration: 0.24,
            ease: 'power3.out',
            rotation: 0,
          },
        );
        return;
      }

      gsap.to(check, {
        autoAlpha: 0,
        duration: 0.12,
        ease: 'power2.out',
        rotation: 0,
      });
    });

    initializedRef.current = true;
  }, [value]);

  React.useEffect(() => {
    const checks = checkRefs.current;
    const indicator = indicatorRef.current;

    return () => {
      if (indicator) gsap.killTweensOf(indicator);
      checks.forEach((check) => gsap.killTweensOf(check));
    };
  }, []);

  return (
    <div className="flex h-[28px] w-full shrink-0 items-center justify-center">
      <div
        className="relative h-[28px] shrink-0"
        style={{ contain: 'layout', width: PICKER_WIDTH }}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 size-[28px] rounded-full border-2 border-foreground/70 opacity-0 will-change-transform"
        />
        <ToggleGroup
          type="single"
          size="sm"
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue) onValueChange(nextValue as ThemeColor);
          }}
          aria-labelledby={labelledBy}
          className="absolute top-[4px] left-[4px] flex h-[20px] flex-nowrap gap-[6px]"
        >
          {THEME_COLOR_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              title={option.label}
              className="size-[20px] min-h-[20px] min-w-[20px] rounded-full border-0 p-0 text-white shadow-none transition-[box-shadow,filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=on]:bg-transparent"
              style={{ backgroundColor: option.swatch }}
            >
              <Check
                ref={setCheckRef(option.value)}
                className="size-[12px] text-white opacity-0 drop-shadow-sm"
                strokeWidth={3}
                aria-hidden="true"
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
