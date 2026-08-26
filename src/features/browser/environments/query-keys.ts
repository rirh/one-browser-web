import type { RemoteListParams } from './types';

const emptyParams = {} as const;

export const remoteEnvironmentQueryKeys = {
  environments: () => ['remote-browser', 'environments'] as const,
  list: (params?: RemoteListParams) =>
    [
      ...remoteEnvironmentQueryKeys.environments(),
      'list',
      params ?? emptyParams,
    ] as const,
} as const;
