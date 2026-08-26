import { browserQueryKeys } from '@/features/browser/cache/query-keys';
import type {
  AppStatus,
  PageResult,
  ProfileListItem,
  PublicRuntimeStatus,
  RuntimeProfile,
  RuntimeStatus,
} from '@/features/browser/contracts';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

type RuntimeMutationSnapshot = {
  profileLists: Array<[QueryKey, PageResult<ProfileListItem> | undefined]>;
  runtime: RuntimeProfile[] | undefined;
  status: AppStatus | undefined;
};

const publicStatusByRuntimeStatus = {
  inactive: 'Inactive',
  starting: 'Starting',
  active: 'Active',
  stopping: 'Stopping',
  error: 'Error',
} satisfies Record<RuntimeStatus, PublicRuntimeStatus>;

export async function takeRuntimeMutationSnapshot(
  queryClient: QueryClient,
): Promise<RuntimeMutationSnapshot> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: browserQueryKeys.runtime() }),
    queryClient.cancelQueries({ queryKey: browserQueryKeys.profiles() }),
    queryClient.cancelQueries({ queryKey: browserQueryKeys.status() }),
  ]);

  return {
    profileLists: queryClient.getQueriesData<PageResult<ProfileListItem>>({
      predicate: (query) => isProfileListQueryKey(query.queryKey),
    }),
    runtime: queryClient.getQueryData<RuntimeProfile[]>(
      browserQueryKeys.runtime(),
    ),
    status: queryClient.getQueryData<AppStatus>(browserQueryKeys.status()),
  };
}

export function restoreRuntimeMutationSnapshot(
  queryClient: QueryClient,
  snapshot: RuntimeMutationSnapshot | undefined,
) {
  if (!snapshot) {
    return;
  }

  queryClient.setQueryData(browserQueryKeys.runtime(), snapshot.runtime);
  queryClient.setQueryData(browserQueryKeys.status(), snapshot.status);
  snapshot.profileLists.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function markOpeningProfile(
  queryClient: QueryClient,
  profileId: string,
) {
  patchProfileListItem(queryClient, profileId, (profile) => ({
    ...profile,
    publicStatus: publicStatusByRuntimeStatus.starting,
    status: 'starting',
  }));
}

export function syncOpenedProfile(
  queryClient: QueryClient,
  runtime: RuntimeProfile,
) {
  upsertRuntimeProfile(queryClient, runtime);
  patchProfileListItem(queryClient, runtime.profileId, (profile) =>
    applyRuntimeToProfile(profile, runtime),
  );
  syncStatusRunningCount(queryClient);
}

export function markClosingProfile(
  queryClient: QueryClient,
  profileId: string,
) {
  patchRuntimeProfile(queryClient, profileId, (runtime) => ({
    ...runtime,
    status: 'stopping',
  }));
  patchProfileListItem(queryClient, profileId, (profile) => ({
    ...profile,
    publicStatus: publicStatusByRuntimeStatus.stopping,
    status: 'stopping',
  }));
}

export function syncClosedProfile(queryClient: QueryClient, profileId: string) {
  removeRuntimeProfiles(queryClient, [profileId]);
  markProfilesInactive(queryClient, [profileId]);
  syncStatusRunningCount(queryClient);
}

export function markClosingAllProfiles(queryClient: QueryClient) {
  const profileIds =
    queryClient
      .getQueryData<RuntimeProfile[]>(browserQueryKeys.runtime())
      ?.map((runtime) => runtime.profileId) ?? [];

  profileIds.forEach((profileId) => markClosingProfile(queryClient, profileId));

  return profileIds;
}

export function syncClosedProfiles(
  queryClient: QueryClient,
  profileIds: string[],
) {
  removeRuntimeProfiles(queryClient, profileIds);
  markProfilesInactive(queryClient, profileIds);
  syncStatusRunningCount(queryClient);
}

export function syncProfileListsFromRuntime(
  queryClient: QueryClient,
  runtime: RuntimeProfile[],
) {
  const runtimeByProfileId = new Map(
    runtime.map((item) => [item.profileId, item]),
  );

  patchProfileLists(queryClient, (profile) => {
    const runtimeProfile = runtimeByProfileId.get(profile.profileId);

    if (runtimeProfile) {
      return applyRuntimeToProfile(profile, runtimeProfile);
    }

    if (profile.status === 'inactive' && profile.pid === null) {
      return profile;
    }

    return inactiveProfile(profile);
  });
  syncStatusRunningCount(queryClient);
}

function applyRuntimeToProfile(
  profile: ProfileListItem,
  runtime: RuntimeProfile,
): ProfileListItem {
  return {
    ...profile,
    lastOpenAt: runtime.startedAt ?? profile.lastOpenAt,
    pid: runtime.pid,
    publicStatus: publicStatusByRuntimeStatus[runtime.status],
    proxyCountry: runtime.proxyStatus.country,
    proxyCountryCode: runtime.proxyStatus.countryCode,
    proxyExitIp: runtime.proxyStatus.exitIp,
    proxyRegion: runtime.proxyStatus.region,
    status: runtime.status,
  };
}

function inactiveProfile(profile: ProfileListItem): ProfileListItem {
  return {
    ...profile,
    pid: null,
    publicStatus: publicStatusByRuntimeStatus.inactive,
    status: 'inactive',
  };
}

function markProfilesInactive(queryClient: QueryClient, profileIds: string[]) {
  const profileIdSet = new Set(profileIds);
  patchProfileLists(queryClient, (profile) =>
    profileIdSet.has(profile.profileId) ? inactiveProfile(profile) : profile,
  );
}

function upsertRuntimeProfile(
  queryClient: QueryClient,
  runtime: RuntimeProfile,
) {
  queryClient.setQueryData<RuntimeProfile[]>(
    browserQueryKeys.runtime(),
    (current = []) =>
      sortRuntimeProfiles([
        ...current.filter((item) => item.profileId !== runtime.profileId),
        runtime,
      ]),
  );
}

function patchRuntimeProfile(
  queryClient: QueryClient,
  profileId: string,
  patch: (runtime: RuntimeProfile) => RuntimeProfile,
) {
  queryClient.setQueryData<RuntimeProfile[]>(
    browserQueryKeys.runtime(),
    (current) =>
      current?.map((runtime) =>
        runtime.profileId === profileId ? patch(runtime) : runtime,
      ),
  );
}

function removeRuntimeProfiles(queryClient: QueryClient, profileIds: string[]) {
  const profileIdSet = new Set(profileIds);
  queryClient.setQueryData<RuntimeProfile[]>(
    browserQueryKeys.runtime(),
    (current) =>
      current?.filter((runtime) => !profileIdSet.has(runtime.profileId)) ?? [],
  );
}

function patchProfileListItem(
  queryClient: QueryClient,
  profileId: string,
  patch: (profile: ProfileListItem) => ProfileListItem,
) {
  patchProfileLists(queryClient, (profile) =>
    profile.profileId === profileId ? patch(profile) : profile,
  );
}

function patchProfileLists(
  queryClient: QueryClient,
  patch: (profile: ProfileListItem) => ProfileListItem,
) {
  queryClient.setQueriesData<PageResult<ProfileListItem>>(
    { predicate: (query) => isProfileListQueryKey(query.queryKey) },
    (data) => {
      if (!data?.list) {
        return data;
      }

      const list = data.list.map(patch);

      return {
        ...data,
        list,
      };
    },
  );
}

function syncStatusRunningCount(queryClient: QueryClient) {
  const runtime = queryClient.getQueryData<RuntimeProfile[]>(
    browserQueryKeys.runtime(),
  );

  if (!runtime) {
    return;
  }

  queryClient.setQueryData<AppStatus>(browserQueryKeys.status(), (status) =>
    status
      ? {
          ...status,
          runningCount: runtime.filter((item) =>
            ['starting', 'active', 'stopping'].includes(item.status),
          ).length,
        }
      : status,
  );
}

function sortRuntimeProfiles(runtime: RuntimeProfile[]) {
  return [...runtime].sort((left, right) =>
    left.profileId.localeCompare(right.profileId),
  );
}

function isProfileListQueryKey(queryKey: QueryKey) {
  return (
    queryKey[0] === browserQueryKeys.all[0] &&
    queryKey[1] === 'profiles' &&
    queryKey[2] === 'list'
  );
}
