import { describe, expect, it } from 'vitest';

import {
  isRuntimeRenewCandidate,
  nextRuntimeRenewDelay,
  runtimeRenewIntervalMs,
  runtimeRenewJitterMs,
} from './supervisor-policy';

describe('runtime supervisor policy', () => {
  it('keeps renew delay inside the configured jitter window', () => {
    expect(nextRuntimeRenewDelay(0)).toBe(
      runtimeRenewIntervalMs - runtimeRenewJitterMs,
    );
    expect(nextRuntimeRenewDelay(0.5)).toBe(runtimeRenewIntervalMs);
    expect(nextRuntimeRenewDelay(1)).toBe(
      runtimeRenewIntervalMs + runtimeRenewJitterMs,
    );
  });

  it('renews only active remote runtimes with complete tunnel metadata', () => {
    const runtime = {
      profileId: 'remote-env-42',
      status: 'active',
      tunnelGeneration: 7,
      tunnelRouteExpiresAt: '2026-08-04T00:00:00Z',
    };

    expect(isRuntimeRenewCandidate(runtime)).toBe(true);
    expect(
      isRuntimeRenewCandidate({ ...runtime, profileId: 'profile-42' }),
    ).toBe(false);
    expect(isRuntimeRenewCandidate({ ...runtime, status: 'stopping' })).toBe(
      false,
    );
    expect(
      isRuntimeRenewCandidate({ ...runtime, tunnelGeneration: null }),
    ).toBe(false);
    expect(
      isRuntimeRenewCandidate({ ...runtime, tunnelRouteExpiresAt: null }),
    ).toBe(false);
  });
});
