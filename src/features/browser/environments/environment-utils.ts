import type { RuntimeProfile } from '@/features/browser/contracts';
import { normalizeProfileGroup } from '@/features/browser/profiles/group-utils';

import type { RemoteEnvironmentDialogState } from './components/environment-editor-dialog';
import { remoteEnvironmentProfileId } from './runtime-profile-id';
import type {
  RemoteEnvironmentListItem,
  RemoteEnvironmentPayload,
  RemoteEnvironmentResource,
} from './types';

export const groupFilterAll = '__all__';
export const groupFilterUngrouped = '__ungrouped__';

export function applyLocalRuntimeState(
  environment: RemoteEnvironmentListItem,
  runtimeByProfileId: Map<string, RuntimeProfile>,
): RemoteEnvironmentListItem {
  const localRuntime = runtimeByProfileId.get(
    remoteEnvironmentProfileId(environment),
  );
  if (localRuntime) {
    return {
      ...environment,
      runtime_status: localRuntime.status,
      last_open_at: localRuntime.startedAt ?? environment.last_open_at,
    };
  }
  return environment;
}

export type GroupFilterOption = {
  count: number;
  label: string;
  value: string;
};

export function buildGroupFilters(environments: RemoteEnvironmentListItem[]) {
  if (!environments.length) {
    return [];
  }
  const counts = new Map<string, number>();
  let ungroupedCount = 0;
  for (const environment of environments) {
    const group = normalizeProfileGroup(environment.group_key);
    if (group) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    } else {
      ungroupedCount += 1;
    }
  }
  const groups = Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([value, count]) => ({ value, label: value, count }));
  const filters: GroupFilterOption[] = [
    { value: groupFilterAll, label: '全部', count: environments.length },
    ...groups,
  ];
  if (groups.length && ungroupedCount > 0) {
    filters.push({
      value: groupFilterUngrouped,
      label: '未分组',
      count: ungroupedCount,
    });
  }
  return filters;
}

export function duplicateEnvironmentPayload(
  record: RemoteEnvironmentResource,
  teamId: number,
): RemoteEnvironmentPayload {
  const suffix = Date.now().toString(36);
  return {
    team_id: teamId,
    environment_key: `${record.environment_key}-copy-${suffix}`,
    environment_no: record.environment_no
      ? `${record.environment_no}-copy`
      : null,
    name: `${record.name} 副本`,
    group_key: record.group_key,
    chromium_version: record.chromium_version,
    mode: record.mode,
    status: '0',
    proxy_id: record.proxy_id,
    owner_member_id: record.owner_member_id,
    remark: record.remark,
    fingerprint_config: record.fingerprint_config ?? undefined,
    advanced: record.advanced ?? undefined,
  };
}

export function environmentDialogKey(
  state: RemoteEnvironmentDialogState | null,
) {
  if (!state) {
    return 'closed';
  }
  return state.mode === 'edit'
    ? `edit:${state.record.environment_id}:${state.record.updated_at ?? ''}`
    : 'create';
}

export function isRemoteEnvironmentListItem(
  value: RemoteEnvironmentListItem | undefined,
): value is RemoteEnvironmentListItem {
  return Boolean(value);
}
