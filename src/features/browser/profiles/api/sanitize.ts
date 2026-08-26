import type {
  InlineProxyConfig,
  ProfileConfig,
} from '@/features/browser/contracts';

export function sanitizeInlineProxyConfig(
  proxyConfig: InlineProxyConfig | null,
): InlineProxyConfig | null {
  if (!proxyConfig) return null;
  return {
    ...proxyConfig,
    password: proxyConfig.password ? null : proxyConfig.password,
  };
}

export function sanitizeProfileConfig(profile: ProfileConfig): ProfileConfig {
  return {
    ...profile,
    proxyConfig: sanitizeInlineProxyConfig(profile.proxyConfig),
  };
}
