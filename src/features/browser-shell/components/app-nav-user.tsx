import { ThemeModeToggle } from '@/components/theme/theme-mode-toggle';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialogActionButton,
  AlertDialogCancelButton,
} from '@/components/ui/dialog-action-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DefaultUserAvatar,
  getDefaultUserAvatarSeed,
} from '@/features/account/avatar';
import type { CurrentUser } from '@/features/auth/types';
import { type Locale } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { reloadClient } from '@/platform/desktop/reload-client';
import {
  EllipsisVerticalIcon,
  LanguageCircleIcon,
  Logout03Icon,
  PaintBrush01Icon,
  Refresh01Icon,
  Settings02Icon,
  Shield01Icon,
  UserAdd01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'react-router-dom';
import * as React from 'react';

const SettingsDialog = React.lazy(() =>
  import('@/features/browser/settings/page').then((module) => ({
    default: module.SettingsDialog,
  })),
);

const accountMenuItems = [
  {
    label: '个人信息',
    href: '/account/profile',
    icon: UserIcon,
  },
  {
    label: '安全管理',
    href: '/account/password',
    icon: Shield01Icon,
  },
  {
    label: '邀请好友',
    href: '/account/invite',
    icon: UserAdd01Icon,
  },
] as const;

export function AppNavUser({
  isLoggingOut,
  onLogout,
  user,
}: {
  isLoggingOut?: boolean;
  onLogout: () => void;
  user: CurrentUser;
}) {
  const { isMobile } = useSidebar();
  const { locale, setLocale } = useI18n();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const displayName = user.nick_name || user.user_name || '未登录';
  const email = user.email || '未绑定邮箱';
  const avatar = user.avatar || '';
  const avatarSeed = getDefaultUserAvatarSeed(
    user.user_id,
    user.email,
    user.user_name,
    displayName,
  );

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar
                  avatar={avatar}
                  avatarSeed={avatarSeed}
                  displayName={displayName}
                />
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span
                    className="block truncate font-medium"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                  <span
                    className="text-muted-foreground block truncate text-[0.6875rem]"
                    title={email}
                  >
                    {email}
                  </span>
                </div>
                <HugeiconsIcon
                  icon={EllipsisVerticalIcon}
                  strokeWidth={2}
                  className="shrink-0"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-64"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>账户</DropdownMenuLabel>
                {accountMenuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href}>
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>偏好设置</DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                  设置
                </DropdownMenuItem>
                <div className="flex min-h-6 items-center gap-2 rounded-md px-2 py-0.5 text-xs/relaxed">
                  <HugeiconsIcon
                    icon={PaintBrush01Icon}
                    strokeWidth={2}
                    className="size-3.5 shrink-0"
                  />
                  <span>主题</span>
                  <ThemeModeToggle className="ml-auto" />
                </div>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <HugeiconsIcon icon={LanguageCircleIcon} strokeWidth={2} />
                    <span className="min-w-0 flex-1">语言</span>
                    <span className="text-muted-foreground">
                      {locale === 'zh-CN' ? '简体中文' : 'English'}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={locale}
                      onValueChange={(value) => {
                        setLocale(value as Locale);
                        setMenuOpen(false);
                      }}
                    >
                      <DropdownMenuRadioItem value="zh-CN">
                        简体中文
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="en-US">
                        English
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onSelect={reloadClient}>
                  <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />
                  重载客户端
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onSelect={() => setConfirmOpen(true)}
                >
                  <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {settingsOpen ? (
        <React.Suspense fallback={null}>
          <SettingsDialog open onOpenChange={setSettingsOpen} />
        </React.Suspense>
      ) : null}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isLoggingOut) {
            setConfirmOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后需要重新通过网页登录授权才能继续使用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancelButton disabled={isLoggingOut} />
            <AlertDialogActionButton
              variant="destructive"
              disabled={isLoggingOut}
              loading={isLoggingOut}
              loadingText="退出中..."
              onClick={(event) => {
                event.preventDefault();
                onLogout();
              }}
            >
              确认退出
            </AlertDialogActionButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UserAvatar({
  avatar,
  avatarSeed,
  displayName,
  size = 'default',
}: {
  avatar: string;
  avatarSeed: string;
  displayName: string;
  size?: 'default' | 'lg';
}) {
  return (
    <Avatar className="rounded-full" size={size}>
      <AvatarImage
        src={avatar || undefined}
        alt={displayName}
        className="rounded-full"
      />
      <AvatarFallback className="overflow-hidden rounded-full p-0">
        <DefaultUserAvatar seed={avatarSeed} />
      </AvatarFallback>
    </Avatar>
  );
}
