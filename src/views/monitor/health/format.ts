const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatBytes(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '—';
  }
  if (value === 0) return '0 B';
  const power = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  );
  return `${(value / 1024 ** power).toFixed(1)} ${BYTE_UNITS[power]}`;
}

export function formatPercent(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : '—';
}

export function formatLoad(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(2)
    : '0.00';
}

export function safeNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
}

export function formatDuration(seconds: number | null | undefined) {
  if (typeof seconds !== 'number' || seconds < 0) return '—';
  const units = [
    ['天', 86_400],
    ['小时', 3_600],
    ['分钟', 60],
  ] as const;
  let remaining = Math.floor(seconds);
  const parts: string[] = [];
  for (const [label, size] of units) {
    const count = Math.floor(remaining / size);
    remaining %= size;
    if (count > 0) parts.push(`${count}${label}`);
    if (parts.length === 2) break;
  }
  return parts.join('') || `${remaining}秒`;
}

export function formatDateTime(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE_TIME_FORMATTER.format(date);
}

export function truncateCommit(value: string) {
  const commit = value.trim();
  if (!commit || commit === 'unknown') return '—';
  return commit.length > 13
    ? `${commit.slice(0, 6)}…${commit.slice(-6)}`
    : commit;
}

export const clampPercent = safeNumber;
export const shortCommit = truncateCommit;
