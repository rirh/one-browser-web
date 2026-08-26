import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { ShieldUserIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type {
  RemoteTeamInviteResource,
  RemoteTeamInviteRoleResource,
  RemoteTeamResource,
} from '../types';

export type InviteMode = 'link' | 'email';

export function getPrimaryActionLabel({
  isSaving,
  mode,
  invite,
  isEmailInvite,
}: {
  isSaving: boolean;
  mode: InviteMode;
  invite: RemoteTeamInviteResource | null;
  isEmailInvite: boolean;
}) {
  if (isSaving) {
    return mode === 'email' ? '发送中...' : '生成中...';
  }
  if (isEmailInvite) {
    return '重新发送邮件';
  }
  if (invite) {
    return '重新生成链接';
  }
  return mode === 'email' ? '发送邮件' : '生成链接';
}

export function InviteTeamSelect({
  id,
  teams,
  selectedTeamId,
  selectedTeam,
  isLoading,
  disabled,
  onValueChange,
}: {
  id: string;
  teams: RemoteTeamResource[];
  selectedTeamId: number | null;
  selectedTeam: RemoteTeamResource | null;
  isLoading: boolean;
  disabled: boolean;
  onValueChange: (value: string) => void;
}) {
  return (
    <Field className="gap-1" data-disabled={disabled || isLoading}>
      <FieldLabel htmlFor={id} className="text-xs">
        团队
      </FieldLabel>
      <Select
        value={selectedTeamId ? String(selectedTeamId) : ''}
        disabled={disabled || isLoading || teams.length === 0}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          id={id}
          className="h-9 w-full rounded-lg bg-background px-2.5 text-sm"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground"
            />
            <span className="truncate">
              {selectedTeam?.team_name ??
                (isLoading ? '读取团队...' : '请选择团队')}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="w-[min(28rem,calc(100vw-2rem))]"
        >
          <SelectGroup>
            {teams.map((team) => (
              <SelectItem
                key={team.team_id}
                value={String(team.team_id)}
                textValue={team.team_name}
                className="min-h-0 items-start py-2 pr-9"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm font-medium">{team.team_name}</span>
                  <span className="whitespace-normal text-xs leading-5 text-muted-foreground">
                    {team.member_count} 成员 · {team.environment_count} 环境 ·{' '}
                    {team.proxy_count} 代理
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

export function InviteRoleSelect({
  id,
  roles,
  selectedRoleKey,
  selectedRole,
  isLoading,
  hasError,
  disabled,
  onValueChange,
}: {
  id: string;
  roles: RemoteTeamInviteRoleResource[];
  selectedRoleKey: string | null;
  selectedRole: RemoteTeamInviteRoleResource | null;
  isLoading: boolean;
  hasError: boolean;
  disabled: boolean;
  onValueChange: (value: string) => void;
}) {
  const isDisabled = disabled || isLoading || hasError || roles.length === 0;

  return (
    <Field className="gap-1" data-disabled={isDisabled} data-invalid={hasError}>
      <FieldLabel htmlFor={id} className="text-xs">
        角色
      </FieldLabel>
      <Select
        value={selectedRoleKey ?? ''}
        disabled={isDisabled}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          id={id}
          className="h-8 w-full rounded-md bg-background px-2 text-xs"
          aria-invalid={hasError}
          aria-required="true"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <HugeiconsIcon
              icon={ShieldUserIcon}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate text-left">
              {selectedRole?.role_name ??
                (isLoading ? '读取角色...' : '请选择角色')}
            </span>
            {selectedRole ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                {selectedRole.permission_count} 项权限
              </span>
            ) : null}
          </span>
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="w-[min(28rem,calc(100vw-2rem))]"
        >
          <SelectGroup>
            {roles.map((role) => (
              <SelectItem
                key={role.role_key}
                value={role.role_key}
                textValue={role.role_name}
                className="h-7 min-h-0 py-0.5 pr-8"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-xs font-medium">
                    {role.role_name}
                  </span>
                  <span className="ml-auto shrink-0 text-[0.6875rem] text-muted-foreground">
                    {role.permission_count} 项权限
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {hasError ? (
        <FieldError>角色加载失败，请稍后重试。</FieldError>
      ) : roles.length === 0 && !isLoading ? (
        <FieldDescription>当前团队暂无可邀请角色。</FieldDescription>
      ) : selectedRole?.remark?.trim() ? (
        <FieldDescription>{selectedRole.remark.trim()}</FieldDescription>
      ) : (
        <FieldDescription>成员加入后将获得所选角色的权限。</FieldDescription>
      )}
    </Field>
  );
}
