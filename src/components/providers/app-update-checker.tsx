import { UpdateAvailableDialog } from '@/components/update-available-dialog';
import { desktopInvoke, isTauriRuntime } from '@/lib/desktop';
import * as React from 'react';

import {
  DESKTOP_APP_DOWNLOAD_URL,
  type DesktopAppUpdate,
  findDesktopAppUpdate,
} from './desktop-app-update';

const APP_UPDATE_CHECKER_WORKER_URL = '/app-update-checker.worker.js';

type AppUpdateCheckerWorkerMessage =
  | {
      type: 'baseline' | 'unchanged' | 'unavailable';
      url: string;
      source?: string;
    }
  | {
      type: 'changed';
      url: string;
      source?: string;
      current?: PageValidator;
      previous?: PageValidator;
    }
  | {
      type: 'error';
      url: string;
      source?: string;
      message?: string;
    };

type PageValidator = {
  etag: string | null;
  lastModified: string | null;
};

export function AppUpdateChecker() {
  const [pageUpdateAvailable, setPageUpdateAvailable] = React.useState(false);
  const [desktopUpdate, setDesktopUpdate] =
    React.useState<DesktopAppUpdate | null>(null);
  const desktopCheckInFlight = React.useRef(false);

  React.useEffect(() => {
    if (
      !import.meta.env.PROD ||
      typeof window === 'undefined' ||
      typeof Worker === 'undefined' ||
      !isHttpProtocol(window.location.protocol)
    ) {
      return;
    }

    let worker: Worker;

    try {
      worker = new Worker(APP_UPDATE_CHECKER_WORKER_URL, {
        name: 'app-update-checker',
        type: 'module',
      });
    } catch (error) {
      console.warn('App update checker worker failed to start.', error);
      return;
    }

    const requestCheck = (source: string) => {
      if (document.visibilityState === 'hidden') {
        return;
      }

      worker.postMessage({
        type: 'check',
        source,
        url: window.location.href,
      });
    };

    const handleWorkerMessage = (
      event: MessageEvent<AppUpdateCheckerWorkerMessage>,
    ) => {
      const message = event.data;
      if (!message) {
        return;
      }

      if (message.type === 'changed') {
        setPageUpdateAvailable(true);
        return;
      }

      if (message.type === 'error') {
        console.debug('App update check failed.', message.message);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestCheck('visibilitychange');
      }
    };

    worker.addEventListener('message', handleWorkerMessage);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    requestCheck('mount');

    return () => {
      worker.removeEventListener('message', handleWorkerMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      worker.terminate();
    };
  }, []);

  const requestDesktopCheck = React.useCallback(async (source: string) => {
    if (
      !import.meta.env.PROD ||
      !isTauriRuntime() ||
      desktopCheckInFlight.current
    ) {
      return;
    }

    desktopCheckInFlight.current = true;
    try {
      const update = await findDesktopAppUpdate();
      setDesktopUpdate(update);
    } catch (error) {
      console.debug(`Desktop app update check failed (${source}).`, error);
    } finally {
      desktopCheckInFlight.current = false;
    }
  }, []);

  React.useEffect(() => {
    if (!import.meta.env.PROD || !isTauriRuntime()) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestDesktopCheck('visibilitychange');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const mountCheck = window.setTimeout(() => {
      void requestDesktopCheck('mount');
    }, 0);

    return () => {
      window.clearTimeout(mountCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestDesktopCheck]);

  async function openDesktopDownloadPage() {
    try {
      await desktopInvoke('open_external_url', {
        request: { url: DESKTOP_APP_DOWNLOAD_URL },
      });
      setDesktopUpdate(null);
      setPageUpdateAvailable(false);
    } catch (error) {
      console.warn('Failed to open the desktop app download page.', error);
    }
  }

  const isDesktopUpdate = desktopUpdate !== null;

  return (
    <UpdateAvailableDialog
      key={isDesktopUpdate ? 'desktop-app-update' : 'page-update'}
      open={isDesktopUpdate || pageUpdateAvailable}
      onOpenChange={(open) => {
        if (!open) {
          setDesktopUpdate(null);
          setPageUpdateAvailable(false);
        }
      }}
      onUpdate={isDesktopUpdate ? openDesktopDownloadPage : reloadWithTimestamp}
      title={isDesktopUpdate ? '发现客户端新版本' : undefined}
      description={
        isDesktopUpdate
          ? '当前客户端暂未签名，无法自动更新，请前往官网下载安装最新版本。'
          : undefined
      }
      updateLabel={isDesktopUpdate ? '前往官网更新' : undefined}
      updatingLabel={isDesktopUpdate ? '正在打开官网…' : undefined}
      closeLabel="关闭"
      resetUpdatingAfterUpdate={isDesktopUpdate}
    />
  );
}

function reloadWithTimestamp() {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('t', Date.now().toString());
  window.location.replace(nextUrl.toString());
}

function isHttpProtocol(protocol: string) {
  return protocol === 'http:' || protocol === 'https:';
}
