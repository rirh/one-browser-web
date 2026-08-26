import { useTheme } from './runtime';
import { type ThemeName, getDomTheme, resolveThemeName } from './shared';

export function useActiveTheme() {
  const { resolvedTheme } = useTheme();
  const theme: ThemeName =
    resolveThemeName(resolvedTheme) ||
    (typeof document === 'undefined' ? 'dark' : getDomTheme());

  return theme;
}
