import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  CloseProfileRequest,
  OpenProfileRequest,
} from '@/features/browser/contracts';
import { toastBrowserError } from '@/features/browser/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  closeAllProfiles,
  closeProfile,
  listRuntime,
  openProfile,
} from './api';
import {
  markClosingAllProfiles,
  markClosingProfile,
  markOpeningProfile,
  restoreRuntimeMutationSnapshot,
  syncClosedProfile,
  syncClosedProfiles,
  syncOpenedProfile,
  syncProfileListsFromRuntime,
  takeRuntimeMutationSnapshot,
} from './cache-sync';
import { toastEnvironmentWarnings } from './environment-warnings';
import {
  toastBrowserOpenError,
  toastBrowserOpenPending,
  toastBrowserOpenSuccess,
} from './open-progress-toast';

export function useRuntimeQuery(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: browserQueryKeys.runtime(),
    queryFn: listRuntime,
    enabled: options?.enabled,
  });

  useEffect(() => {
    if (query.data) {
      syncProfileListsFromRuntime(queryClient, query.data);
    }
  }, [query.data, queryClient]);

  return query;
}

export function useOpenProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OpenProfileRequest) => openProfile(request),
    onMutate: async (request) => {
      toastBrowserOpenPending(
        '正在准备浏览器环境',
        '正在读取环境配置与启动参数',
        2,
        5,
      );
      const snapshot = await takeRuntimeMutationSnapshot(queryClient);
      markOpeningProfile(queryClient, request.profileId);
      return snapshot;
    },
    onError: (error, _request, snapshot) => {
      restoreRuntimeMutationSnapshot(queryClient, snapshot);
      toastBrowserOpenError(error);
    },
    onSuccess: (runtime) => {
      toastBrowserOpenSuccess();
      toastEnvironmentWarnings(runtime.environmentWarnings);
      syncOpenedProfile(queryClient, runtime);
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profile(runtime.profileId),
      });
    },
  });
}

export function useCloseProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CloseProfileRequest) => closeProfile(request),
    onMutate: async (request) => {
      const snapshot = await takeRuntimeMutationSnapshot(queryClient);
      markClosingProfile(queryClient, request.profileId);
      return snapshot;
    },
    onError: (error, _request, snapshot) => {
      restoreRuntimeMutationSnapshot(queryClient, snapshot);
      toastBrowserError(error);
    },
    onSuccess: (result) => {
      syncClosedProfile(queryClient, result.profileId);
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profile(result.profileId),
      });
    },
  });
}

export function useCloseAllProfilesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeAllProfiles,
    onMutate: async () => {
      const snapshot = await takeRuntimeMutationSnapshot(queryClient);
      const profileIds = markClosingAllProfiles(queryClient);
      return { profileIds, snapshot };
    },
    onError: (error, _request, context) => {
      restoreRuntimeMutationSnapshot(queryClient, context?.snapshot);
      toastBrowserError(error);
    },
    onSuccess: (result, _request, context) => {
      syncClosedProfiles(queryClient, [
        ...new Set([...(context?.profileIds ?? []), ...result.closed]),
      ]);
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.profiles(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
    },
  });
}
