import { ThemeProvider as RuntimeThemeProvider } from '@/components/theme/runtime';
import * as React from 'react';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <RuntimeThemeProvider>{children}</RuntimeThemeProvider>
  );
}
