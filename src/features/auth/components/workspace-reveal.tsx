import { isReducedMotionPreferred } from '@/features/auth/components/auth-motion';
import { gsap } from 'gsap';
import * as React from 'react';

export function WorkspaceReveal({ children }: React.PropsWithChildren) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.killTweensOf(container);
    if (isReducedMotionPreferred()) {
      gsap.set(container, { autoAlpha: 1, scale: 1 });
      return;
    }

    const tween = gsap.fromTo(
      container,
      { autoAlpha: 0, scale: 0.992 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.42,
        delay: 0.06,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
      },
    );
    return () => {
      tween.kill();
      gsap.killTweensOf(container);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-dvh w-full overflow-hidden">
      {children}
    </div>
  );
}
