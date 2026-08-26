import type { BrowserSystemValue } from './browser-system-options';
import type { ProfileEditorForm, SystemFingerprintDefaults } from './types';

export type FingerprintOperatingSystem =
  | BrowserSystemValue
  | 'linux'
  | 'android'
  | 'ios'
  | 'chromeos';

const operatingSystemLabels: Record<FingerprintOperatingSystem, string> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  chromeos: 'ChromeOS',
};

export function resolveHostOperatingSystem(
  defaults: SystemFingerprintDefaults,
) {
  return firstKnownOperatingSystem([
    defaults.system,
    defaults.platform,
    defaults.userAgent,
  ]);
}

export function localFingerprintOsConflict(
  form: ProfileEditorForm,
  defaults: SystemFingerprintDefaults,
) {
  const hostSystem = resolveHostOperatingSystem(defaults);

  if (!hostSystem) {
    return null;
  }

  const fields = [
    {
      label: '系统',
      value: form.system.trim() || defaults.system,
    },
    {
      label: '用户代理',
      value: form.userAgent.trim() || defaults.userAgent,
    },
    {
      label: 'UA-CH 平台',
      value: form.platform.trim() || defaults.platform,
    },
  ];
  const conflictingFields = fields
    .filter((field) => {
      const fieldSystem = resolveFingerprintOperatingSystem(field.value);
      return fieldSystem !== null && fieldSystem !== hostSystem;
    })
    .map((field) => field.label);

  if (conflictingFields.length === 0) {
    return null;
  }

  const hostLabel = operatingSystemLabels[hostSystem];

  return {
    hostSystem,
    message: `本机为 ${hostLabel}，${conflictingFields.join('、')}与本机系统不一致。仅可保存 ${hostLabel} 指纹。`,
  };
}

export function resolveFingerprintOperatingSystem(
  value: string,
): FingerprintOperatingSystem | null {
  if (/android/i.test(value)) {
    return 'android';
  }

  if (/iphone|ipad|ipod|\bios\b/i.test(value)) {
    return 'ios';
  }

  if (/\bcros\b|chrome\s?os/i.test(value)) {
    return 'chromeos';
  }

  if (/windows|win32|win64/i.test(value)) {
    return 'windows';
  }

  if (/macos|mac os|macintosh|macintel/i.test(value)) {
    return 'macos';
  }

  if (/linux|\bx11\b/i.test(value)) {
    return 'linux';
  }

  return null;
}

function firstKnownOperatingSystem(values: string[]) {
  for (const value of values) {
    const operatingSystem = resolveFingerprintOperatingSystem(value);

    if (operatingSystem) {
      return operatingSystem;
    }
  }

  return null;
}
