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
} from '@/components/ui/dialog-action-button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Delete02Icon, ShieldUserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import type { RemoteTeamResource } from '../../teams/types';
import type { RemoteMemberResource } from '../types';

export function NoMemberPermissionState({
  description = '团队 owner 或被授予成员管理权限后，可以查看并邀请成员。',
}: {
  description?: string;
}) {
  return (
    <Empty className="min-h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>暂无成员管理权限</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function MemberRemovalDialog({
  target,
  selectedTeam,
  isRemoving,
  onOpenChange,
  onConfirm,
}: {
  target: RemoteMemberResource | null;
  selectedTeam: RemoteTeamResource | null;
  isRemoving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </AlertDialogMedia>
          <AlertDialogTitle>确认移出成员</AlertDialogTitle>
          <AlertDialogDescription>
            {`确定要将成员「${target?.display_name ?? ''}」移出团队吗？其角色与环境授权将被清理，此操作无法撤销。`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isRemoving} />
          <AlertDialogActionButton
            variant="destructive"
            disabled={
              isRemoving ||
              !target ||
              !selectedTeam?.is_owner ||
              selectedTeam.owner_member_id === target.member_id
            }
            loading={isRemoving}
            loadingText="移出中..."
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            移出成员
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
