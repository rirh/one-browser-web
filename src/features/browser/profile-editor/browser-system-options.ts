export type BrowserSystemValue = 'macos' | 'windows';

export type BrowserVersion = {
  label: string;
  architecture: string;
  platformVersion: string;
  userAgent: string;
};

export type BrowserSystemOption = {
  value: BrowserSystemValue;
  label: string;
  platform: string;
  versions: BrowserVersion[];
};

export const chromeMajorVersion = 148;
export const chromeFullVersion = `${chromeMajorVersion}.0.7778.178`;

export const browserSystems = [
  {
    value: 'macos',
    label: 'macOS',
    platform: 'macOS',
    versions: ['26', '15', '14', '13'].map((version) => ({
      label: `macOS ${version}`,
      architecture: 'arm',
      platformVersion: `${version}.0.0`,
      userAgent: macosUserAgent(chromeFullVersion),
    })),
  },
  {
    value: 'windows',
    label: 'Windows',
    platform: 'Windows',
    versions: [
      {
        label: 'Windows 11',
        platformVersion: '15.0.0',
      },
      {
        label: 'Windows 10',
        platformVersion: '10.0.0',
      },
    ].map((version) => ({
      ...version,
      architecture: 'x86',
      userAgent: windowsUserAgent(chromeFullVersion),
    })),
  },
] satisfies BrowserSystemOption[];

export const allGeneratedUserAgents = new Set(
  browserSystems.flatMap((system) =>
    system.versions.map((version) => version.userAgent),
  ),
);

export function resolveBrowserSystem(system: string): BrowserSystemValue {
  if (/win/i.test(system)) {
    return 'windows';
  }

  return 'macos';
}

export function resolveBrowserVersion(
  system: BrowserSystemOption,
  systemLabel: string,
) {
  return (
    system.versions.find((version) => version.label === systemLabel) ??
    system.versions[0]
  );
}

export function browserUserAgent(
  system: BrowserSystemOption,
  chromeVersion: string,
) {
  return system.value === 'windows'
    ? windowsUserAgent(chromeVersion)
    : macosUserAgent(chromeVersion);
}

export function randomChromeFullVersion() {
  return chromeFullVersion;
}

export function randomPlatformVersion(
  system: BrowserSystemOption,
  version: BrowserVersion,
) {
  if (system.value === 'windows') {
    return version.platformVersion;
  }

  const majorVersion = version.platformVersion.split('.')[0] || '15';

  return `${majorVersion}.${randomInteger(0, 6)}.${randomInteger(0, 9)}`;
}

export function randomArchitecture(system: BrowserSystemOption) {
  if (system.value === 'windows') {
    return 'x86';
  }

  return Math.random() > 0.5 ? 'arm' : 'x86';
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function windowsUserAgent(chromeVersion: string) {
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
}

function macosUserAgent(chromeVersion: string) {
  return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
}
