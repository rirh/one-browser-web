import type {
  AppReleaseIdentity,
  AppStatus,
  ChromiumDownloadResult,
  ChromiumDownloadStartResult,
  ChromiumPathStatus,
  PageResult,
} from '@/features/browser/contracts';
import {
  mockProfiles,
  mockProxies,
  mockRuntime,
  mockSettings,
} from '@/lib/desktop/mock/state';

const packageAppVersion = __APP_VERSION__;

export function mockResult<T>(value: unknown) {
  return Promise.resolve(value as T);
}

export function mockAppStatus(): AppStatus {
  const apiRunning = mockSettings.apiEnabled;
  return {
    appVersion: packageAppVersion,
    rustVersion: 'rustc 1.77.2',
    apiStatus: {
      enabled: mockSettings.apiEnabled,
      running: apiRunning,
      host: mockSettings.apiHost,
      port: mockSettings.apiPort,
      message: apiRunning ? '本地 API 运行中' : '本地 API 已关闭',
    },
    appDataDir: '/tmp/one-browser',
    settings: mockSettings,
    chromiumPath: mockChromiumPath(mockSettings.chromiumPath),
    capabilities: {
      tauriCommands: false,
      localApi: apiRunning,
      chromiumLaunch: false,
      dynamicProxy: false,
      proxyCheck: false,
      networkAvailable: true,
    },
    runningCount: mockRuntime.size,
    profileCount: mockProfiles.size,
    proxyCount: mockProxies.size,
  };
}

export function mockAppReleaseIdentity(): AppReleaseIdentity {
  const target = mockChromiumDownloadTarget();
  return {
    version: packageAppVersion,
    platform: target.platform,
    arch: target.arch,
    executableSha256: '0'.repeat(64),
  };
}

export function mockChromiumPath(path: unknown): ChromiumPathStatus {
  return {
    path: typeof path === 'string' && path.length > 0 ? path : null,
    exists: false,
    executable: false,
    message: '模拟浏览器运行环境',
  };
}

export function mockChromiumDownloadTarget() {
  const platform =
    typeof navigator === 'undefined' ? '' : navigator.platform.toLowerCase();
  return platform.includes('mac')
    ? { platform: 'macos', arch: 'arm64' }
    : { platform: 'windows', arch: 'x64' };
}

export function mockDownloadStart(): ChromiumDownloadStartResult {
  return { started: true, message: '浏览器下载已在后台启动' };
}

export function mockInstallChromium(
  request?: Record<string, unknown>,
): ChromiumDownloadResult {
  return {
    platform: String(request?.platform ?? 'macos'),
    arch: String(request?.arch ?? 'arm64'),
    url: String(request?.url ?? ''),
    version: String(request?.version ?? ''),
    localVersion: String(request?.version ?? ''),
    path: `/tmp/one-browser/chromium/${String(request?.version ?? 'current')}/Chromium`,
    downloaded: false,
  };
}

export function mockPage<T>(list: T[]): PageResult<T> {
  return {
    list,
    total: list.length,
    page: 1,
    pageSize: list.length || 20,
  };
}
