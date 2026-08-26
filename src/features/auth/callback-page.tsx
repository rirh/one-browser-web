import { AppImage } from '@/components/app-image';
import { Button } from '@/components/ui/button';
import { SweepShine } from '@/components/ui/sweep-shine';
import {
  authorizeDesktopHandoff,
  buildWebLoginUrl,
  completeOidcLogin,
  getCurrentUser,
} from '@/features/auth/api';
import { useEffect, useRef, useState } from 'react';

type CallbackState =
  | { status: 'loading'; message: string }
  | { status: 'error'; message: string };

export function CallbackPage() {
  const started = useRef(false);
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'loading',
    message: '正在完成 One User 登录…',
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const parameters = new URLSearchParams(window.location.search);
    const state = parameters.get('state')?.trim() || '';
    const code = parameters.get('code')?.trim() || '';
    const error = parameters.get('error')?.trim() || '';
    const errorDescription = parameters.get('error_description')?.trim() || '';
    window.history.replaceState(null, '', '/callback');

    if (!state || (!code && !error)) {
      // The callback URL is an external input that is validated after mount.
      // oxlint-disable-next-line react/set-state-in-effect
      setCallbackState({
        status: 'error',
        message: '登录回调参数不完整，请重新登录。',
      });
      return;
    }

    void completeOidcLogin({
      state,
      ...(code ? { code } : {}),
      ...(error ? { error } : {}),
      ...(errorDescription ? { errorDescription } : {}),
    })
      .then(async (result) => {
        await getCurrentUser();
        if (isDesktopCallback(result.returnTo)) {
          const authorization = await authorizeDesktopHandoff();
          if (import.meta.env.DEV) {
            console.info('[auth-deep-link]', authorization.callback_url);
          }
          setCallbackState({
            status: 'loading',
            message: 'App 授权已完成，正在进入 Web…',
          });
          window.setTimeout(() => {
            window.location.replace('/');
          }, 800);
          window.location.assign(authorization.callback_url);
          return;
        }

        window.location.replace(normalizeReturnTo(result.returnTo));
      })
      .catch((callbackError: unknown) => {
        setCallbackState({
          status: 'error',
          message:
            callbackError instanceof Error
              ? callbackError.message
              : '登录失败，请重新尝试。',
        });
      });
  }, []);

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-5 py-12">
      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <AppImage
          src="/pwa-512x512.png"
          alt="有个浏览器"
          width={72}
          height={72}
          className="size-18 rounded-[1.25rem] shadow-sm"
          priority
        />
        {callbackState.status === 'loading' ? (
          <SweepShine asChild>
            <h1 className="mt-7 text-xl font-semibold tracking-tight">
              正在完成授权
            </h1>
          </SweepShine>
        ) : (
          <h1 className="mt-7 text-xl font-semibold tracking-tight">
            授权未完成
          </h1>
        )}
        <p
          className={
            callbackState.status === 'error'
              ? 'text-destructive mt-3 text-sm/6'
              : 'text-muted-foreground mt-3 text-sm/6'
          }
        >
          {callbackState.message}
        </p>
        {callbackState.status === 'error' ? (
          <Button
            className="mt-7"
            onClick={() => window.location.assign(buildWebLoginUrl('/'))}
          >
            重新登录
          </Button>
        ) : null}
      </section>
    </main>
  );
}

function isDesktopCallback(returnTo: string) {
  try {
    const url = new URL(returnTo, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname !== '/callback') {
      return false;
    }
    return url.searchParams.get('desktop') === '1';
  } catch {
    return false;
  }
}

function normalizeReturnTo(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
