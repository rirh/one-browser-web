import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DesktopAppGateProvider } from '@/lib/desktop/app-gate';
import { isTauriRuntime } from '@/lib/desktop';
import { useDesktopPlatform } from '@/lib/desktop/use-desktop-platform';
import * as React from 'react';

import { AppFooter } from './components/app-footer';
import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from './components/site-header';
import { BrowserShellProvider } from './browser-shell-context';

export { useBrowserShell } from './browser-shell-context';

export function DashboardShell({ children }: React.PropsWithChildren) {
  const platform = useDesktopPlatform();
  const showSiteHeader = isTauriRuntime() && platform === 'macos';

  return (
    <BrowserShellProvider>
      <DesktopAppGateProvider>
        <SidebarProvider
          className="bg-background h-dvh flex-col"
          style={
            {
              '--sidebar-width': '11.75rem',
              '--header-height': '2.5rem',
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              'bg-background flex min-h-0 flex-1 flex-col overflow-hidden',
              showSiteHeader
                ? 'border-border/70 rounded-[var(--app-radius)] border shadow-2xl'
                : 'rounded-none border-0 shadow-none',
            )}
          >
            {showSiteHeader ? <SiteHeader /> : null}
            <div className="flex min-h-0 flex-1">
              <AppSidebar
                collapsible="none"
                className="bg-sidebar/70 border-r"
              />
              <SidebarInset className="bg-card min-w-0 rounded-none shadow-none md:m-0 md:peer-data-[variant=inset]:m-0">
                <div
                  data-slot="app-content"
                  className="app-content-container flex min-h-0 w-full flex-1 flex-col"
                >
                  {children}
                </div>
              </SidebarInset>
            </div>
            <AppFooter />
          </div>
        </SidebarProvider>
      </DesktopAppGateProvider>
    </BrowserShellProvider>
  );
}
