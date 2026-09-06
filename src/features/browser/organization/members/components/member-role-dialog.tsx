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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ShieldUserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import { useRemoteMemberPermissionsQuery } from '../queries';
import type {
  RemoteMemberPermissionsResource,
  RemoteMemberResource,
  RemoteMemberRolesPayload,
} from '../types';

export function MemberRoleDialog({
  open,
  record,
  canSubmit,
  canAssignManagedRoles,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  record: RemoteMemberResource | null;
  canSubmit: boolean;
  canAssignManagedRoles: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (memberId: number, payload: RemoteMemberRolesPayload) => void;
}) {
  const memberId = record?.member_id ?? null;
  const teamId = record?.team_id ?? null;
  const settingsQuery = useRemoteMemberPermissionsQuery(memberId, teamId, open);
  const settings = settingsQuery.data;
  const displayName = memberDisplayName(record);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>分配角色</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="truncate">
            {displayName}
            {record?.team_name ? ` · ${record.team_name}` : ''}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {settings && record && teamId ? (
          <MemberRoleForm
            key={`${record.team_id}-${record.member_id}-${settings.granted_role_ids.join(',')}`}
            record={record}
            settings={settings}
            canSubmit={canSubmit}
            canAssignManagedRoles={canAssignManagedRoles}
            isSaving={isSaving}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        ) : (
          <MemberRoleDialogState
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

function MemberRoleForm({
  record,
  settings,
  canSubmit,
  canAssignManagedRoles,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  record: RemoteMemberResource;
  settings: RemoteMemberPermissionsResource;
  canSubmit: boolean;
  canAssignManagedRoles: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (memberId: number, payload: RemoteMemberRolesPayload) => void;
}) {
  const availableRoleIds = React.useMemo(
    () => new Set(settings.roles.map((role) => role.role_id)),
    [settings.roles],
  );
  const initiallyGrantedRoleIds = React.useMemo(
    () =>
      new Set(
        settings.granted_role_ids.filter((roleId) =>
          availableRoleIds.has(roleId),
        ),
      ),
    [availableRoleIds, settings.granted_role_ids],
  );
  const [selectedRoleIds, setSelectedRoleIds] = React.useState(
    () => new Set(initiallyGrantedRoleIds),
  );
  const [search, setSearch] = React.useState('');
  const visibleRoles = settings.roles.filter((role) =>
    `${role.role_name} ${role.role_key}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  const selectableVisibleRoles = visibleRoles.filter(
    (role) => role.status === '0',
  );
  const allVisibleSelected =
    selectableVisibleRoles.length > 0 &&
    selectableVisibleRoles.every((role) => selectedRoleIds.has(role.role_id));
  const selectionDisabled = isSaving || !canSubmit || !canAssignManagedRoles;
  const selectedRoleCount = selectedRoleIds.size;
  const canSave =
    canSubmit && canAssignManagedRoles && selectedRoleCount > 0 && !isSaving;

  function toggleRole(roleId: number, checked: boolean) {
    setSelectedRoleIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(roleId);
      } else {
        next.delete(roleId);
      }
      return next;
    });
  }

  function saveRoles() {
    if (!canSave) {
      return;
    }

    onSubmit(record.member_id, {
      team_id: record.team_id,
      role_ids: Array.from(selectedRoleIds).sort((left, right) => left - right),
    });
  }

  return (
    <>
      <ResponsiveDialogBody className="flex flex-col gap-3">
        <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} />
          <span>
            仅可分配当前团队中、权限不超出你当前权限的角色。环境访问范围单独授权。
          </span>
        </div>

        <FieldSet>
          <FieldLegend variant="label">选择角色（可多选）</FieldLegend>
          <FieldDescription>
            已选择 {selectedRoleCount}/{settings.roles.length}
            ，至少保留一个角色。
            {!canAssignManagedRoles ? ' 调整角色需要角色更新权限。' : ''}
          </FieldDescription>
          {settings.roles.length > 0 && (
            <>
              <Input
                aria-label="搜索角色"
                placeholder="搜索角色名称或标识"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  匹配 {visibleRoles.length} 个角色
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={
                      selectionDisabled ||
                      !selectableVisibleRoles.length ||
                      allVisibleSelected
                    }
                    onClick={() =>
                      setSelectedRoleIds(
                        (current) =>
                          new Set([
                            ...current,
                            ...selectableVisibleRoles.map(
                              (role) => role.role_id,
                            ),
                          ]),
                      )
                    }
                  >
                    全选筛选结果
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={selectionDisabled || !selectedRoleCount}
                    onClick={() => setSelectedRoleIds(new Set())}
                  >
                    清空
                  </Button>
                </div>
              </div>
            </>
          )}
          {settings.roles.length ? (
            <FieldGroup
              data-slot="checkbox-group"
              className="max-h-72 gap-1.5 overflow-y-auto pr-1"
            >
              {visibleRoles.length === 0 && (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  没有匹配的角色
                </p>
              )}
              {visibleRoles.map((role) => {
                const id = `member-role-${record.member_id}-${role.role_id}`;
                const isInactive = role.status === '1';
                const wasGranted = initiallyGrantedRoleIds.has(role.role_id);
                const canToggleRole =
                  canAssignManagedRoles && (!isInactive || wasGranted);
                return (
                  <FieldLabel
                    key={role.role_id}
                    htmlFor={id}
                    className={`rounded-lg border px-3 py-2 ${selectedRoleIds.has(role.role_id) ? 'border-primary/40 bg-primary/5' : 'border-border'} ${isInactive ? 'text-muted-foreground' : ''}`}
                  >
                    <Field
                      orientation="horizontal"
                      data-disabled={
                        selectionDisabled || !canToggleRole || undefined
                      }
                    >
                      <Checkbox
                        id={id}
                        checked={selectedRoleIds.has(role.role_id)}
                        disabled={selectionDisabled || !canToggleRole}
                        onCheckedChange={(checked) =>
                          toggleRole(role.role_id, checked === true)
                        }
                      />
                      <FieldContent>
                        <FieldTitle>
                          {role.role_name}
                          {isInactive ? (
                            <Badge variant="destructive" className="h-4 px-1.5">
                              停用
                            </Badge>
                          ) : null}
                        </FieldTitle>
                        <FieldDescription>
                          {isInactive
                            ? wasGranted
                              ? '该角色已停用，可保留或移除现有关联'
                              : '该角色已停用，不能新增分配'
                            : `${role.role_key} · ${role.permission_count} 项权限`}
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                );
              })}
            </FieldGroup>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-8 text-center text-xs">
              暂无可分配角色，请先到角色管理中创建角色。
            </div>
          )}
        </FieldSet>
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
          disabled={!canSave}
          onClick={saveRoles}
        >
          保存 {selectedRoleCount} 个角色
        </DialogActionButton>
      </ResponsiveDialogFooter>
    </>
  );
}

function MemberRoleDialogState({
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
        <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-3 text-center text-xs">
          {isLoading ? (
            <>
              <Spinner />
              <span>正在读取角色...</span>
            </>
          ) : (
            <>
              <span>{error?.message || '角色读取失败'}</span>
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

function memberDisplayName(record: RemoteMemberResource | null) {
  return (
    record?.display_name || record?.nick_name || record?.user_name || '成员'
  );
}
