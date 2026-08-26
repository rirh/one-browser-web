export const THEME_COLOR_STORAGE_KEY = 'one-browser.theme-color';
export const THEME_COLOR_CHANGE_EVENT = 'one-browser:theme-color-change';

export const THEME_COLOR_OPTIONS = [
  {
    value: 'default',
    label: '跟随应用默认',
    swatch: 'var(--theme-color-default)',
  },
  { value: 'zinc', label: '雾灰', swatch: 'var(--theme-color-zinc)' },
  { value: 'red', label: '红色', swatch: 'var(--theme-color-red)' },
  { value: 'rose', label: '玫红', swatch: 'var(--theme-color-rose)' },
  {
    value: 'orange',
    label: '橙色',
    swatch: 'var(--theme-color-orange)',
  },
  { value: 'green', label: '绿色', swatch: 'var(--theme-color-green)' },
  { value: 'blue', label: '蓝色', swatch: 'var(--theme-color-blue)' },
  { value: 'yellow', label: '琥珀', swatch: 'var(--theme-color-yellow)' },
  {
    value: 'violet',
    label: '紫罗兰',
    swatch: 'var(--theme-color-violet)',
  },
] as const;

export type ThemeColor = (typeof THEME_COLOR_OPTIONS)[number]['value'];
export type ThemeColorOption = (typeof THEME_COLOR_OPTIONS)[number];

export const DEFAULT_THEME_COLOR: ThemeColor = 'default';

const themeColors = new Set<string>(
  THEME_COLOR_OPTIONS.map((option) => option.value),
);

export function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === 'string' && themeColors.has(value);
}
