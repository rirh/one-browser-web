import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { ShieldUserIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import type { RemoteTeamResource } from './types';

const selectedTeamStorageKey = 'one-browser:selected-team-id';
const selectedTeamChangedEvent = 'one-browser:selected-team-changed';

export function useSelectedRemoteTeamId(teams: RemoteTeamResource[]) {
  const [storedTeamId, setStoredTeamId] = React.useState<number | null>(() =>
    readStoredTeamId(),
  );
  const selectedTeamId = React.useMemo(() => {
    if (!teams.length) {
      return null;
    }

    if (storedTeamId && teams.some((team) => team.team_id === storedTeamId)) {
      return storedTeamId;
    }

    return teams[0]?.team_id ?? null;
  }, [storedTeamId, teams]);

  React.useEffect(() => {
    function handleSelectedTeamChanged(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : null;
      if (typeof detail === 'number' && Number.isFinite(detail)) {
        setStoredTeamId(detail);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === selectedTeamStorageKey) {
        setStoredTeamId(readStoredTeamId());
      }
    }

    window.addEventListener(
      selectedTeamChangedEvent,
      handleSelectedTeamChanged,
    );
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(
        selectedTeamChangedEvent,
        handleSelectedTeamChanged,
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setSelectedTeamId = React.useCallback((value: number) => {
    selectRemoteTeamId(value);
  }, []);

  return [selectedTeamId, setSelectedTeamId] as const;
}

export function selectRemoteTeamId(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return;
  }

  writeStoredTeamId(value);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(selectedTeamChangedEvent, { detail: value }),
    );
  }
}

function readStoredTeamId() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(selectedTeamStorageKey);
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {
    // The first team will be used when storage is unavailable.
  }

  return null;
}

function writeStoredTeamId(value: number) {
  try {
    window.localStorage.setItem(selectedTeamStorageKey, String(value));
  } catch {
    // Selection still works for the current session.
  }
}

export function RemoteTeamRequiredState({
  isLoading,
  error,
}: {
  isLoading?: boolean;
  error?: unknown;
}) {
  if (isLoading) {
    return (
      <div className="grid min-h-full place-items-center bg-card text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Empty className="min-h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>无法读取团队</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : '请稍后重试。'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="min-h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>暂无团队</EmptyTitle>
        <EmptyDescription>
          创建或加入团队后，就可以管理团队环境和代理。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function RemotePermissionRequiredState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty className="min-h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function statusFlagLabel(status?: string | null) {
  return status === '1' ? '停用' : '启用';
}

export function splitTags(value: string) {
  return value
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinTags(values: string[]) {
  return values.join(', ');
}

export function generatedKey(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}
