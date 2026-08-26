import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  UpdateSettingsRequest,
  ValidateChromiumPathRequest,
} from '@/features/browser/contracts';
import { toastBrowserError } from '@/features/browser/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, updateSettings, validateChromiumPath } from './api';

export function useSettingsQuery() {
  return useQuery({
    queryKey: browserQueryKeys.settings(),
    queryFn: getSettings,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateSettingsRequest) => updateSettings(patch),
    onError: toastBrowserError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.settings(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
    },
  });
}

export function useValidateChromiumPathMutation() {
  return useMutation({
    mutationFn: (request: ValidateChromiumPathRequest) =>
      validateChromiumPath(request),
    onError: toastBrowserError,
  });
}
