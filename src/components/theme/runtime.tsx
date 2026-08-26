import * as React from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

const THEME_STORAGE_KEY = 'theme';
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === 'system' ? systemTheme() : theme;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'system';
  });
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() =>
    typeof window === 'undefined' ? 'dark' : resolveTheme(theme),
  );

  const setTheme = React.useCallback((nextTheme: ThemeMode) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const nextResolvedTheme = resolveTheme(theme);
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
    };

    syncTheme();
    media.addEventListener('change', syncTheme);
    return () => media.removeEventListener('change', syncTheme);
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }
  return context;
}
