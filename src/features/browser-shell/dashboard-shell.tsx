import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DesktopAppGateProvider } from '@/lib/desktop/app-gate';
import { isTauriRuntime } from '@/lib/desktop';
import { useDesktopPlatform } from '@/lib/desktop/use-desktop-platform';
import * as React from 'react';

import { AppFooter } from './components/app-footer';
import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from './components/site-header';

interface BrowserShellContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const BrowserShellContext =
  React.createContext<BrowserShellContextValue | null>(null);

export function useBrowserShell() {
  const context = React.useContext(BrowserShellContext);

  if (!context) {
    throw new Error('useBrowserShell must be used within DashboardShell.');
  }

  return context;
}

export function DashboardShell({ children }: React.PropsWithChildren) {
  const [search, setSearch] = React.useState('');
  const platform = useDesktopPlatform();
  const showSiteHeader = isTauriRuntime() && platform === 'macos';

  const contextValue = React.useMemo(() => ({ search, setSearch }), [search]);

  return (
    <BrowserShellContext.Provider value={contextValue}>
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
    </BrowserShellContext.Provider>
  );
}
