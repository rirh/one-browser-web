import type {
  OpenProfileProgressStep,
  ProfileListItem,
} from '@/features/browser/contracts';

import { networkUnavailableMessage } from '../../status/network-guard';
import { normalizeProfileGroup } from '../group-utils';

export const groupFilterAll = '__all__';
export const groupFilterUngrouped = '__ungrouped__';

const openProfileProgressLabels = {
  checking_proxy: '检查代理中',
  proxy_checked: '检查完成',
  preparing_launch: '准备启动中',
  launched: '启动完成',
  failed: '启动失败',
} satisfies Record<OpenProfileProgressStep, string>;

export type DeleteTarget = {
  profileIds: string[];
};

export type GroupFilterOption = {
  count: number;
  label: string;
  value: string;
};

export function openProfileProgressLabel(step: OpenProfileProgressStep) {
  return openProfileProgressLabels[step];
}

export function launchDisabledTitle(
  statusError: boolean,
  chromiumReady: boolean,
  chromiumStatusChecking: boolean,
  networkAvailable: boolean,
) {
  if (chromiumStatusChecking) {
    return '正在检查浏览器状态';
  }
  if (statusError) {
    return '浏览器状态检查失败';
  }
  if (!networkAvailable) {
    return networkUnavailableMessage;
  }
  if (!chromiumReady) {
    return '请先等待浏览器下载完成';
  }
  return undefined;
}

export function buildGroupFilters(profiles: ProfileListItem[]) {
  const counts = new Map<string, number>();
  profiles.forEach((profile) => {
    const group = normalizeProfileGroup(profile.groupId);
    if (group) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
    .map<GroupFilterOption>(([value, count]) => ({
      count,
      label: value,
      value,
    }));
}

export function proxyLabel(value: string) {
  const labels: Record<string, string> = {
    no_proxy: '无代理',
    fixed_servers: '固定代理',
    pac_script: 'PAC 代理',
  };
  return labels[value] ?? (value || '无代理');
}

export function isProfileListItem(
  profile: ProfileListItem | undefined,
): profile is ProfileListItem {
  return Boolean(profile);
}
