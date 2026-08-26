import type {
  CheckProxyRequest,
  CreateProxyRequest,
  ProxyCheckResult,
  ProxyConfig,
  ProxyListItem,
  ProxyType,
} from '@/features/browser/contracts';

import type { RemoteProxyDialogState } from './components/proxy-editor-dialog';
import type {
  RemoteProxyCheckConfigResource,
  RemoteProxyCheckResultPayload,
  RemoteProxyPayload,
  RemoteProxyResource,
  RemoteProxyType,
  RemoteStatusFlag,
} from './types';

export function proxyDialogKey(state: RemoteProxyDialogState | null) {
  if (!state) {
    return 'closed';
  }
  return state.mode === 'edit'
    ? `edit:${state.record.proxy_id}:${state.record.updated_at ?? ''}`
    : 'create';
}

export function remoteProxyToListItem(
  proxy: RemoteProxyResource,
  localCheckResult?: ProxyCheckResult,
  statusOverride?: RemoteStatusFlag,
): ProxyListItem {
  return {
    proxyId: String(proxy.proxy_id),
    name: proxy.name,
    type: remoteProxyTypeToLocal(proxy.type),
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    hasPassword: proxy.has_password,
    ipChecker: proxy.ip_checker,
    remark: proxy.remark,
    profileCount: proxy.linked_environment_count,
    relatedProfileNo: proxy.linked_environment_names,
    lastCheck: localCheckResult ?? remoteProxyCheckToLocal(proxy),
    enabled: (statusOverride ?? proxy.status) === '0',
  };
}

export function remoteProxyToProxyConfig(
  proxy: RemoteProxyResource,
): ProxyConfig {
  return {
    proxyId: String(proxy.proxy_id),
    name: proxy.name,
    type: remoteProxyTypeToLocal(proxy.type),
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    password: null,
    server: proxy.server,
    pacUrl: proxy.pac_url,
    bypassList: [],
    refreshUrl: proxy.refresh_url,
    ipChecker: proxy.ip_checker,
    remark: proxy.remark,
    createdAt: proxy.created_at,
    updatedAt: proxy.updated_at ?? proxy.created_at,
    lastCheck: remoteProxyCheckToLocal(proxy),
  };
}

export function remoteProxyCheckToLocal(
  proxy: RemoteProxyResource,
): ProxyCheckResult {
  return {
    status: proxy.last_check_status,
    exitIp: proxy.last_check_exit_ip,
    countryCode: proxy.last_check_country_code,
    country: proxy.last_check_country,
    region: proxy.last_check_region,
    asn: proxy.last_check_asn,
    latencyMs: proxy.last_check_latency_ms,
    checkedAt: proxy.last_check_checked_at,
    message: proxy.last_check_message,
  };
}

export function remoteProxyCheckResultPayload(
  result: ProxyCheckResult,
): RemoteProxyCheckResultPayload {
  return {
    last_check_status: result.status,
    exit_ip: result.exitIp,
    country_code: result.countryCode,
    country: result.country,
    region: result.region,
    asn: result.asn,
    latency_ms: result.latencyMs,
    message: result.message,
  };
}

export function remoteProxyCheckRequest(
  proxy: RemoteProxyCheckConfigResource,
): CheckProxyRequest {
  return {
    proxyConfig: {
      type: remoteProxyTypeToLocal(proxy.type),
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password,
      server: proxy.server,
      pacUrl: proxy.pac_url,
      bypassList: [],
    },
    ipChecker: proxy.ip_checker,
  };
}

export function remoteProxyPayloadFromResource(
  proxy: RemoteProxyResource,
  overrides: Partial<RemoteProxyPayload> = {},
): RemoteProxyPayload {
  return {
    team_id: proxy.team_id,
    owner_member_id: proxy.owner_member_id,
    proxy_key: proxy.proxy_key,
    name: proxy.name,
    type: proxy.type,
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    server: proxy.server,
    pac_url: proxy.pac_url,
    refresh_url: proxy.refresh_url,
    ip_checker: proxy.ip_checker,
    status: proxy.status,
    remark: proxy.remark,
    ...overrides,
  };
}

export function remoteProxyPayloadFromCreateRequest(
  teamId: number,
  request: CreateProxyRequest,
): RemoteProxyPayload {
  return {
    team_id: teamId,
    proxy_key: request.proxyId,
    name: request.name ?? request.proxyId,
    type: remoteProxyTypeFromLocal(request.type),
    host: request.host ?? null,
    port: request.port ?? null,
    username: request.username ?? null,
    password: request.password ?? undefined,
    server: request.server ?? null,
    pac_url: request.pacUrl ?? null,
    refresh_url: request.refreshUrl ?? null,
    ip_checker: request.ipChecker ?? null,
    status: '0',
    remark: request.remark ?? '',
  };
}

export function remoteProxyDuplicatePayload(
  proxy: RemoteProxyResource,
  teamId: number,
): RemoteProxyPayload {
  const suffix = Date.now().toString(36);
  return {
    ...remoteProxyPayloadFromResource(proxy),
    team_id: teamId,
    proxy_key: `${proxy.proxy_key}-copy-${suffix}`,
    name: `${proxy.name} 副本`,
  };
}

function remoteProxyTypeToLocal(type: RemoteProxyType): ProxyType {
  if (
    type === 'http' ||
    type === 'https' ||
    type === 'socks5' ||
    type === 'fixed_servers' ||
    type === 'pac_script' ||
    type === 'no_proxy'
  ) {
    return type;
  }
  return 'socks5';
}

function remoteProxyTypeFromLocal(type: ProxyType): RemoteProxyType {
  return type;
}

export function fallbackCopyText(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('copy failed');
  }
}
