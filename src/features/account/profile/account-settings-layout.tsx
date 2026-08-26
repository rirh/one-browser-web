import { AnimatedSegmentedTabs } from '@/components/ui/animated-segmented-tabs';
import {
  Shield01Icon,
  UserAdd01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePathname, useRouter } from '@/router/compat';

const accountRoutes = [
  {
    label: (
      <>
        <HugeiconsIcon
          icon={UserIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        个人信息
      </>
    ),
    value: 'profile',
    href: '/account/profile',
    title: '个人信息',
    description: '上传头像并编辑昵称、手机号和性别。',
  },
  {
    label: (
      <>
        <HugeiconsIcon
          icon={Shield01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        安全管理
      </>
    ),
    value: 'password',
    href: '/account/password',
    title: '安全管理',
    description: '修改当前账号的登录密码，保存后请使用新密码登录。',
  },
  {
    label: (
      <>
        <HugeiconsIcon
          icon={UserAdd01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        邀请好友
      </>
    ),
    value: 'invite',
    href: '/account/invite',
    title: '邀请好友',
    description: '复制邀请链接或二维码，并查看已经邀请的好友。',
  },
] as const;

export function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = pathname.startsWith('/account/password')
    ? 'password'
    : pathname.startsWith('/account/invite')
      ? 'invite'
      : 'profile';
  const activeRoute =
    accountRoutes.find((route) => route.value === activeTab) ??
    accountRoutes[0];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-muted/35 p-3 lg:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <AnimatedSegmentedTabs
          label="账号设置"
          value={activeTab}
          options={accountRoutes}
          onValueChange={(value) => {
            const route = accountRoutes.find((item) => item.value === value);
            if (route) {
              router.push(route.href);
            }
          }}
        />

        <header className="flex flex-col gap-1">
          <h1 className="text-base font-semibold tracking-normal">
            {activeRoute.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeRoute.description}
          </p>
        </header>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
