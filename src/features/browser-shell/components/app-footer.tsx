import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  compactPath,
  resolveChromiumDisplay,
} from '@/features/browser/status/chromium-display';
import { useChromiumDownload } from '@/features/browser/status/chromium-download';
import {
  isNetworkUnavailable,
  networkUnavailableMessage,
} from '@/features/browser/status/network-guard';
import { useAppStatusQuery } from '@/features/browser/status/queries';
import { cn } from '@/lib/utils';
import { desktopInvoke, isTauriRuntime } from '@/platform/desktop';
import { useState } from 'react';
import { toast } from 'sonner';

import pkg from '../../../../package.json';
import {
  ChromiumDownloadFooter,
  resolveChromiumDownloadLabel,
  resolveChromiumDownloadTitle,
  resolveChromiumDownloadValue,
} from './chromium-download-footer';
import { EgressQuickSwitch } from './egress-quick-switch';

type StatusTone = 'success' | 'danger' | 'muted';
type StatusLabelTone = StatusTone | 'default';
type OpeningTarget = 'api' | 'chromium' | 'data';

const statusToneClass: Record<StatusTone, string> = {
  success: '[--status-dot:var(--success)]',
  danger: '[--status-dot:var(--destructive)]',
  muted: '[--status-dot:var(--muted-foreground)]',
};

const statusLabelToneClass: Record<StatusLabelTone, string> = {
  default: 'text-muted-foreground',
  success: 'text-success',
  danger: 'text-destructive',
  muted: 'text-muted-foreground',
};

function appVersionLabel(version?: string) {
  const value = version?.trim() || '未知';
  return value.startsWith('v') ? value : `v${value}`;
}

function StatusRow({
  disabled,
  isBusy,
  label,
  labelTone = 'default',
  onClick,
  title,
  value,
}: {
  disabled?: boolean;
  isBusy?: boolean;
  label: string;
  labelTone?: StatusLabelTone;
  onClick?: () => void;
  title?: string;
  value: string;
}) {
  const canClick = Boolean(onClick) && !disabled;
  const valueClassName = cn(
    'min-w-0 max-w-full justify-self-end truncate text-right text-[0.75rem] font-medium leading-5 text-foreground',
    canClick &&
      'underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-current',
    disabled && 'text-muted-foreground no-underline',
  );

  return (
    <div className="grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-2 rounded-sm px-1.5 py-0.5 hover:bg-muted/45">
      <div
        className={cn(
          'truncate text-[0.6875rem] font-medium leading-5',
          statusLabelToneClass[labelTone],
        )}
        title={label}
      >
        {label}
      </div>
      {onClick ? (
        <button
          type="button"
          aria-busy={isBusy}
          aria-label={`${label}: ${value}`}
          className={valueClassName}
          disabled={!canClick || isBusy}
          title={title ?? value}
          onClick={onClick}
        >
          {value}
        </button>
      ) : (
        <span className={valueClassName} title={title ?? value}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatusDot({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span
      aria-label={label}
      role="status"
      title={label}
      className={cn(
        'size-1.5 rounded-full bg-[var(--status-dot)] ring-1 ring-[color-mix(in_oklch,var(--status-dot)_25%,transparent)]',
        statusToneClass[tone],
      )}
    />
  );
}

export function AppFooter() {
  const statusQuery = useAppStatusQuery();
  const {
    errorMessage: chromiumDownloadErrorMessage,
    isError: isChromiumDownloadError,
    isRunning: isChromiumDownloadRunning,
    progress: chromiumDownloadProgress,
    start: startChromiumDownload,
  } = useChromiumDownload();
  const [openingTarget, setOpeningTarget] = useState<OpeningTarget | null>(
    null,
  );
  const status = statusQuery.data;
  const networkAvailable = !isNetworkUnavailable(status);
  const apiStatus = status?.apiStatus;
  const apiEnabled = Boolean(apiStatus?.enabled);
  const apiRunning = Boolean(apiStatus?.running);
  const appVersion = appVersionLabel(status?.appVersion ?? pkg.version);
  const apiStatusLabel = statusQuery.isLoading
    ? 'API 检测中'
    : statusQuery.isError
      ? 'API 异常'
      : apiEnabled
        ? apiRunning
          ? 'API 运行中'
          : 'API 不可用'
        : 'API 关闭';
  const apiStatusTone: StatusTone = statusQuery.isLoading
    ? 'muted'
    : statusQuery.isError
      ? 'danger'
      : !apiEnabled
        ? 'muted'
        : apiRunning
          ? 'success'
          : 'danger';
  const apiEndpoint = apiStatus ? `${apiStatus.host}:${apiStatus.port}` : null;
  const apiUrl = apiEndpoint ? `http://${apiEndpoint}/api/health` : null;
  const apiDetail = apiStatus?.message ?? '等待 Tauri 运行时';
  const chromium = resolveChromiumDisplay(status?.chromiumPath);
  const chromiumPath = chromium.path ?? null;
  const chromiumPathExists = Boolean(
    chromiumPath && status?.chromiumPath.exists,
  );
  const appDataDir = status?.appDataDir;
  const chromiumLabelTone: StatusLabelTone = statusQuery.isLoading
    ? 'muted'
    : status?.chromiumPath.executable
      ? 'success'
      : status?.chromiumPath.exists
        ? 'danger'
        : 'muted';
  const tauriRuntimeAvailable = isTauriRuntime();
  const needsChromiumDownload = Boolean(
    tauriRuntimeAvailable &&
    status &&
    !status.settings.chromiumPath &&
    !status.chromiumPath.executable,
  );
  const isChromiumDownloadReady = chromiumDownloadProgress?.phase === 'ready';
  const showChromiumDownload =
    !isChromiumDownloadReady &&
    (needsChromiumDownload ||
      isChromiumDownloadRunning ||
      isChromiumDownloadError);
  const chromiumDownloadLabel =
    !networkAvailable && needsChromiumDownload && !isChromiumDownloadRunning
      ? '网络不可用，已暂停浏览器下载'
      : resolveChromiumDownloadLabel(
          chromiumDownloadProgress,
          chromiumDownloadErrorMessage,
          needsChromiumDownload,
        );
  const chromiumDownloadValue = resolveChromiumDownloadValue(
    chromiumDownloadProgress,
  );
  const chromiumDownloadTitle = resolveChromiumDownloadTitle(
    chromiumDownloadProgress,
    chromiumDownloadLabel,
    chromiumDownloadValue,
  );

  async function openExternalUrl(url: string | null) {
    if (!url || openingTarget) {
      return;
    }

    setOpeningTarget('api');
    try {
      await desktopInvoke('open_external_url', { request: { url } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打开网址失败');
    } finally {
      setOpeningTarget(null);
    }
  }

  async function openChromiumPath() {
    if (!chromiumPath || openingTarget) {
      return;
    }

    setOpeningTarget('chromium');
    try {
      await desktopInvoke('open_path', { request: { path: chromiumPath } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打开路径失败');
    } finally {
      setOpeningTarget(null);
    }
  }

  async function openAppDataDir() {
    if (!appDataDir || openingTarget) {
      return;
    }

    setOpeningTarget('data');
    try {
      await desktopInvoke('open_app_data_dir');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打开目录失败');
    } finally {
      setOpeningTarget(null);
    }
  }

  return (
    <footer className="flex h-5 shrink-0 items-center border-t border-border/60 bg-muted/40 px-1.5 text-[0.6875rem] leading-none text-muted-foreground">
      <HoverCard openDelay={120} closeDelay={120}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="inline-flex h-full items-center gap-1 rounded-sm px-1 font-medium text-foreground transition-colors hover:bg-accent"
          >
            <StatusDot tone={apiStatusTone} label={apiStatusLabel} />
            {appVersion}
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          sideOffset={0}
          className="w-[min(15.5rem,calc(100vw-1rem))] rounded-md p-1 text-[0.6875rem] leading-none"
        >
          <div className="flex flex-col gap-0.5">
            <StatusRow
              label="有个浏览器"
              title="团队协作指纹浏览器"
              value={appVersion}
            />
            <StatusRow
              disabled={!apiUrl || !apiRunning}
              isBusy={openingTarget === 'api'}
              label="API"
              labelTone={apiStatusTone}
              title={`${apiStatusLabel} · ${apiDetail}`}
              value={apiEndpoint ?? '等待状态'}
              onClick={() => void openExternalUrl(apiUrl)}
            />
            <StatusRow
              disabled={!chromiumPathExists}
              isBusy={openingTarget === 'chromium'}
              label="浏览器"
              labelTone={chromiumLabelTone}
              title={chromium.title ?? chromium.detail}
              value={chromiumPath ? compactPath(chromiumPath) : chromium.label}
              onClick={() => void openChromiumPath()}
            />
            <StatusRow
              disabled={!appDataDir}
              isBusy={openingTarget === 'data'}
              label="数据目录"
              title={appDataDir}
              value={appDataDir ? compactPath(appDataDir) : '等待 Tauri 运行时'}
              onClick={() => void openAppDataDir()}
            />
          </div>
        </HoverCardContent>
      </HoverCard>
      <EgressQuickSwitch settings={status?.settings} />
      {showChromiumDownload ? (
        <ChromiumDownloadFooter
          isError={isChromiumDownloadError}
          label={chromiumDownloadLabel}
          title={chromiumDownloadTitle}
          value={chromiumDownloadValue}
          onRetry={() => {
            if (!networkAvailable) {
              toast.error(networkUnavailableMessage);
              return;
            }
            startChromiumDownload();
          }}
        />
      ) : null}
    </footer>
  );
}
