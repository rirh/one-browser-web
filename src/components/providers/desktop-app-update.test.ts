import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/browser/status/api', () => ({
  readInjectedAppStatus: vi.fn(),
}));
vi.mock('@/lib/desktop', () => ({
  desktopInvoke: vi.fn(),
  isTauriRuntime: vi.fn(),
}));
vi.mock('@/lib/http', () => ({ http: {} }));

import { evaluateDesktopAppUpdate } from './desktop-app-update';

describe('desktop date version updates', () => {
  it.each([
    ['26.907.1118', true],
    ['26.1001.1', true],
    ['27.101.1', true],
    ['26.907.1117', false],
    ['26.0907.1117', false],
    ['26.906.2359', false],
  ])('compares %s against installed date version', (version, expected) => {
    const result = evaluateDesktopAppUpdate(
      {
        version: '26.907.1117',
        platform: 'macos',
        arch: 'arm64',
        executableSha256: 'a'.repeat(64),
      },
      { version, executableSha256: 'b'.repeat(64) },
    );
    expect(Boolean(result)).toBe(expected);
  });
});
