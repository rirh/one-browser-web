import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getWebLoginConfig, prepareWebLoginUrl } from '@/features/auth/api';
import { isReducedMotionPreferred } from '@/features/auth/components/auth-motion';
import { desktopInvoke, isTauriRuntime } from '@/lib/desktop';
import {
  AlertCircleIcon,
  ArrowReloadVerticalIcon,
  Login02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { gsap } from 'gsap';
import * as React from 'react';

import { AppImage as Image } from '@/components/app-image';
import { toast } from 'sonner';

const APP_LOGO_SRC = '/pwa-512x512.png';

export type AuthGateStatusProps = {
  title: string;
  message: string;
  tone?: 'loading' | 'error';
  busy?: boolean;
  onRetry?: () => void;
  onLogin?: () => void;
};

export function AuthGateStatus({
  title,
  message,
  tone = 'loading',
  busy = false,
  onRetry,
  onLogin,
}: AuthGateStatusProps) {
  const [openingLogin, setOpeningLogin] = React.useState(false);
  const loginConfig = React.useMemo(() => getWebLoginConfig(), []);
  const isLoading = tone === 'loading';
  const errorPanelRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (isLoading) return;
    const panel = errorPanelRef.current;
    if (!panel) return;

    gsap.killTweensOf(panel);
    if (isReducedMotionPreferred()) {
      gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }
    const tween = gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 10, scale: 0.99 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.48,
        ease: 'power3.out',
      },
    );
    return () => {
      tween.kill();
      gsap.killTweensOf(panel);
    };
  }, [isLoading, message, title]);

  async function openWebLogin() {
    if (onLogin) {
      onLogin();
      return;
    }
    if (isTauriRuntime() && loginConfig.status !== 'ready') {
      toast.error(loginConfig.message);
      return;
    }

    setOpeningLogin(true);
    try {
      const loginUrl = await prepareWebLoginUrl();
      if (isTauriRuntime()) {
        await desktopInvoke('open_external_url', {
          request: { url: loginUrl },
        });
      } else {
        window.location.assign(loginUrl);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '无法打开网页登录');
    } finally {
      setOpeningLogin(false);
    }
  }

  if (isLoading) {
    return <AppLoadingStatus title={title} message={message} />;
  }

  return (
    <main
      className="border-border/60 bg-background text-foreground relative isolate grid min-h-dvh place-items-center overflow-hidden rounded-[var(--app-radius)] border px-6 py-10 shadow-2xl select-none"
      onMouseDown={(event) => void startWindowDrag(event)}
    >
      <div className="bg-muted/20 absolute inset-0" />
      <ThemeToggleButton className="absolute top-3 right-3 z-20" />
      <section
        ref={errorPanelRef}
        className="relative z-10 flex w-full max-w-[23rem] flex-col items-center text-center"
        aria-live="assertive"
      >
        <div className="relative">
          <Image
            src={APP_LOGO_SRC}
            alt="有个浏览器"
            width={56}
            height={56}
            priority
            className="size-14 rounded-[1.1rem] shadow-sm select-none"
            draggable={false}
          />
          <span className="border-background bg-destructive text-destructive-foreground absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border shadow-sm">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              strokeWidth={2.2}
              className="size-3"
              aria-hidden="true"
            />
          </span>
        </div>
        <p className="text-destructive mt-5 text-[0.625rem]/4 font-semibold tracking-[0.18em] uppercase">
          连接失败
        </p>
        <h1 className="text-foreground mt-2 text-xl/7 font-semibold tracking-normal text-balance">
          {title}
        </h1>
        <Card className="border-border/60 bg-card/85 mt-6 w-full py-0 text-left shadow-sm backdrop-blur-sm">
          <CardContent className="flex flex-col gap-4 px-4 py-4">
            <div>
              <p className="text-muted-foreground text-[0.625rem]/4 font-medium tracking-[0.14em] uppercase">
                错误原因
              </p>
              <p className="text-destructive mt-1 font-mono text-sm/5 font-semibold break-words">
                {message}
              </p>
            </div>
            <div className="bg-border/70 h-px" />
            <div>
              <p className="text-muted-foreground text-[0.625rem]/4 font-medium tracking-[0.14em] uppercase">
                详情
              </p>
              <p className="text-muted-foreground mt-1 text-xs/5">
                重试会重新同步账号、权限和工作区数据；如果仍然失败，重新登录刷新授权。
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-5 flex w-full flex-col gap-2">
          <Button
            className="w-full"
            disabled={busy}
            onClick={() => onRetry?.()}
          >
            <HugeiconsIcon
              icon={ArrowReloadVerticalIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {busy ? '正在重试...' : '重试连接'}
          </Button>
          <Button
            variant="outline"
            className="bg-background/70 w-full"
            disabled={openingLogin}
            onClick={() => void openWebLogin()}
          >
            <HugeiconsIcon
              icon={Login02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            重新登录
          </Button>
        </div>
      </section>
    </main>
  );
}

function AppLoadingStatus({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const statusText = formatLoadingStatusText(title, message);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    gsap.killTweensOf(container);
    if (isReducedMotionPreferred()) {
      gsap.set(container, { autoAlpha: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      container,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' },
    );
    return () => {
      tween.kill();
      gsap.killTweensOf(container);
    };
  }, [message, title]);

  return (
    <main
      className="bg-background text-foreground relative isolate flex min-h-dvh items-center justify-center overflow-hidden border-0 px-6 py-8 select-none"
      onMouseDown={(event) => void startWindowDrag(event)}
    >
      <section
        ref={containerRef}
        className="flex w-full max-w-80 flex-col items-center text-center"
        aria-live="polite"
        aria-busy="true"
      >
        <Image
          src={APP_LOGO_SRC}
          alt="有个浏览器"
          width={64}
          height={64}
          priority
          className="size-16 object-contain select-none"
          draggable={false}
        />
        <p className="sr-only">{statusText}</p>
      </section>
    </main>
  );
}

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

function formatLoadingStatusText(title: string, message: string) {
  const normalizedTitle = normalizeStatusSentencePart(title);
  const normalizedMessage = normalizeStatusSentencePart(message);
  return !normalizedMessage || normalizedMessage === normalizedTitle
    ? `${normalizedTitle}。`
    : `${normalizedTitle}，${normalizedMessage}。`;
}

function normalizeStatusSentencePart(value: string) {
  return value.trim().replace(/[。.!！?？]+$/u, '');
}
