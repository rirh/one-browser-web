import type { PageResult, ProxyConfig } from '@/features/browser/contracts';

export function sanitizeProxyConfig(proxy: ProxyConfig): ProxyConfig {
  return {
    ...proxy,
    password: proxy.password ? null : proxy.password,
  };
}

export function sanitizePage<T>(
  page: PageResult<T>,
  sanitizeItem: (item: T) => T,
): PageResult<T> {
  return {
    ...page,
    list: page.list.map(sanitizeItem),
  };
}
