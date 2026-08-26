import type {
  CloseAllProfilesResult,
  CloseProfileResult,
  ProfileProxyStatus,
  RefreshIpResult,
  RuntimeProfile,
  UpdateProfileProxyResult,
} from '@/features/browser/contracts';
import {
  mockNow,
  mockProfiles,
  mockProxyCheck,
  mockRuntime,
} from '@/platform/desktop/mock/state';
import { nullableString, stringValue } from '@/platform/desktop/mock/values';

export function mockUpdateProfileProxy(
  request?: Record<string, unknown>,
): UpdateProfileProxyResult {
  return {
    profileId: stringValue(request?.profileId) ?? '',
    proxyId: nullableString(request?.proxyId),
    runtimeApplied: false,
    requiresRestart: true,
    proxyStatus: mockProxyCheck,
  };
}

export function mockRefreshIp(
  request?: Record<string, unknown>,
): RefreshIpResult {
  return {
    profileId: stringValue(request?.profileId) ?? '',
    proxyId: nullableString(request?.proxyId),
    refreshed: false,
    runtimeApplied: false,
    requiresRestart: true,
    proxyStatus: mockProxyCheck,
    message: '已跳过模拟刷新',
  };
}

export function mockProfileProxyStatus(
  request?: Record<string, unknown>,
): ProfileProxyStatus {
  return {
    profileId: stringValue(request?.profileId) ?? '',
    proxyId: null,
    proxyType: 'no_proxy',
    runtimeApplied: false,
    failClosed: false,
    exitIp: null,
    countryCode: null,
    country: null,
    region: null,
    asn: null,
    status: 'unchecked',
    checkedAt: null,
    message: '模拟代理状态',
  };
}

export function mockOpenProfile(
  request?: Record<string, unknown>,
): RuntimeProfile {
  const profileId = stringValue(request?.profileId) ?? '';
  const runtime: RuntimeProfile = {
    profileId,
    profileNo: mockProfiles.get(profileId)?.profileNo ?? null,
    status: 'active',
    pid: null,
    startedAt: mockNow,
    debugPort: null,
    userDataDir: `/tmp/one-browser/profiles/${profileId}`,
    proxyId: mockProfiles.get(profileId)?.proxyId ?? null,
    proxyStatus: mockProxyCheck,
    environmentWarnings: [],
    ws: { puppeteer: null, selenium: null },
    webdriver: null,
    errorMessage: null,
    tunnelGeneration: null,
    tunnelLeaseExpiresAt: null,
    tunnelRouteExpiresAt: null,
  };
  mockRuntime.set(profileId, runtime);
  return runtime;
}

export function mockCloseProfile(
  request?: Record<string, unknown>,
): CloseProfileResult {
  const profileId = stringValue(request?.profileId) ?? '';
  mockRuntime.delete(profileId);
  return { profileId, closed: true };
}

export function mockCloseAllProfiles(): CloseAllProfilesResult {
  const closed = [...mockRuntime.keys()];
  mockRuntime.clear();
  return { closed };
}
