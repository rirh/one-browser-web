import type {
  CheckProxyRequest,
  ProxyCheckResult,
} from '@/features/browser/contracts';
import { desktopInvoke } from '@/platform/desktop';

export function checkProxy(request: CheckProxyRequest) {
  return desktopInvoke<ProxyCheckResult>('check_proxy', { request });
}
