import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  CreateProfileRequest,
  DeleteProfileCacheRequest,
  DeleteProfilesRequest,
  GetProfileRequest,
  ProfileConfig,
  ProfileListRequest,
  ProfileProxyStatusRequest,
  RefreshIpRequest,
  UpdateProfileProxyRequest,
  UpdateProfileRequest,
} from '@/features/browser/contracts';
import { toastBrowserError } from '@/features/browser/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createProfile,
  deleteProfileCache,
  deleteProfiles,
  getProfile,
  getProfileProxyStatus,
  listProfiles,
  refreshProfileIp,
  updateProfile,
  updateProfileProxy,
} from '../api/client';

export function useProfilesQuery(request?: ProfileListRequest) {
  return useQuery({
    queryKey: browserQueryKeys.profilesList(request),
    queryFn: () => listProfiles(request),
  });
}

export function useProfileQuery(request: GetProfileRequest, enabled = true) {
  return useQuery({
    queryKey: browserQueryKeys.profile(request.profileId),
    queryFn: () => getProfile(request),
    enabled: enabled && request.profileId.length > 0,
  });
}

export function useProfileProxyStatusQuery(
  request: ProfileProxyStatusRequest,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      ...browserQueryKeys.profile(request.profileId),
      'proxy-status',
    ] as const,
    queryFn: () => getProfileProxyStatus(request),
    enabled: enabled && request.profileId.length > 0,
  });
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProfileRequest) => createProfile(request),
    onError: toastBrowserError,
    onSuccess: (profile) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      queryClient.setQueryData(
        browserQueryKeys.profile(profile.profileId),
        profile,
      );
    },
  });
}

export function useDuplicateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const profile = await getProfile({ profileId });
      return createProfile(profileToDuplicateRequest(profile));
    },
    onError: toastBrowserError,
    onSuccess: (profile) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      queryClient.setQueryData(
        browserQueryKeys.profile(profile.profileId),
        profile,
      );
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) => updateProfile(request),
    onError: toastBrowserError,
    onSuccess: (profile) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      queryClient.setQueryData(
        browserQueryKeys.profile(profile.profileId),
        profile,
      );
    },
  });
}

function profileToDuplicateRequest(
  profile: ProfileConfig,
): CreateProfileRequest {
  return {
    profileId: duplicateProfileId(profile.profileId),
    profileNo: profile.profileNo,
    name: `${profile.name}复制`,
    remark: profile.remark,
    groupId: profile.groupId,
    tags: [...profile.tags],
    tabs: [...profile.tabs],
    mode: profile.mode,
    proxyId: profile.proxyId,
    proxyConfig: profile.proxyConfig,
    fingerprintConfig: {
      ...profile.fingerprintConfig,
      acceptLanguages: [...profile.fingerprintConfig.acceptLanguages],
    },
    advanced: {
      ...profile.advanced,
      launchArgs: [...profile.advanced.launchArgs],
    },
  };
}

function duplicateProfileId(profileId: string) {
  const suffix = `copy-${Date.now().toString(36)}`;
  const baseLength = 80 - suffix.length - 1;
  const base = profileId.slice(0, baseLength).replace(/-+$/g, '');

  return `${base || 'profile'}-${suffix}`;
}

export function useDeleteProfilesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteProfilesRequest) => deleteProfiles(request),
    onError: toastBrowserError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
    },
  });
}

export function useUpdateProfileProxyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileProxyRequest) =>
      updateProfileProxy(request),
    onError: toastBrowserError,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profile(result.profileId),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
    },
  });
}

export function useRefreshProfileIpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RefreshIpRequest) => refreshProfileIp(request),
    onError: toastBrowserError,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profile(result.profileId),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
    },
  });
}

export function useDeleteProfileCacheMutation() {
  return useMutation({
    mutationFn: (request: DeleteProfileCacheRequest) =>
      deleteProfileCache(request),
    onError: toastBrowserError,
  });
}
