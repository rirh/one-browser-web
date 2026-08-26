import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { Badge } from '@/components/ui/badge';
import type {
  ProfileListItem,
  ProxyListItem,
} from '@/features/browser/contracts';

import { ProfileProxySwitchForm } from './components/profile-proxy-switch-form';

export function ProfileProxySwitchDialog({
  isLoading,
  isPending,
  onOpenChange,
  onSubmit,
  open,
  profile,
  proxies,
}: {
  isLoading?: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (proxyId: string | null) => void;
  open: boolean;
  profile: ProfileListItem | null;
  proxies: ProxyListItem[];
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:w-100 sm:max-w-100">
        <ResponsiveDialogHeader>
          <div className="flex min-w-0 flex-wrap items-center gap-2 pr-8">
            <ResponsiveDialogTitle>编辑代理</ResponsiveDialogTitle>
            {profile ? (
              <Badge variant="secondary" className="max-w-full">
                <span className="truncate">当前环境：{profile.name}</span>
              </Badge>
            ) : null}
          </div>
          <ResponsiveDialogDescription className="sr-only">
            为当前环境选择代理模式和已保存代理。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {profile ? (
          <ProfileProxySwitchForm
            key={profile.profileId}
            isLoading={isLoading}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            profile={profile}
            proxies={proxies}
          />
        ) : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
