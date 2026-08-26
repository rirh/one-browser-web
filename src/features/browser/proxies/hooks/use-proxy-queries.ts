import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  CheckProxyRequest,
  CreateProxyRequest,
  DeleteProxiesRequest,
  GetProxyRequest,
  ProxyCheckResult,
  ProxyConfig,
  ProxyListRequest,
  UpdateProxyRequest,
} from '@/features/browser/contracts';
import { toastBrowserError } from '@/features/browser/errors';
import { checkProxy } from '@/features/browser/proxy-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createProxy,
  deleteProxies,
  getProxy,
  listProxies,
  updateProxy,
} from '../api/client';

const proxyBatchCheckConcurrency = 6;

export function useProxiesQuery(request?: ProxyListRequest, enabled = true) {
  return useQuery({
    queryKey: browserQueryKeys.proxiesList(request),
    queryFn: () => listProxies(request),
    enabled,
  });
}

export function useProxyQuery(request: GetProxyRequest, enabled = true) {
  return useQuery({
    queryKey: browserQueryKeys.proxy(request.proxyId),
    queryFn: () => getProxy(request),
    enabled: enabled && request.proxyId.length > 0,
  });
}

export function useCreateProxyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProxyRequest) => createProxy(request),
    onError: toastBrowserError,
    onSuccess: (proxy) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      queryClient.setQueryData(browserQueryKeys.proxy(proxy.proxyId), proxy);
    },
  });
}

export function useDuplicateProxyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proxyId: string) => {
      const proxy = await getProxy({ proxyId });
      return createProxy(proxyToDuplicateRequest(proxy));
    },
    onError: toastBrowserError,
    onSuccess: (proxy) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.status(),
      });
      queryClient.setQueryData(browserQueryKeys.proxy(proxy.proxyId), proxy);
    },
  });
}

export function useUpdateProxyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProxyRequest) => updateProxy(request),
    onError: toastBrowserError,
    onSuccess: (proxy) => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
      queryClient.setQueryData(browserQueryKeys.proxy(proxy.proxyId), proxy);
    },
  });
}

function proxyToDuplicateRequest(proxy: ProxyConfig): CreateProxyRequest {
  return {
    proxyId: duplicateProxyId(proxy.proxyId),
    name: `${proxy.name}复制`,
    type: proxy.type,
    host: proxy.host,
    port: proxy.port,
    username: proxy.username,
    password: proxy.password,
    server: proxy.server,
    pacUrl: proxy.pacUrl,
    bypassList: [...proxy.bypassList],
    refreshUrl: proxy.refreshUrl,
    ipChecker: proxy.ipChecker,
    remark: proxy.remark,
  };
}

function duplicateProxyId(proxyId: string) {
  const suffix = `copy-${Date.now().toString(36)}`;
  const baseLength = 80 - suffix.length - 1;
  const base = proxyId.slice(0, baseLength).replace(/-+$/g, '');

  return `${base || 'proxy'}-${suffix}`;
}

export function useDeleteProxiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteProxiesRequest) => deleteProxies(request),
    onError: toastBrowserError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
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

export function useCheckProxyMutation({
  invalidateOnSuccess = true,
}: { invalidateOnSuccess?: boolean } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CheckProxyRequest) => checkProxy(request),
    onError: toastBrowserError,
    onSuccess: () => {
      if (!invalidateOnSuccess) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
    },
  });
}

export function useCheckProxiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { proxyIds: string[] }) =>
      checkProxyIdsWithConcurrency(request.proxyIds),
    onError: toastBrowserError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.proxies(),
      });
      void queryClient.invalidateQueries({
        queryKey: browserQueryKeys.runtime(),
      });
    },
  });
}

async function checkProxyIdsWithConcurrency(proxyIds: string[]) {
  const results = new Array<ProxyCheckResult>(proxyIds.length);
  const errors: unknown[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < proxyIds.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const proxyId = proxyIds[currentIndex];

      if (!proxyId) {
        continue;
      }

      try {
        results[currentIndex] = await checkProxy({ proxyId });
      } catch (error) {
        errors.push(error);
      }
    }
  }

  const workerCount = Math.min(proxyBatchCheckConcurrency, proxyIds.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (errors.length) {
    throw errors[0];
  }

  return results;
}
