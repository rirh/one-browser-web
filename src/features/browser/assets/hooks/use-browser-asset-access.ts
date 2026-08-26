import { useAuth } from '@/features/auth/auth-gate';
import {
  hasButtonPermission,
  hasPermission,
} from '@/features/auth/permissions';

export function useBrowserAssetAccess() {
  const { access } = useAuth();
  return {
    canList: hasPermission(access, 'browser:asset:list'),
    canUpload: hasButtonPermission(access, 'browser:asset:upload'),
    canSetCurrent: hasButtonPermission(access, 'browser:asset:current'),
    canDelete: hasButtonPermission(access, 'browser:asset:delete'),
  };
}
