export function RouteProgress({ active }: { active: boolean }) {
  return (
    <div
      role={active ? 'progressbar' : undefined}
      aria-label="页面切换中"
      aria-hidden={!active}
      className={
        active
          ? 'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden opacity-100 transition-opacity duration-100'
          : 'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden opacity-0 transition-opacity delay-150 duration-100'
      }
    >
      <div
        className={
          active
            ? 'route-progress-running bg-primary h-full origin-left shadow-[0_0_8px_var(--primary)]'
            : 'route-progress-complete bg-primary h-full origin-left shadow-[0_0_8px_var(--primary)]'
        }
      />
    </div>
  );
}
