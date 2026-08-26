import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogActionButton } from '@/components/ui/dialog-action-button';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import { useRemoteMemberPermissionsQuery } from '../queries';
import type {
  RemoteMemberEnvironmentAuthorizationPayload,
  RemoteMemberEnvironmentOptionResource,
  RemoteMemberPermissionsResource,
  RemoteMemberResource,
} from '../types';

type CheckedState = boolean | 'indeterminate';

export function MemberEnvironmentAuthorizationDialog({
  open,
  record,
  canSubmit,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: RemoteMemberResource | null;
  canSubmit: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    memberId: number,
    payload: RemoteMemberEnvironmentAuthorizationPayload,
  ) => void;
}) {
  const memberId = record?.member_id ?? null;
  const teamId = record?.team_id ?? null;
  const settingsQuery = useRemoteMemberPermissionsQuery(memberId, teamId, open);
  const settings = settingsQuery.data;
  const displayName = memberDisplayName(record);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>环境授权</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="truncate">
            {displayName}
            {record?.team_name ? ` · ${record.team_name}` : ''}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {settings && record && teamId ? (
          <MemberEnvironmentAuthorizationForm
            key={`${record.team_id}-${record.member_id}-${settings.granted_environment_ids.join(',')}`}
            record={record}
            settings={settings}
            canSubmit={canSubmit}
            isSaving={isSaving}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        ) : (
          <MemberEnvironmentDialogState
            error={settingsQuery.error}
            isLoading={settingsQuery.isLoading}
            isSaving={isSaving}
            onOpenChange={onOpenChange}
            onRetry={() => void settingsQuery.refetch()}
          />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function MemberEnvironmentAuthorizationForm({
  record,
  settings,
  canSubmit,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  record: RemoteMemberResource;
  settings: RemoteMemberPermissionsResource;
  canSubmit: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    memberId: number,
    payload: RemoteMemberEnvironmentAuthorizationPayload,
  ) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState(
    () => new Set(settings.granted_environment_ids),
  );
  const filteredEnvironments = React.useMemo(
    () => filterEnvironments(settings.environments, search),
    [search, settings.environments],
  );
  const visibleIds = filteredEnvironments.map(
    (environment) => environment.environment_id,
  );
  const selectedVisibleCount = visibleIds.filter((environmentId) =>
    selectedIds.has(environmentId),
  ).length;
  const selectedCount = settings.environments.filter((environment) =>
    selectedIds.has(environment.environment_id),
  ).length;
  const visibleSelectionState: CheckedState =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
      ? true
      : selectedVisibleCount > 0
        ? 'indeterminate'
        : false;

  function toggleEnvironment(environmentId: number, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(environmentId);
      } else {
        next.delete(environmentId);
      }
      return next;
    });
  }

  function toggleVisibleEnvironments(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((environmentId) => {
        if (checked) {
          next.add(environmentId);
        } else {
          next.delete(environmentId);
        }
      });
      return next;
    });
  }

  function saveEnvironments() {
    if (!canSubmit || isSaving) {
      return;
    }

    onSubmit(record.member_id, {
      team_id: record.team_id,
      environment_ids: Array.from(selectedIds).sort(
        (left, right) => left - right,
      ),
    });
  }

  return (
    <>
      <ResponsiveDialogBody className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-0.5">
            <FieldLabel htmlFor="member-environment-search">
              可访问环境
            </FieldLabel>
            <FieldDescription>
              已授权 {selectedCount}/{settings.environments.length}
            </FieldDescription>
          </div>
          <InputGroup className="h-8 bg-background sm:max-w-xs">
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              id="member-environment-search"
              value={search}
              disabled={isSaving || settings.environments.length === 0}
              placeholder="搜索环境名称或编号"
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </div>

        <ScrollArea className="h-80 rounded-lg border bg-background">
          <table className="w-full table-fixed text-xs">
            <thead className="sticky top-0 bg-muted/60 text-muted-foreground">
              <tr className="border-b">
                <th className="w-12 px-3 py-2 text-left font-medium">
                  <Checkbox
                    checked={visibleSelectionState}
                    disabled={isSaving || visibleIds.length === 0}
                    aria-label="选择当前列表中的全部环境"
                    onCheckedChange={(checked) =>
                      toggleVisibleEnvironments(checked === true)
                    }
                  />
                </th>
                <th className="px-2 py-2 text-left font-medium">环境名称</th>
                <th className="w-32 px-2 py-2 text-left font-medium">编号</th>
                <th className="w-20 px-3 py-2 text-left font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnvironments.length ? (
                filteredEnvironments.map((environment) => {
                  const id = `member-environment-${record.member_id}-${environment.environment_id}`;
                  return (
                    <tr
                      key={environment.environment_id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-3 py-2.5">
                        <Checkbox
                          id={id}
                          checked={selectedIds.has(environment.environment_id)}
                          disabled={isSaving}
                          onCheckedChange={(checked) =>
                            toggleEnvironment(
                              environment.environment_id,
                              checked === true,
                            )
                          }
                        />
                      </td>
                      <td className="min-w-0 px-2 py-2.5">
                        <FieldLabel htmlFor={id} className="block truncate">
                          {environment.name}
                        </FieldLabel>
                      </td>
                      <td className="px-2 py-2.5 text-muted-foreground">
                        <span className="block truncate">
                          {environment.environment_no ??
                            `ID ${environment.environment_id}`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            environment.status === '0' ? 'secondary' : 'outline'
                          }
                        >
                          {environment.status === '0' ? '启用' : '停用'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-12 text-center text-muted-foreground"
                  >
                    {settings.environments.length
                      ? '没有匹配的环境'
                      : '当前团队暂无环境'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter>
        <DialogActionButton
          action="cancel"
          type="button"
          disabled={isSaving}
          onClick={() => onOpenChange(false)}
        >
          取消
        </DialogActionButton>
        <DialogActionButton
          type="button"
          loading={isSaving}
          loadingText="保存中..."
          disabled={!canSubmit || isSaving}
          onClick={saveEnvironments}
        >
          保存授权
        </DialogActionButton>
      </ResponsiveDialogFooter>
    </>
  );
}

function MemberEnvironmentDialogState({
  error,
  isLoading,
  isSaving,
  onOpenChange,
  onRetry,
}: {
  error: Error | null;
  isLoading: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}) {
  return (
    <>
      <ResponsiveDialogBody>
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-xs text-muted-foreground">
          {isLoading ? (
            <>
              <Spinner />
              <span>正在读取环境授权...</span>
            </>
          ) : (
            <>
              <span>{error?.message || '环境授权读取失败'}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                重新加载
              </Button>
            </>
          )}
        </div>
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter>
        <DialogActionButton
          action="cancel"
          type="button"
          disabled={isSaving}
          onClick={() => onOpenChange(false)}
        >
          关闭
        </DialogActionButton>
      </ResponsiveDialogFooter>
    </>
  );
}

function filterEnvironments(
  environments: RemoteMemberEnvironmentOptionResource[],
  search: string,
) {
  const keyword = search.trim().toLocaleLowerCase();
  if (!keyword) {
    return environments;
  }

  return environments.filter((environment) =>
    [
      environment.name,
      environment.environment_no ?? '',
      String(environment.environment_id),
      environment.status === '0' ? '启用' : '停用',
    ].some((value) => value.toLocaleLowerCase().includes(keyword)),
  );
}

function memberDisplayName(record: RemoteMemberResource | null) {
  return (
    record?.display_name || record?.nick_name || record?.user_name || '成员'
  );
}
