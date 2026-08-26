import type { ProfileMode, RuntimeStatus } from './lifecycle';
import type {
  InlineProxyConfig,
  ProxyCheckResult,
  ProxyCheckStatus,
  ProxyType,
} from './proxy';

export type { PublicRuntimeStatus, RuntimeStatus } from './lifecycle';

export interface RuntimeWebSocketEndpoints {
  puppeteer: string | null;
  selenium: string | null;
}

export interface RuntimeProfile {
  profileId: string;
  profileNo: string | null;
  status: RuntimeStatus;
  pid: number | null;
  startedAt: string | null;
  debugPort: number | null;
  userDataDir: string;
  proxyId: string | null;
  proxyStatus: ProxyCheckResult;
  ws: RuntimeWebSocketEndpoints;
  webdriver: string | null;
  errorMessage: string | null;
  environmentWarnings: string[];
  tunnelGeneration: number | null;
  tunnelLeaseExpiresAt: string | null;
  tunnelRouteExpiresAt: string | null;
}

export type OpenProfileProgressStep =
  | 'checking_proxy'
  | 'proxy_checked'
  | 'preparing_launch'
  | 'launched'
  | 'failed';

export interface OpenProfileProgressPayload {
  profileId: string;
  step: OpenProfileProgressStep;
}

export interface OpenProfileRequest {
  profileId: string;
  startUrl?: string | null;
  tabs?: string[];
  mode?: ProfileMode;
  headless?: boolean;
  tunnelRoute?: TunnelRoute;
}

export interface TunnelRoute {
  transport: 'h2';
  endpoint: string;
  tlsEnabled: boolean;
  accessToken: string;
  expiresAt: string;
  generation: number;
  exitId: string;
  expectedExitIp?: string | null;
  directFallback: false;
}

export interface UpdateTunnelRouteRequest {
  profileId: string;
  generation: number;
  leaseExpiresAt?: string | null;
  tunnelRoute?: TunnelRoute | null;
}

export interface CloseProfileRequest {
  profileId: string;
}

export interface CloseProfileResult {
  profileId: string;
  closed: boolean;
}

export interface CloseAllProfilesResult {
  closed: string[];
}

export interface CheckProxyRequest {
  proxyId?: string;
  profileId?: string;
  proxyConfig?: InlineProxyConfig | null;
  ipChecker?: string | null;
}

export interface RefreshIpRequest {
  profileId: string;
  profileNo?: string | null;
  proxyId?: string | null;
  proxyConfig?: InlineProxyConfig | null;
  refreshUrl?: string | null;
  checkExitIp?: boolean;
  forceReconnect?: boolean;
}

export interface RefreshIpResult {
  profileId: string;
  proxyId: string | null;
  refreshed: boolean;
  runtimeApplied: boolean;
  requiresRestart: boolean;
  proxyStatus: ProxyCheckResult;
  message: string;
}

export interface UpdateProfileProxyRequest {
  profileId: string;
  profileNo?: string | null;
  proxyId?: string | null;
  proxyConfig?: InlineProxyConfig | null;
  failClosed?: boolean;
  applyToRunning?: boolean;
  forceReconnect?: boolean;
  checkExitIp?: boolean;
}

export interface UpdateProfileProxyResult {
  profileId: string;
  proxyId: string | null;
  runtimeApplied: boolean;
  requiresRestart: boolean;
  proxyStatus: ProxyCheckResult;
}

export interface ProfileProxyStatusRequest {
  profileId: string;
}

export interface ProfileProxyStatus {
  profileId: string;
  proxyId: string | null;
  proxyType: ProxyType;
  runtimeApplied: boolean;
  failClosed: boolean;
  exitIp: string | null;
  countryCode: string | null;
  country: string | null;
  region: string | null;
  asn: string | null;
  status: ProxyCheckStatus;
  checkedAt: string | null;
  message: string;
}
