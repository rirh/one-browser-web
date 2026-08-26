import type {
  CreateProxyRequest,
  DeleteProxiesRequest,
  DeleteProxiesResult,
  GetProxyRequest,
  PageResult,
  ProxyConfig,
  ProxyListItem,
  ProxyListRequest,
  UpdateProxyRequest,
  WriteClipboardTextRequest,
} from '@/features/browser/contracts';
import { desktopInvoke } from '@/platform/desktop';

import { sanitizePage } from './sanitize';

export async function listProxies(request?: ProxyListRequest) {
  const page = await desktopInvoke<PageResult<ProxyListItem>>('list_proxies', {
    request,
  });
  return sanitizePage(page, (proxy) => proxy);
}

export async function getProxy(request: GetProxyRequest) {
  return desktopInvoke<ProxyConfig>('get_proxy', { request });
}

export function writeClipboardText(request: WriteClipboardTextRequest) {
  return desktopInvoke<void>('write_clipboard_text', { request });
}

export async function createProxy(request: CreateProxyRequest) {
  return desktopInvoke<ProxyConfig>('create_proxy', { request });
}

export async function updateProxy(request: UpdateProxyRequest) {
  return desktopInvoke<ProxyConfig>('update_proxy', { request });
}

export function deleteProxies(request: DeleteProxiesRequest) {
  return desktopInvoke<DeleteProxiesResult>('delete_proxies', { request });
}
