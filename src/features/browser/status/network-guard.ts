import type { AppStatus } from '@/features/browser/contracts';

export const networkUnavailableMessage = '当前网络不可用，已阻止网络相关操作';

export function isNetworkUnavailable(status?: AppStatus | null) {
  return status?.capabilities.networkAvailable === false;
}
