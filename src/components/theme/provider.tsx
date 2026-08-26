import { ThemeProvider as RuntimeThemeProvider } from './runtime';
import * as React from 'react';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <RuntimeThemeProvider>{children}</RuntimeThemeProvider>
  );
}
