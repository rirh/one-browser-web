import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Spinner } from '@/components/ui/spinner';
import {
  consumeAuthExpiredNotice,
  readAuthSessionStatus,
} from '@/features/auth/session';
import { isUnauthorizedAuthError } from '@/features/auth/auth-errors';
import { desktopInvoke, isTauriRuntime } from '@/platform/desktop';
import { Door01Icon, Globe02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { toast } from 'sonner';

import { AppImage as Image } from '@/components/app-image';
import { useRouter, useSearchParams } from '@/router/compat';
import {
  WEB_LOGIN_URL_ENV,
  authorizeDesktopHandoff,
  getCurrentUser,
  getWebLoginConfig,
  prepareWebLoginUrl,
} from './api';
import { InteractiveGridBackground } from './interactive-grid-background';
import { useLoginAppWindowSize } from './use-app-window-size';
import { useAuthDeepLinks } from './use-auth-deep-links';

const APP_LOGO_SRC = '/pwa-512x512.png';

type LoginPageCopy = {
  appLogoAlt: string;
  title: string;
  openAuthLogin: string;
  openingAuthLogin: string;
  copyLoginLink: string;
  copyingLoginLink: string;
  copied: string;
  copySuccess: string;
  copyError: string;
  exitApp: string;
  authExpired: string;
  openLoginError: string;
  exitAppError: string;
  missingLoginUrl: (envName: string) => string;
  unsupportedLoginUrlProtocol: (envName: string) => string;
  invalidLoginUrl: (envName: string) => string;
};

const LOGIN_PAGE_COPY: Record<'zh-CN' | 'en-US', LoginPageCopy> = {
  'zh-CN': {
    appLogoAlt: '有个浏览器',
    title: '登录有个浏览器',
    openAuthLogin: '打开网址授权登录',
    openingAuthLogin: '正在打开...',
    copyLoginLink: '复制登录链接',
    copyingLoginLink: '正在复制...',
    copied: '已复制',
    copySuccess: '登录链接已复制',
    copyError: '无法复制登录链接',
    exitApp: '退出应用',
    authExpired: '登录信息已过期，请重新登录',
    openLoginError: '无法打开网页登录',
    exitAppError: '无法退出应用',
    missingLoginUrl: (envName) => `请配置 ${envName}`,
    unsupportedLoginUrlProtocol: (envName) => `${envName} 只支持 http 或 https`,
    invalidLoginUrl: (envName) => `${envName} 不是有效链接`,
  },
  'en-US': {
    appLogoAlt: 'One Browser',
    title: 'Sign in to One Browser',
    openAuthLogin: 'Authorize sign-in',
    openingAuthLogin: 'Opening...',
    copyLoginLink: 'Copy sign-in link',
    copyingLoginLink: 'Copying...',
    copied: 'Copied',
    copySuccess: 'Sign-in link copied',
    copyError: 'Unable to copy sign-in link',
    exitApp: 'Quit app',
    authExpired: 'Your session has expired. Sign in again.',
    openLoginError: 'Unable to open the sign-in page',
    exitAppError: 'Unable to quit the app',
    missingLoginUrl: (envName) => `Please configure ${envName}`,
    unsupportedLoginUrlProtocol: (envName) =>
      `${envName} only supports http or https`,
    invalidLoginUrl: (envName) => `${envName} is not a valid URL`,
  },
};

async function startWindowDrag(event: React.MouseEvent<HTMLElement>) {
  if (
    event.button !== 0 ||
    event.defaultPrevented ||
    typeof window === 'undefined' ||
    !window.__TAURI_INTERNALS__
  ) {
    return;
  }

  const target = event.target instanceof HTMLElement ? event.target : null;
  if (
    target?.closest(
      'a,button,input,textarea,select,[role="button"],[data-no-window-drag]',
    )
  ) {
    return;
  }

  event.preventDefault();

  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().startDragging();
  } catch (error) {
    console.warn('Window drag failed.', error);
  }
}

type LoginPageProps = {
  authManaged?: boolean;
};

export function LoginPage({ authManaged = false }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const copy = useLoginPageCopy();
  const [opening, setOpening] = React.useState(false);
  const [authNotice, setAuthNotice] = React.useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = React.useState(authManaged);
  const isDesktop = isTauriRuntime();
  const loginConfig = React.useMemo(() => getWebLoginConfig(), []);
  const canOpenLogin = !isDesktop || loginConfig.status === 'ready';
  const loginConfigMessage = localizedLoginConfigMessage(loginConfig, copy);
  const redirectTo = searchParams.get('redirect');
  const safeRedirectTo = React.useMemo(
    () => normalizeAppRedirect(redirectTo),
    [redirectTo],
  );
  const handoff = React.useMemo(
    () => parseDesktopHandoff(searchParams),
    [searchParams],
  );
  const handoffStartedRef = React.useRef(false);

  useLoginAppWindowSize(sessionChecked);

  const applyAuthSession = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    router.replace(safeRedirectTo);
  }, [queryClient, router, safeRedirectTo]);

  useAuthDeepLinks(applyAuthSession, !authManaged && isDesktop);

  React.useEffect(() => {
    if (authManaged) {
      return;
    }

    if (isDesktop) {
      let cancelled = false;
      void readAuthSessionStatus().then((status) => {
        if (cancelled) {
          return;
        }
        if (status.authenticated) {
          applyAuthSession();
          return;
        }
        setSessionChecked(true);
      });

      return () => {
        cancelled = true;
      };
    }

    if (handoffStartedRef.current) {
      return;
    }
    handoffStartedRef.current = true;
    void getCurrentUser()
      .then(async () => {
        if (!handoff) {
          applyAuthSession();
          return;
        }
        const authorization = await authorizeDesktopHandoff();
        window.location.assign(authorization.callback_url);
      })
      .catch((error: unknown) => {
        if (!isUnauthorizedAuthError(error)) {
          setAuthNotice(
            error instanceof Error ? error.message : copy.openLoginError,
          );
        }
        setSessionChecked(true);
      });

    return undefined;
  }, [applyAuthSession, authManaged, copy.openLoginError, handoff, isDesktop]);

  React.useEffect(() => {
    const noticeTimer = window.setTimeout(() => {
      const notice = consumeAuthExpiredNotice();
      if (notice !== null) {
        setAuthNotice(notice || copy.authExpired);
      }
    }, 0);

    return () => window.clearTimeout(noticeTimer);
  }, [copy.authExpired]);

  if (!sessionChecked) {
    return null;
  }

  async function openWebLogin() {
    if (!canOpenLogin) {
      toast.error(localizedLoginConfigMessage(loginConfig, copy));
      return;
    }

    setOpening(true);
    try {
      const loginUrl = await prepareWebLoginUrl(currentBrowserReturnTo());
      if (isDesktop) {
        await desktopInvoke('open_external_url', {
          request: { url: loginUrl },
        });
      } else {
        window.location.assign(loginUrl);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.openLoginError);
    } finally {
      setOpening(false);
    }
  }

  async function exitApp() {
    if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) {
      window.close();
      return;
    }

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.exitAppError);
    }
  }

  return (
    <main
      className="bg-background text-foreground relative isolate grid min-h-dvh place-items-center overflow-hidden rounded-[var(--app-radius)] px-5 py-6"
      onMouseDown={(event) => void startWindowDrag(event)}
    >
      <InteractiveGridBackground />
      <ThemeToggleButton className="absolute top-3 right-3 z-20" />
      <section className="relative z-10 flex w-full max-w-80 flex-col items-center text-center">
        <div className="relative flex size-[4.5rem] items-center justify-center">
          <Image
            src={APP_LOGO_SRC}
            alt={copy.appLogoAlt}
            width={64}
            height={64}
            priority
            className="relative size-16 rounded-[1.35rem] drop-shadow-[0_12px_20px_rgba(15,23,42,0.18)] select-none dark:drop-shadow-[0_14px_22px_rgba(0,0,0,0.4)]"
            draggable={false}
          />
        </div>

        <h1 className="text-foreground mt-4 text-lg/6 font-semibold tracking-normal">
          {copy.title}
        </h1>

        {authNotice ? (
          <Alert className="mt-4" aria-live="polite">
            <AlertDescription>{authNotice}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 flex w-full flex-col gap-2">
          <Button
            className="w-full"
            disabled={opening || !canOpenLogin}
            onClick={() => void openWebLogin()}
            size="lg"
            title={!canOpenLogin ? loginConfigMessage : undefined}
          >
            {opening ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={Globe02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
            )}
            {opening ? copy.openingAuthLogin : copy.openAuthLogin}
          </Button>

          <div className="grid w-full grid-cols-[3fr_2fr] gap-2">
            <CopyButton
              variant="outline"
              className="border-border/70 bg-background/60 hover:bg-muted/70 min-w-0 px-2"
              disabled={!canOpenLogin}
              getText={() => prepareWebLoginUrl(currentBrowserReturnTo())}
              idleLabel={copy.copyLoginLink}
              copyingLabel={copy.copyingLoginLink}
              copiedLabel={copy.copied}
              successMessage={copy.copySuccess}
              errorMessage={copy.copyError}
              size="lg"
            >
              {(stage) =>
                stage === 'copying' ? copy.copyingLoginLink : copy.copyLoginLink
              }
            </CopyButton>

            <Button
              variant="outline"
              className="border-destructive/25 bg-background/60 text-destructive hover:bg-destructive/10 hover:text-destructive min-w-0 px-2"
              onClick={() => void exitApp()}
              size="lg"
            >
              <HugeiconsIcon
                icon={Door01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copy.exitApp}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function useLoginPageCopy() {
  const [locale] = React.useState(resolveLoginPageLocale);
  return LOGIN_PAGE_COPY[locale];
}

function resolveLoginPageLocale(): 'zh-CN' | 'en-US' {
  if (typeof navigator === 'undefined') {
    return 'zh-CN';
  }

  const language = navigator.language.toLowerCase();
  return language.startsWith('zh') ? 'zh-CN' : 'en-US';
}

function localizedLoginConfigMessage(
  loginConfig: ReturnType<typeof getWebLoginConfig>,
  copy: LoginPageCopy,
) {
  if (loginConfig.status === 'ready') {
    return '';
  }

  if (loginConfig.reason === 'missing-env') {
    return copy.missingLoginUrl(WEB_LOGIN_URL_ENV);
  }
  if (loginConfig.reason === 'unsupported-protocol') {
    return copy.unsupportedLoginUrlProtocol(WEB_LOGIN_URL_ENV);
  }
  return copy.invalidLoginUrl(WEB_LOGIN_URL_ENV);
}

function normalizeAppRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

function currentBrowserReturnTo() {
  if (typeof window === 'undefined') {
    return '/';
  }
  return `${window.location.pathname}${window.location.search}`;
}

function parseDesktopHandoff(searchParams: URLSearchParams) {
  const state = searchParams.get('handoff_state')?.trim() || '';
  const codeChallenge = searchParams.get('code_challenge')?.trim() || '';
  if (!isBase64Url256(state) || !isBase64Url256(codeChallenge)) {
    return null;
  }
  return { state, codeChallenge };
}

function isBase64Url256(value: string) {
  return (
    value.length === 43 &&
    [...value].every((character) => /[A-Za-z0-9_-]/.test(character))
  );
}
