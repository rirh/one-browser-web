import { useSyncExternalStore } from 'react';

export type DesktopPlatform = 'macos' | 'windows' | 'other';

function resolveDesktopPlatform() {
  if (typeof navigator === 'undefined') {
    return 'macos';
  }

  const platform = navigator.platform || '';
  const userAgent = navigator.userAgent || '';

  if (/Mac|iPhone|iPad|iPod/.test(platform)) {
    return 'macos';
  }

  if (/Win/.test(platform) || /Windows/.test(userAgent)) {
    return 'windows';
  }

  return 'other';
}

function subscribePlatform() {
  return () => {};
}

function getServerPlatformSnapshot(): DesktopPlatform {
  return 'macos';
}

export function useDesktopPlatform() {
  return useSyncExternalStore(
    subscribePlatform,
    resolveDesktopPlatform,
    getServerPlatformSnapshot,
  );
}
