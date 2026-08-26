import type { ChromiumPathStatus } from '@/features/browser/contracts';

export const CHROMIUM_PATH_PLACEHOLDER =
  '留空使用应用托管浏览器；仅在需要覆盖时填写';

export type ChromiumDisplay = {
  badge: string;
  detail: string;
  label: string;
  path?: string;
  title?: string;
  variant: 'success' | 'secondary' | 'destructive' | 'outline';
};

export function resolveChromiumDisplay(
  status?: ChromiumPathStatus | null,
  pendingPath?: string | null,
): ChromiumDisplay {
  const path = status?.path ?? normalizePath(pendingPath);

  if (!status) {
    if (path) {
      return {
        badge: '待检测',
        detail: compactPath(path),
        label: chromiumPathLabel(path),
        path: path ?? undefined,
        title: path ?? undefined,
        variant: 'secondary',
      };
    }

    return {
      badge: '自动',
      detail: '留空时使用应用托管浏览器',
      label: '等待检测',
      variant: 'outline',
    };
  }

  if (status.executable) {
    const label = chromiumPathLabel(path);
    return {
      badge: '就绪',
      detail: chromiumPathDetail(path),
      label,
      path: path ?? undefined,
      title: path ?? undefined,
      variant: 'success',
    };
  }

  if (status.exists) {
    return {
      badge: '不可执行',
      detail: status.message,
      label: chromiumPathLabel(path) || '路径异常',
      path: path ?? undefined,
      title: path ?? status.message,
      variant: 'destructive',
    };
  }

  if (path) {
    return {
      badge: '缺失',
      detail: '路径不存在，可等待下载或手动覆盖',
      label: chromiumPathLabel(path),
      path: path ?? undefined,
      title: path,
      variant: 'destructive',
    };
  }

  return {
    badge: '未配置',
    detail: '等待下载或手动设置路径',
    label: '浏览器',
    title: status.message,
    variant: 'outline',
  };
}

export function compactPath(path?: string | null) {
  const normalized = normalizePath(path);
  if (!normalized) {
    return '';
  }

  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 3) {
    return normalized;
  }

  return `.../${parts.slice(-3).join('/')}`;
}

function chromiumPathLabel(path?: string | null) {
  if (!path) {
    return '';
  }

  const appName = path.match(/\/([^/]+)\.app\/Contents\/MacOS\//)?.[1];
  if (appName) {
    return appName;
  }

  return '自定义路径';
}

function chromiumPathDetail(path?: string | null) {
  if (!path) {
    return '等待路径';
  }

  if (path.includes('/Applications/')) {
    return '系统浏览器';
  }

  return compactPath(path);
}

function normalizePath(path?: string | null) {
  return path?.trim() || null;
}
