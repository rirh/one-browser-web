import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EGRESS_PROBE_CACHE_TTL_MS, loadEgressLineSnapshot } from './selection';

export function useEgressLineSnapshotQuery() {
  return useQuery({
    queryKey: browserQueryKeys.egressLines(),
    queryFn: () => loadEgressLineSnapshot(),
    retry: false,
    staleTime: EGRESS_PROBE_CACHE_TTL_MS,
  });
}

export function useRefreshEgressLinesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => loadEgressLineSnapshot({ force: true }),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(browserQueryKeys.egressLines(), snapshot);
    },
  });
}
