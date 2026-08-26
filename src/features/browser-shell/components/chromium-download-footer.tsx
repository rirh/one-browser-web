import { cn } from '@/lib/utils';

import type { ChromiumDownloadProgress } from '../../browser/contracts';

export function ChromiumDownloadFooter({
  isError,
  label,
  onRetry,
  title,
  value,
}: {
  isError: boolean;
  label: string;
  onRetry: () => void;
  title: string;
  value: number;
}) {
  return (
    <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5">
      <CircularDownloadProgress isError={isError} value={value} />
      <span
        className={cn('truncate', isError && 'text-destructive')}
        title={title}
      >
        {label}
      </span>
      {isError ? (
        <button
          type="button"
          className="h-5 shrink-0 rounded-sm px-1 font-medium text-foreground transition-colors hover:bg-accent"
          onClick={onRetry}
        >
          重试
        </button>
      ) : (
        <span
          className="w-9 shrink-0 text-right font-medium tabular-nums text-foreground"
          title={title}
        >
          {formatPercent(value)}
        </span>
      )}
    </div>
  );
}

function CircularDownloadProgress({
  isError,
  value,
}: {
  isError: boolean;
  value: number;
}) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const progressColor = isError ? '--destructive' : '--primary';

  return (
    <span
      aria-label={`下载进度 ${formatPercent(normalizedValue)}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(normalizedValue)}
      className="relative size-3.5 shrink-0 rounded-full"
      role="progressbar"
      style={{
        background: `conic-gradient(var(${progressColor}) ${
          normalizedValue * 3.6
        }deg, var(--border) 0deg)`,
      }}
    >
      <span className="absolute inset-[3px] rounded-full bg-muted" />
    </span>
  );
}

export function resolveChromiumDownloadLabel(
  progress: ChromiumDownloadProgress | null,
  errorMessage: string | null,
  needsDownload: boolean,
) {
  if (errorMessage) return errorMessage;
  if (!progress) return needsDownload ? '准备下载浏览器' : '';
  if (progress.phase === 'checking') return '检查浏览器下载';
  if (progress.phase === 'downloading') {
    return progress.message || '下载浏览器';
  }
  if (progress.phase === 'extracting') return '解压浏览器';
  if (progress.phase === 'ready') return '';
  return progress.message || '浏览器下载异常';
}

export function resolveChromiumDownloadTitle(
  progress: ChromiumDownloadProgress | null,
  label: string,
  value: number,
) {
  const percent = formatPercent(value);
  if (progress?.phase === 'downloading') {
    return [
      label,
      percent,
      formatBytes(progress.downloadedBytes, progress.totalBytes),
      progress.message && progress.message !== label ? progress.message : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }
  if (progress?.message && progress.message !== label) {
    return [label, progress.message].filter(Boolean).join(' · ');
  }
  return label;
}

export function resolveChromiumDownloadValue(
  progress: ChromiumDownloadProgress | null,
) {
  if (!progress) return 8;
  if (progress.phase === 'extracting' || progress.phase === 'ready') {
    return 100;
  }
  if (typeof progress.percent === 'number') {
    return Math.min(100, Math.max(0, progress.percent));
  }
  return progress.phase === 'checking' ? 12 : 24;
}

function formatPercent(percent: number | null) {
  return typeof percent === 'number' ? `${Math.round(percent)}%` : '';
}

function formatBytes(downloadedBytes: number, totalBytes: number | null) {
  if (!totalBytes) return '';
  return `${formatByteUnit(downloadedBytes)} / ${formatByteUnit(totalBytes)}`;
}

function formatByteUnit(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(0, bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
