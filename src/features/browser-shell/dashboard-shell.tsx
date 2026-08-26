import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useDesktopPlatform } from '@/platform/desktop/use-desktop-platform';
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
  const usesNativeFrame = platform !== 'macos';

  const contextValue = React.useMemo(() => ({ search, setSearch }), [search]);

  return (
    <BrowserShellContext.Provider value={contextValue}>
      <SidebarProvider
        className="h-dvh flex-col bg-background"
        style={
          {
            '--sidebar-width': '11.75rem',
            '--header-height': '2.5rem',
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden bg-background',
            usesNativeFrame
              ? 'rounded-none border-0 shadow-none'
              : 'rounded-[var(--app-radius)] border border-border/70 shadow-2xl',
          )}
        >
          {usesNativeFrame ? null : <SiteHeader />}
          <div className="flex min-h-0 flex-1">
            <AppSidebar collapsible="none" className="border-r bg-sidebar/70" />
            <SidebarInset className="min-w-0 rounded-none bg-card shadow-none md:m-0 md:peer-data-[variant=inset]:m-0">
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
    </BrowserShellContext.Provider>
  );
}
