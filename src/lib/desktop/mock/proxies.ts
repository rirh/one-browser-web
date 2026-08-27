import type {
  CheckProxyRequest,
  DeleteProxiesResult,
  InlineProxyConfig,
  ProxyCheckResult,
  ProxyConfig,
  ProxyListItem,
  ProxyType,
} from '@/features/browser/contracts';
import { mockNow, mockProxies, mockProxyCheck } from '@/lib/desktop/mock/state';
import {
  mustGet,
  nullableString,
  proxyTypeValue,
  stringArray,
  stringValue,
  toStringList,
} from '@/lib/desktop/mock/values';

export function mockCreateProxy(
  request?: Record<string, unknown>,
): ProxyConfig {
  const proxyId =
    stringValue(request?.proxyId) ?? `proxy-${mockProxies.size + 1}`;
  const proxy: ProxyConfig = {
    proxyId,
    name: stringValue(request?.name) ?? proxyId,
    type: proxyTypeValue(request?.type),
    host: nullableString(request?.host),
    port: typeof request?.port === 'number' ? request.port : null,
    username: nullableString(request?.username),
    password: nullableString(request?.password),
    server: nullableString(request?.server),
    pacUrl: nullableString(request?.pacUrl),
    bypassList: stringArray(request?.bypassList),
    refreshUrl: nullableString(request?.refreshUrl),
    ipChecker: nullableString(request?.ipChecker),
    remark: stringValue(request?.remark) ?? '',
    createdAt: mockNow,
    updatedAt: mockNow,
    lastCheck: mockProxyCheck,
  };
  mockProxies.set(proxyId, proxy);
  return proxy;
}

export function mockUpdateProxy(
  request?: Record<string, unknown>,
): ProxyConfig {
  const proxy = mustGet(mockProxies, request?.proxyId, 'proxy');
  const updated = {
    ...proxy,
    ...request,
    password:
      request && Object.hasOwn(request, 'password')
        ? nullableString(request.password)
        : proxy.password,
    updatedAt: mockNow,
  } as ProxyConfig;
  mockProxies.set(updated.proxyId, updated);
  return updated;
}

export function mockDeleteProxies(
  request?: Record<string, unknown>,
): DeleteProxiesResult {
  const deleted = toStringList(request?.proxyIds);
  deleted.forEach((proxyId) => mockProxies.delete(proxyId));
  return { deleted, affectedProfiles: [] };
}

export function mockCheckProxy<T>(
  request?: Partial<CheckProxyRequest>,
): Promise<T> {
  const proxyId = stringValue(request?.proxyId);
  const inline = request?.proxyConfig ?? null;
  const storedProxy = proxyId ? mockProxies.get(proxyId) : undefined;
  const target =
    inline ?? (storedProxy ? proxyToInlineValue(storedProxy) : null);
  const hasEndpoint =
    target?.type === 'no_proxy' || Boolean(target?.host && target.port);
  const checkerName = request?.ipChecker?.includes('ip-api')
    ? 'IP-API'
    : 'IP2Location';
  const result: ProxyCheckResult = hasEndpoint
    ? {
        status: 'ok',
        exitIp: mockExitIp(target),
        countryCode: 'HK',
        country: 'Hong Kong',
        region: '开发环境',
        asn: 'AS-MOCK',
        latencyMs: 38,
        checkedAt: new Date().toISOString(),
        message: `模拟 ${checkerName} 检测完成`,
      }
    : {
        status: 'error',
        exitIp: null,
        countryCode: null,
        country: null,
        region: null,
        asn: null,
        latencyMs: null,
        checkedAt: new Date().toISOString(),
        message: '请先填写代理 Host 和端口',
      };

  if (storedProxy) {
    storedProxy.lastCheck = result;
    mockProxies.set(storedProxy.proxyId, storedProxy);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(result as T), 500);
  });
}

export function toProxyListItem(proxy: ProxyConfig): ProxyListItem {
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
    lastCheck: proxy.lastCheck,
  };
}

export function proxyToInlineValue(proxy: ProxyConfig): InlineProxyConfig {
  return {
    type: proxy.type,
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    password: proxy.password,
    server: proxy.server,
    pacUrl: proxy.pacUrl,
    bypassList: proxy.bypassList,
  };
}

export function formatStoredProxyUrl(proxy: ProxyConfig) {
  return formatProxyUrlParts(
    proxy.type,
    proxy.host,
    proxy.port,
    proxy.server,
    proxy.pacUrl,
    proxy.name,
  );
}

export function formatInlineProxyUrl(proxy: InlineProxyConfig) {
  return formatProxyUrlParts(
    proxy.type,
    proxy.host,
    proxy.port,
    proxy.server,
    proxy.pacUrl,
    proxy.type,
  );
}

function mockExitIp(proxy: InlineProxyConfig | null) {
  if (proxy?.type === 'no_proxy') {
    return '127.0.0.1';
  }
  const seed = `${proxy?.host ?? 'proxy'}:${proxy?.port ?? 0}`;
  const bucket = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `43.103.50.${(bucket % 200) + 10}`;
}

function formatProxyUrlParts(
  type: ProxyType,
  host: string | null,
  port: number | null,
  server: string | null,
  pacUrl: string | null,
  fallback: string,
) {
  if (server?.trim()) {
    return server.trim();
  }
  if (host?.trim() && port) {
    return `${proxyProtocol(type)}://${proxyHost(host.trim())}:${port}`;
  }
  if (pacUrl?.trim()) {
    return pacUrl.trim();
  }
  return type === 'no_proxy' ? '无代理' : fallback;
}

function proxyHost(host: string) {
  return host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
}

function proxyProtocol(type: ProxyType) {
  if (type === 'http' || type === 'https' || type === 'socks5') {
    return type;
  }
  if (type === 'pac_script') {
    return 'pac';
  }
  return type === 'no_proxy' ? 'direct' : 'proxy';
}
