import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import type {
  OpenProfileProgressStep,
  ProfileListItem,
} from '@/features/browser/contracts';
import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  CreatedAtCell,
  EnvironmentCell,
  ProxyCell,
  RowActions,
} from '../components/profile-table-parts';
import {
  launchDisabledTitle,
  openProfileProgressLabel,
} from '../model/profile-list';

type UseProfileColumnsOptions = {
  allVisibleSelected: boolean;
  appStatusError: boolean;
  bulkOpeningIds: Set<string>;
  canLaunchProfile: boolean;
  checkingChromiumProfileId: string | null;
  chromiumReady: boolean;
  chromiumStatusChecking: boolean;
  isBulkOpening: boolean;
  isClosePending: boolean;
  isDeletePending: boolean;
  isDuplicatePending: boolean;
  isOpenPending: boolean;
  networkAvailable: boolean;
  onClose: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  onDuplicate: (profileId: string) => void;
  onEdit: (profileId: string | null) => void;
  onOpen: (profile: ProfileListItem) => void;
  onSwitchProxy: (profile: ProfileListItem) => void;
  openProgressByProfileId: Record<string, OpenProfileProgressStep>;
  selectedIdSet: Set<string>;
  someVisibleSelected: boolean;
  toggleProfile: (profileId: string, checked: boolean) => void;
  toggleVisibleProfiles: (checked: boolean) => void;
};

export function useProfileColumns({
  allVisibleSelected,
  appStatusError,
  bulkOpeningIds,
  canLaunchProfile,
  checkingChromiumProfileId,
  chromiumReady,
  chromiumStatusChecking,
  isBulkOpening,
  isClosePending,
  isDeletePending,
  isDuplicatePending,
  isOpenPending,
  networkAvailable,
  onClose,
  onDelete,
  onDuplicate,
  onEdit,
  onOpen,
  onSwitchProxy,
  openProgressByProfileId,
  selectedIdSet,
  someVisibleSelected,
  toggleProfile,
  toggleVisibleProfiles,
}: UseProfileColumnsOptions) {
  return useMemo<ColumnDef<ProfileListItem>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            aria-label="选择当前列表环境"
            checked={
              allVisibleSelected
                ? true
                : someVisibleSelected
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(checked) =>
              toggleVisibleProfiles(Boolean(checked))
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`选择环境 ${row.original.name}`}
            checked={selectedIdSet.has(row.original.profileId)}
            onCheckedChange={(checked) =>
              toggleProfile(row.original.profileId, Boolean(checked))
            }
          />
        ),
      },
      {
        accessorKey: 'name',
        header: '环境',
        cell: ({ row }) => (
          <EnvironmentCell profile={row.original} onEdit={onEdit} />
        ),
      },
      {
        accessorKey: 'proxySummary',
        header: '代理',
        cell: ({ row }) => (
          <ProxyCell profile={row.original} onSwitchProxy={onSwitchProxy} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '创建时间',
        cell: ({ row }) => <CreatedAtCell profile={row.original} />,
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const profile = row.original;
          const isActive = profile.status === 'active';
          const openProgress = openProgressByProfileId[profile.profileId];
          const isCheckingChromium =
            checkingChromiumProfileId === profile.profileId ||
            bulkOpeningIds.has(profile.profileId);
          const isOpening =
            !isActive && (Boolean(openProgress) || isCheckingChromium);
          const launchDisabled =
            !isActive &&
            (isOpenPending ||
              isClosePending ||
              checkingChromiumProfileId !== null ||
              isBulkOpening ||
              !canLaunchProfile);

          return (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                aria-busy={isOpening || undefined}
                title={
                  isActive
                    ? undefined
                    : launchDisabledTitle(
                        appStatusError,
                        chromiumReady,
                        chromiumStatusChecking,
                        networkAvailable,
                      )
                }
                disabled={isActive ? isClosePending : launchDisabled}
                onClick={() =>
                  isActive ? onClose(profile.profileId) : onOpen(profile)
                }
              >
                {isOpening ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon
                    icon={isActive ? StopIcon : PlayIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                )}
                {isActive
                  ? '关闭'
                  : isCheckingChromium
                    ? '检查浏览器'
                    : openProgress
                      ? openProfileProgressLabel(openProgress)
                      : '启动'}
              </Button>
              <RowActions
                profile={profile}
                isDeleting={isDeletePending}
                isDuplicating={isDuplicatePending}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            </div>
          );
        },
      },
    ],
    [
      allVisibleSelected,
      appStatusError,
      bulkOpeningIds,
      canLaunchProfile,
      checkingChromiumProfileId,
      chromiumReady,
      chromiumStatusChecking,
      isBulkOpening,
      isClosePending,
      isDeletePending,
      isDuplicatePending,
      isOpenPending,
      networkAvailable,
      onClose,
      onDelete,
      onDuplicate,
      onEdit,
      onOpen,
      onSwitchProxy,
      openProgressByProfileId,
      selectedIdSet,
      someVisibleSelected,
      toggleProfile,
      toggleVisibleProfiles,
    ],
  );
}
