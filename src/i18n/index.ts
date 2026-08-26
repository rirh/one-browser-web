import { enUS } from './messages/en-US';
import type { MessageCatalog } from './messages/types';
import { zhCN } from './messages/zh-CN';

export const defaultLocale = 'zh-CN' as const;

export const locales = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
] as const;

export type Locale = (typeof locales)[number]['code'];

const catalogs: Record<Locale, MessageCatalog> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export function isLocale(value: string | null): value is Locale {
  return locales.some((locale) => locale.code === value);
}

export function translateText(value: string, locale: Locale): string {
  return catalogs[locale][value] ?? value;
}
