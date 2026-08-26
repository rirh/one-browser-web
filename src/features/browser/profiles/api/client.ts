import type {
  CreateProfileRequest,
  DeleteProfileCacheRequest,
  DeleteProfileCacheResult,
  DeleteProfilesRequest,
  DeleteProfilesResult,
  GetProfileRequest,
  PageResult,
  ProfileConfig,
  ProfileListItem,
  ProfileListRequest,
  ProfileProxyStatus,
  ProfileProxyStatusRequest,
  RefreshIpRequest,
  RefreshIpResult,
  UpdateProfileProxyRequest,
  UpdateProfileProxyResult,
  UpdateProfileRequest,
} from '@/features/browser/contracts';
import { desktopInvoke } from '@/platform/desktop';

import { sanitizeProfileConfig } from './sanitize';

export async function listProfiles(request?: ProfileListRequest) {
  return desktopInvoke<PageResult<ProfileListItem>>('list_profiles', {
    request,
  });
}

export async function getProfile(request: GetProfileRequest) {
  const profile = await desktopInvoke<ProfileConfig>('get_profile', {
    request,
  });
  return sanitizeProfileConfig(profile);
}

export async function createProfile(request: CreateProfileRequest) {
  const profile = await desktopInvoke<ProfileConfig>('create_profile', {
    request,
  });
  return sanitizeProfileConfig(profile);
}

export async function updateProfile(request: UpdateProfileRequest) {
  const profile = await desktopInvoke<ProfileConfig>('update_profile', {
    request,
  });
  return sanitizeProfileConfig(profile);
}

export function deleteProfiles(request: DeleteProfilesRequest) {
  return desktopInvoke<DeleteProfilesResult>('delete_profiles', { request });
}

export function updateProfileProxy(request: UpdateProfileProxyRequest) {
  return desktopInvoke<UpdateProfileProxyResult>('update_profile_proxy', {
    request,
  });
}

export function refreshProfileIp(request: RefreshIpRequest) {
  return desktopInvoke<RefreshIpResult>('refresh_profile_ip', { request });
}

export function getProfileProxyStatus(request: ProfileProxyStatusRequest) {
  return desktopInvoke<ProfileProxyStatus>('get_profile_proxy_status', {
    request,
  });
}

export function deleteProfileCache(request: DeleteProfileCacheRequest) {
  return desktopInvoke<DeleteProfileCacheResult>('delete_profile_cache', {
    request,
  });
}
