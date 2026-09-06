import { afterEach, expect, it, vi } from 'vitest';
import { getWebLoginConfig } from './api';
import { isTauriRuntime } from '@/lib/desktop';

vi.mock('@/lib/desktop', () => ({ desktopInvoke: vi.fn(), isTauriRuntime: vi.fn() }));
vi.mock('@/lib/http', () => ({ http: {} }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks(); });

it('uses the App login URL ahead of the remote Web build configuration', () => {
  vi.mocked(isTauriRuntime).mockReturnValue(true);
  vi.stubGlobal('window', { __ONE_BROWSER_CONFIG__: { webLoginUrl: 'https://browser.aicbe.com/api/auth/oidc/start' } });
  vi.stubEnv('VITE_WEB_LOGIN_URL', 'https://web.example/api/auth/oidc/start');
  expect(getWebLoginConfig()).toMatchObject({ status: 'ready', url: 'https://browser.aicbe.com/api/auth/oidc/start' });
});

it('ordinary Web visits keep their own environment configuration', () => {
  vi.mocked(isTauriRuntime).mockReturnValue(false);
  vi.stubGlobal('window', { __ONE_BROWSER_CONFIG__: { webLoginUrl: 'https://app.example/api/auth/oidc/start' } });
  vi.stubEnv('VITE_WEB_LOGIN_URL', 'https://web.example/api/auth/oidc/start');
  expect(getWebLoginConfig()).toMatchObject({ status: 'ready', url: 'https://web.example/api/auth/oidc/start' });
});

it('rejects invalid App login configuration', () => {
  vi.mocked(isTauriRuntime).mockReturnValue(true);
  vi.stubGlobal('window', { __ONE_BROWSER_CONFIG__: { webLoginUrl: 'https://browser.aicbe.com/wrong' } });
  expect(getWebLoginConfig().status).toBe('invalid');
});
