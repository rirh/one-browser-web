import { http } from '@/lib/http';

export type AppDownloadTarget = {
  platform: string;
  arch: string;
};

type AppDownloadAsset = {
  name: string;
  platform: string;
  arch: string;
  size: number;
  download_url: string;
  updated_at: string | null;
};

type AppDownloadRelease = {
  version: string;
  published_at: string | null;
  selected: AppDownloadAsset | null;
};

export type AppDownload = {
  platform: string;
  arch: string;
  url: string;
  version: string;
  fileName: string;
  fileSize: number;
  updatedAt: string | null;
};

export async function getLatestAppDownload(target: AppDownloadTarget) {
  const response = await http.get<AppDownloadRelease>(
    '/app-downloads/latest',
    target,
  );
  const selected = response.data.selected;

  if (!selected) {
    throw new Error('当前平台还没有配置可下载安装包');
  }

  return {
    platform: selected.platform,
    arch: selected.arch,
    url: selected.download_url,
    version: response.data.version,
    fileName: selected.name,
    fileSize: selected.size,
    updatedAt: selected.updated_at ?? response.data.published_at,
  } satisfies AppDownload;
}
