import type { AppDownloadTarget } from './api';

type NavigatorUserAgentData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    architecture?: string;
    bitness?: string;
    platform?: string;
  }>;
};

export const TARGET_OPTIONS = [
  { platform: 'macos', arch: 'arm64', label: 'macOS Apple 芯片' },
  { platform: 'macos', arch: 'x64', label: 'macOS Intel' },
  { platform: 'windows', arch: 'x64', label: 'Windows 64 位' },
  { platform: 'linux', arch: 'x64', label: 'Linux 64 位' },
] satisfies Array<AppDownloadTarget & { label: string }>;

export const PLATFORM_OPTIONS = [
  { platform: 'macos', label: 'macOS' },
  { platform: 'windows', label: 'Windows' },
  { platform: 'linux', label: 'Linux' },
] as const;

export function getTargetLabel(target: AppDownloadTarget) {
  return (
    TARGET_OPTIONS.find((item) => sameTarget(item, target))?.label ??
    `${target.platform} ${target.arch}`
  );
}

export function getTargetsForPlatform(platform: string) {
  return TARGET_OPTIONS.filter((item) => item.platform === platform);
}

export function getDefaultTargetForPlatform(
  platform: string,
  preferredTarget: AppDownloadTarget,
) {
  const platformTargets = getTargetsForPlatform(platform);
  return (
    platformTargets.find((item) => sameTarget(item, preferredTarget)) ??
    platformTargets.find((item) => item.arch === preferredTarget.arch) ??
    platformTargets[0] ??
    TARGET_OPTIONS[0]
  );
}

export function normalizeTarget(target: AppDownloadTarget) {
  return getDefaultTargetForPlatform(target.platform, target);
}

export function targetKey(target: AppDownloadTarget) {
  return `${target.platform}:${target.arch}`;
}

export function sameTarget(
  left: AppDownloadTarget,
  right: AppDownloadTarget,
) {
  return left.platform === right.platform && left.arch === right.arch;
}

export function detectBrowserTargetSync(): AppDownloadTarget {
  if (typeof navigator === 'undefined') {
    return { platform: 'macos', arch: 'arm64' };
  }

  const userAgentData = getUserAgentData();
  const source = [
    userAgentData?.platform,
    navigator.platform,
    navigator.userAgent,
  ]
    .filter(Boolean)
    .join(' ');
  const platform = resolvePlatform(source, 'macos');

  return { platform, arch: resolveArch(source, platform) };
}

export async function detectBrowserTarget(): Promise<AppDownloadTarget> {
  const fallback = detectBrowserTargetSync();
  const userAgentData = getUserAgentData();

  if (!userAgentData?.getHighEntropyValues) {
    return fallback;
  }

  try {
    const values = await userAgentData.getHighEntropyValues([
      'architecture',
      'bitness',
      'platform',
    ]);
    const source = [
      values.platform,
      userAgentData.platform,
      values.architecture,
      values.bitness,
    ]
      .filter(Boolean)
      .join(' ');
    const platform = resolvePlatform(source, fallback.platform);
    return { platform, arch: resolveArch(source, platform) };
  } catch {
    return fallback;
  }
}

function getUserAgentData() {
  return (navigator as Navigator & { userAgentData?: NavigatorUserAgentData })
    .userAgentData;
}

function resolvePlatform(source: string, fallback: string) {
  if (/win/i.test(source)) return 'windows';
  if (/mac|iphone|ipad|ipod/i.test(source)) return 'macos';
  if (/linux|x11/i.test(source)) return 'linux';
  return fallback;
}

function resolveArch(source: string, platform: string) {
  if (/arm|aarch64/i.test(source)) return 'arm64';
  if (/x86_64|x64|win64|amd64|intel/i.test(source)) return 'x64';
  return platform === 'macos' ? 'arm64' : 'x64';
}
