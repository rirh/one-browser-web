import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  ChromiumDownloadPhase,
  ChromiumDownloadProgress,
} from '@/features/browser/contracts';
import { toBrowserErrorMessage } from '@/features/browser/errors';
import { isTauriRuntime } from '@/platform/desktop';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  type ChromiumDownloadManifest,
  getChromiumDownloadManifest,
  getCurrentChromiumTarget,
  startChromiumDownload,
} from './api';

const chromiumDownloadProgressEvent = 'chromium-download-progress';
const chromiumDownloadPhases: ChromiumDownloadPhase[] = [
  'checking',
  'downloading',
  'extracting',
  'ready',
  'error',
];

export function useChromiumDownload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ChromiumDownloadProgress | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    function handleDownloadProgress(event: Event) {
      const payload = (event as CustomEvent<unknown>).detail;
      if (!isChromiumDownloadProgress(payload)) {
        return;
      }

      setProgress(payload);
      console.info('[chromium-download] progress event', payload);
      if (payload.phase === 'ready') {
        void queryClient.invalidateQueries({
          queryKey: browserQueryKeys.status(),
        });
      }
    }

    console.info('[chromium-download] listen DOM progress event start');
    window.addEventListener(
      chromiumDownloadProgressEvent,
      handleDownloadProgress,
    );

    return () => {
      window.removeEventListener(
        chromiumDownloadProgressEvent,
        handleDownloadProgress,
      );
    };
  }, [queryClient]);

  const start = useCallback(() => {
    if (isPending || isRunningProgress(progress)) {
      console.info('[chromium-download] start ignored: already running', {
        isPending,
        phase: progress?.phase ?? null,
      });
      return;
    }

    const target = getCurrentChromiumTarget();
    console.info('[chromium-download] start', {
      target,
      origin: typeof window === 'undefined' ? 'server' : window.location.origin,
      isTauri: isTauriRuntime(),
    });
    setIsPending(true);
    setRequestErrorMessage(null);
    setProgress({
      phase: 'checking',
      platform: target.platform,
      arch: target.arch,
      url: '',
      downloadedBytes: 0,
      totalBytes: null,
      percent: null,
      message: '正在检查浏览器下载资源',
    });

    void (async () => {
      if (!isTauriRuntime()) {
        throw new Error('Tauri 运行环境不可用');
      }

      const manifest = await getChromiumDownloadManifest();
      setProgress(toCheckingProgress(manifest, '正在准备下载浏览器'));

      const result = await startChromiumDownload(manifest);
      console.info('[chromium-download] background command result', result);
      if (!result.started) {
        setProgress((previous) =>
          previous ? { ...previous, message: result.message } : previous,
        );
      }
    })()
      .catch((downloadError: unknown) => {
        const message = toBrowserErrorMessage(downloadError);
        console.error('[chromium-download] failed', {
          message,
          error: downloadError,
        });
        setRequestErrorMessage(message);
        setProgress((previous) => ({
          phase: 'error',
          platform: previous?.platform ?? target.platform,
          arch: previous?.arch ?? target.arch,
          url: previous?.url ?? '',
          downloadedBytes: previous?.downloadedBytes ?? 0,
          totalBytes: previous?.totalBytes ?? null,
          percent: previous?.percent ?? null,
          message,
        }));
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [isPending, progress]);

  const isRunning = isPending || isRunningProgress(progress);
  const errorMessage =
    progress?.phase === 'error' ? progress.message : requestErrorMessage;

  return {
    errorMessage,
    isError: Boolean(errorMessage),
    isRunning,
    progress,
    start,
  };
}

function isRunningProgress(progress: ChromiumDownloadProgress | null) {
  return (
    progress?.phase === 'checking' ||
    progress?.phase === 'downloading' ||
    progress?.phase === 'extracting'
  );
}

function toCheckingProgress(
  manifest: ChromiumDownloadManifest,
  message: string,
): ChromiumDownloadProgress {
  const totalBytes = normalizeTotalBytes(manifest.fileSize);

  return {
    phase: 'checking',
    platform: manifest.platform,
    arch: manifest.arch,
    url: manifest.url,
    downloadedBytes: 0,
    totalBytes,
    percent: null,
    message,
  };
}

function normalizeTotalBytes(value: number) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function isChromiumDownloadProgress(
  payload: unknown,
): payload is ChromiumDownloadProgress {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const progress = payload as ChromiumDownloadProgress;
  return (
    isChromiumDownloadPhase(progress.phase) &&
    typeof progress.platform === 'string' &&
    typeof progress.arch === 'string' &&
    typeof progress.url === 'string' &&
    typeof progress.downloadedBytes === 'number' &&
    (typeof progress.totalBytes === 'number' || progress.totalBytes === null) &&
    (typeof progress.percent === 'number' || progress.percent === null) &&
    typeof progress.message === 'string'
  );
}

function isChromiumDownloadPhase(
  phase: unknown,
): phase is ChromiumDownloadPhase {
  return (
    typeof phase === 'string' &&
    chromiumDownloadPhases.includes(phase as ChromiumDownloadPhase)
  );
}
