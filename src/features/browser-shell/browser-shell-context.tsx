import * as React from 'react';

interface BrowserShellContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const BrowserShellContext =
  React.createContext<BrowserShellContextValue | null>(null);

export function BrowserShellProvider({ children }: React.PropsWithChildren) {
  const [search, setSearch] = React.useState('');
  const value = React.useMemo(() => ({ search, setSearch }), [search]);

  return (
    <BrowserShellContext.Provider value={value}>
      {children}
    </BrowserShellContext.Provider>
  );
}

export function useBrowserShell() {
  const context = React.useContext(BrowserShellContext);

  if (!context) {
    throw new Error('useBrowserShell must be used within DashboardShell.');
  }

  return context;
}
