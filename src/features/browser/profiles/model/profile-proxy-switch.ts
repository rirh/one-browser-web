import type {
  ProxyCheckResult,
  ProxyConfig,
  ProxyListItem,
  ProxyType,
} from '@/features/browser/contracts';

import { resolveCountryCode } from '../../components/country-flag';

export type ProxySwitchMode = 'none' | 'static' | 'rotating';

export const emptyProxyValue = '__empty__';
export const noProxyValue = '__none__';
export const proxyModeOptions: Array<{
  label: string;
  value: ProxySwitchMode;
}> = [
  { value: 'none', label: '无代理' },
  { value: 'static', label: '固定代理' },
  { value: 'rotating', label: '动态代理' },
];

export function proxyConfigToListItem(
  proxy: ProxyConfig,
  lastCheck: ProxyCheckResult = proxy.lastCheck,
): ProxyListItem {
  return {
    proxyId: proxy.proxyId,
    name: proxy.name,
    type: proxy.type,
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    hasPassword: Boolean(proxy.password),
    ipChecker: proxy.ipChecker,
    remark: proxy.remark,
    profileCount: 0,
    relatedProfileNo: [],
    lastCheck,
  };
}

export function formatSavedProxyUrl(proxy: ProxyListItem) {
  if (proxy.host && proxy.port) {
    return `${proxyProtocol(proxy.type)}://${formatProxyHost(proxy.host)}:${proxy.port}`;
  }
  return proxy.name || proxy.proxyId;
}

function formatProxyHost(host: string) {
  return host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
}

function proxyProtocol(type: ProxyType) {
  if (type === 'http' || type === 'https' || type === 'socks5') return type;
  if (type === 'pac_script') return 'pac';
  if (type === 'no_proxy') return 'direct';
  return 'proxy';
}

export function proxyLocation(proxy: ProxyListItem) {
  const code = resolveCountryCode(
    proxy.lastCheck.countryCode,
    proxy.lastCheck.country,
  );
  const country = proxy.lastCheck.country || code || null;
  const ip = proxy.lastCheck.exitIp || proxy.host;
  if (country && ip) return `${country} (${ip})`;
  if (country) return country;
  if (ip) return `未检测 (${ip})`;
  return proxy.lastCheck.message || '未检测';
}
