import type { ProxyListItem } from '@/features/browser/contracts';

export function proxyAddress(proxy: ProxyListItem) {
  if (proxy.host && proxy.port) {
    return `${proxy.type}://${proxy.host}:${proxy.port}`;
  }
  return proxy.name || proxy.proxyId;
}
