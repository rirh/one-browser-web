import { cn } from '@/lib/utils';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  theme?: 'auto' | 'light' | 'dark';
  size?: 'normal' | 'flexible' | 'compact';
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: (errorCode?: string) => void;
  'timeout-callback'?: () => void;
  'unsupported-callback'?: () => void;
};

type TurnstileApi = {
  render: (
    container: string | HTMLElement,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetStatus = 'loading' | 'ready' | 'error';

type TurnstileWidgetProps = {
  siteKey: string;
  action?: string;
  appearance?: TurnstileRenderOptions['appearance'];
  className?: string;
  size?: TurnstileRenderOptions['size'];
  theme?: TurnstileRenderOptions['theme'];
  loadingLabel?: string;
  onTokenChange: (token: string) => void;
  onError?: () => void;
};

let turnstileScriptPromise: Promise<void> | null = null;
const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile';

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget(
  {
    siteKey,
    action = 'login',
    appearance = 'always',
    className,
    size = 'normal',
    theme = 'auto',
    loadingLabel,
    onTokenChange,
    onError,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onErrorRef = useRef(onError);
  const [scriptReady, setScriptReady] = useState(false);
  const [loadState, setLoadState] = useState<TurnstileWidgetStatus>('loading');

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
    onErrorRef.current = onError;
  }, [onError, onTokenChange]);

  useImperativeHandle(ref, () => ({
    reset() {
      const widgetId = widgetIdRef.current;
      if (!widgetId || !window.turnstile) {
        onTokenChangeRef.current('');
        return;
      }

      window.turnstile.reset(widgetId);
      onTokenChangeRef.current('');
    },
  }));

  useEffect(() => {
    let active = true;

    loadTurnstileScript()
      .then(() => {
        if (active) {
          setScriptReady(true);
          setLoadState('loading');
        }
      })
      .catch(() => {
        if (active) {
          setLoadState('error');
          onErrorRef.current?.();
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !containerRef.current) {
      return;
    }

    let active = true;
    const container = containerRef.current;
    const removeRenderedWidget = () => {
      const widgetId = widgetIdRef.current;
      widgetIdRef.current = null;

      if (!widgetId || !window.turnstile) {
        return;
      }

      try {
        window.turnstile.remove(widgetId);
      } catch {
        // Turnstile may already have detached a failed widget.
      }
    };

    try {
      const widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        action,
        appearance,
        theme,
        size,
        callback: (token) => {
          if (!active) {
            return;
          }

          setLoadState('ready');
          onTokenChangeRef.current(token);
        },
        'expired-callback': () => {
          if (!active) {
            return;
          }

          setLoadState('ready');
          onTokenChangeRef.current('');
        },
        'error-callback': () => {
          if (!active) {
            return;
          }

          setLoadState('ready');
          onTokenChangeRef.current('');
        },
        'timeout-callback': () => {
          if (!active) {
            return;
          }

          setLoadState('ready');
          onTokenChangeRef.current('');
        },
        'unsupported-callback': () => {
          if (!active) {
            return;
          }

          setLoadState('error');
          onTokenChangeRef.current('');
          onErrorRef.current?.();
        },
      });
      widgetIdRef.current = widgetId;
      // The external widget is now mounted and ready for user interaction.
      // oxlint-disable-next-line react/set-state-in-effect
      setLoadState('ready');
    } catch {
      setLoadState('error');
      onTokenChangeRef.current('');
      onErrorRef.current?.();
    }

    return () => {
      active = false;
      removeRenderedWidget();
      onTokenChangeRef.current('');
    };
  }, [action, appearance, scriptReady, siteKey, size, theme]);

  if (loadState === 'error') {
    return null;
  }

  const reserveWidgetSpace = appearance === 'always';

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[300px] items-center justify-center',
        reserveWidgetSpace ? 'min-h-[65px]' : 'min-h-0',
        className,
      )}
    >
      {loadState === 'loading' && loadingLabel ? (
        <span className="sr-only" role="status" aria-live="polite">
          {loadingLabel}
        </span>
      ) : null}
      <div ref={containerRef} className="relative w-full" />
    </div>
  );
});

function loadTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser'));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        waitForTurnstile(resolve, reject);
        return;
      }

      existing.addEventListener(
        'load',
        () => {
          existing.dataset.loaded = 'true';
          waitForTurnstile(resolve, reject);
        },
        { once: true },
      );
      existing.addEventListener(
        'error',
        () => {
          turnstileScriptPromise = null;
          reject(new Error('failed to load Turnstile script'));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        waitForTurnstile(resolve, reject);
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        turnstileScriptPromise = null;
        reject(new Error('failed to load Turnstile script'));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function waitForTurnstile(
  resolve: () => void,
  reject: (error: Error) => void,
  attempt = 0,
) {
  if (window.turnstile) {
    resolve();
    return;
  }

  if (attempt > 100) {
    turnstileScriptPromise = null;
    reject(new Error('Turnstile API was not ready after loading'));
    return;
  }

  window.setTimeout(() => waitForTurnstile(resolve, reject, attempt + 1), 20);
}
