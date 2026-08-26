import type {
  CheckProxyRequest,
  InlineProxyConfig,
  ProxyCheckResult,
} from '@/features/browser/contracts';

export const noProxyConfig = {
  type: 'no_proxy',
  host: null,
  port: null,
  username: null,
  password: null,
  server: null,
  pacUrl: null,
  bypassList: [],
} satisfies InlineProxyConfig;

export function createNoProxyCheckRequest(
  ipChecker: string | null = null,
): CheckProxyRequest {
  return {
    proxyConfig: noProxyConfig,
    ipChecker,
  };
}

export function formatProxyCheckResult(
  result: ProxyCheckResult,
  fallback = '暂无检测结果',
) {
  if (result.exitIp) {
    const country = result.country || result.countryCode?.toUpperCase();
    const location = [country, result.region].filter(Boolean).join(' / ');

    return [result.exitIp, location].filter(Boolean).join(' · ');
  }

  return result.message || fallback;
}

export function formatProxyCheckLocation(result: ProxyCheckResult) {
  const region = result.country || result.countryCode?.toUpperCase();
  const ip = result.exitIp;

  if (region && ip) {
    return `${region} (${ip})`;
  }

  return region || ip || result.message || '未知';
}
