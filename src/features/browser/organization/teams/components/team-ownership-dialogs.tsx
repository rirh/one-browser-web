import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertDialogActionButton,
  AlertDialogCancelButton,
  DialogActionButton,
} from '@/components/ui/dialog-action-button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Alert01Icon,
  UserMultipleIcon,
  UserSwitchIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import { useRemoteMembersQuery } from '../../members/queries';
import type { RemoteTeamResource } from '../types';

export function TransferTeamOwnershipDialog({
  team,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  team: RemoteTeamResource;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (memberId: number) => void;
}) {
  const [selectedMemberId, setSelectedMemberId] = React.useState('');
  const membersQuery = useRemoteMembersQuery(
    { team_id: team.team_id, page_size: 100 },
    true,
  );
  const candidates = React.useMemo(
    () =>
      (membersQuery.data?.list ?? []).filter(
        (member) =>
          member.status === '0' && member.member_id !== team.owner_member_id,
      ),
    [membersQuery.data?.list, team.owner_member_id],
  );
  const selectedMember = candidates.find(
    (member) => String(member.member_id) === selectedMemberId,
  );

  return (
    <ResponsiveDialog open onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="bg-card sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>转移所有者</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {team.team_name} · 转移后你仍保留团队管理员身份
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-3">
          {membersQuery.isLoading ? (
            <div className="grid min-h-28 place-items-center">
              <Spinner />
            </div>
          ) : candidates.length ? (
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              新所有者
              <Select
                value={selectedMemberId}
                disabled={isSaving}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择团队成员" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {candidates.map((member) => (
                      <SelectItem
                        key={member.member_id}
                        value={String(member.member_id)}
                      >
                        {member.display_name ||
                          member.nick_name ||
                          member.user_name}
                        {member.email ? ` · ${member.email}` : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
          ) : (
            <Empty className="min-h-28 border border-border/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>没有可转移的成员</EmptyTitle>
                <EmptyDescription>
                  请先邀请并启用至少一名其他团队成员。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {selectedMember ? (
            <p className="text-xs text-muted-foreground">
              保存后，{selectedMember.display_name || selectedMember.user_name}
              将立即获得团队所有者权限。
            </p>
          ) : null}
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <DialogActionButton
            action="cancel"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            取消
          </DialogActionButton>
          <DialogActionButton
            disabled={!selectedMember || isSaving}
            loading={isSaving}
            loadingText="转移中..."
            onClick={() => {
              if (selectedMember) {
                onSubmit(selectedMember.member_id);
              }
            }}
          >
            <HugeiconsIcon
              icon={UserSwitchIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            确认转移
          </DialogActionButton>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function DissolveTeamDialog({
  team,
  isSaving,
  onOpenChange,
  onConfirm,
}: {
  team: RemoteTeamResource;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>解散团队“{team.team_name}”</AlertDialogTitle>
          <AlertDialogDescription>
            解散后，{team.member_count} 名成员、{team.environment_count}{' '}
            个环境和
            {team.proxy_count}
            个代理将立即不可访问，所有待处理邀请也会失效。此操作无法在 app
            中撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isSaving} />
          <AlertDialogActionButton
            variant="destructive"
            loading={isSaving}
            loadingText="解散中..."
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            解散团队
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
