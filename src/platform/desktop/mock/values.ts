import type { ProfileConfig, ProxyType } from '@/features/browser/contracts';
import { DesktopApiError } from '@/platform/desktop/types';

export function mustGet<T>(
  map: Map<string, T>,
  id: unknown,
  label: 'profile' | 'proxy',
): T {
  const key = stringValue(id);
  const value = key ? map.get(key) : undefined;
  if (!value) {
    throw new DesktopApiError(
      label === 'profile' ? '环境不存在' : '代理不存在',
      { code: 40401 },
    );
  }
  return value;
}

export function stringValue(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function nullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function toStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function nullableBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

export function numberOrNull(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function profileModeValue(value: unknown): ProfileConfig['mode'] {
  return value === 'compat' || value === 'strict' || value === 'dev'
    ? value
    : 'standard';
}

export function proxyTypeValue(value: unknown): ProxyType {
  return value === 'https' ||
    value === 'socks5' ||
    value === 'fixed_servers' ||
    value === 'pac_script' ||
    value === 'no_proxy'
    ? value
    : 'http';
}

export function inlineProxyValue(value: unknown): ProfileConfig['proxyConfig'] {
  if (value === null || value === undefined) {
    return null;
  }

  const proxy = recordValue(value);
  return {
    type: proxyTypeValue(proxy.type),
    host: nullableString(proxy.host),
    port: numberOrNull(proxy.port),
    username: nullableString(proxy.username),
    password: nullableString(proxy.password),
    server: nullableString(proxy.server),
    pacUrl: nullableString(proxy.pacUrl),
    bypassList: stringArray(proxy.bypassList),
  };
}
