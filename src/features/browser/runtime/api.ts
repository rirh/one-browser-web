import type {
  CloseAllProfilesResult,
  CloseProfileRequest,
  CloseProfileResult,
  OpenProfileRequest,
  RuntimeProfile,
  UpdateTunnelRouteRequest,
} from '@/features/browser/contracts';
import { desktopInvoke } from '@/lib/desktop';

export function listRuntime() {
  return desktopInvoke<RuntimeProfile[]>('list_runtime');
}

export function openProfile(request: OpenProfileRequest) {
  return desktopInvoke<RuntimeProfile>('open_profile', { request });
}

export function closeProfile(request: CloseProfileRequest) {
  return desktopInvoke<CloseProfileResult>('close_profile', { request });
}

export function closeAllProfiles() {
  return desktopInvoke<CloseAllProfilesResult>('close_all_profiles');
}

export function updateTunnelRoute(request: UpdateTunnelRouteRequest) {
  return desktopInvoke<RuntimeProfile>('update_tunnel_route', { request });
}
