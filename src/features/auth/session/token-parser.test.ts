import {
  createAuthTokens,
  createLegacyAuthTokensFromCallbackUrl,
} from '@/features/auth/session/token-parser';
import { describe, expect, it } from 'vitest';

describe('auth token parsing', () => {
  it('does not parse token-bearing callback URLs on the default path', () => {
    const callback =
      'one-browser://auth/callback?access_token=access&refresh_token=refresh';

    expect(createAuthTokens({ access_token: callback })).toBeNull();
  });

  it('keeps old callback parsing behind an explicit legacy helper', () => {
    const tokens = createLegacyAuthTokensFromCallbackUrl(
      'one-browser://auth/callback?access_token=access&refresh_token=refresh&expires_in=300',
    );

    expect(tokens).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 300,
      source: 'legacy-callback',
    });
  });

  it('accepts plain token response fields without logging or URL decoding', () => {
    expect(
      createAuthTokens({
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in: 300,
      }),
    ).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 300,
      source: 'payload',
    });
  });
});
