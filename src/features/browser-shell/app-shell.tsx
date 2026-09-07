import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshButton } from '@/components/refresh-button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ProfilesPage } from '@/features/browser/profiles/page';
import { ProxiesPage } from '@/features/browser/proxies/page';
import { RuntimePage } from '@/features/browser/runtime/page';
import { SettingsPage } from '@/features/browser/settings/page';
import { resolveChromiumDisplay } from '@/features/browser/status/chromium-display';
import { useAppStatusQuery } from '@/features/browser/status/queries';
import {
  Activity03Icon,
  BrowserIcon,
  Globe02Icon,
  Moon02Icon,
  Search01Icon,
  ServerStack01Icon,
  Settings02Icon,
  Sun02Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';

import { useTheme } from '@/components/theme/runtime';

type BrowserSection = 'profiles' | 'proxies' | 'runtime' | 'settings';

const sections = [
  { value: 'profiles', label: '环境', icon: UserMultipleIcon },
  { value: 'proxies', label: '代理', icon: Globe02Icon },
  { value: 'runtime', label: '运行中', icon: Activity03Icon },
  { value: 'settings', label: '设置', icon: Settings02Icon },
] satisfies Array<{
  value: BrowserSection;
  label: string;
  icon: typeof BrowserIcon;
}>;

export function AppShell() {
  const [section, setSection] = useState<BrowserSection>('profiles');
  const [globalSearch, setGlobalSearch] = useState('');
  const statusQuery = useAppStatusQuery();
  const { resolvedTheme, setTheme } = useTheme();
  const status = statusQuery.data;
  const apiStatus = status?.apiStatus;
  const chromium = resolveChromiumDisplay(status?.chromiumPath);
  const apiStatusLabel = statusQuery.isLoading
    ? 'API 检测中'
    : statusQuery.isError
      ? 'API 异常'
      : !apiStatus?.enabled
        ? 'API 关闭'
        : apiStatus.running
          ? 'API 运行中'
          : 'API 不可用';
  const activeLabel = useMemo(
    () => sections.find((item) => item.value === section)?.label ?? '环境',
    [section],
  );

  return (
    <div className="bg-muted text-foreground flex min-h-dvh">
      <aside className="bg-muted/20 hidden w-60 shrink-0 border-r md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <HugeiconsIcon icon={BrowserIcon} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">有个浏览器</div>
            <div className="text-muted-foreground truncate text-xs">
              团队协作指纹浏览器
            </div>
          </div>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {sections.map((item) => (
            <Button
              key={item.value}
              variant={section === item.value ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setSection(item.value)}
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 flex-col gap-3 border-b px-3 py-3 lg:flex-row lg:items-center lg:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="md:hidden">
              <HugeiconsIcon icon={BrowserIcon} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-medium">{activeLabel}</h1>
              <p className="text-muted-foreground truncate text-xs">
                {status?.appDataDir ?? '桌面运行时将在 Tauri 中连接'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1 lg:w-72 lg:flex-none">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
              />
              <Input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                className="pl-8"
                placeholder="搜索环境或代理"
              />
            </div>
            <Badge
              variant={
                apiStatus?.running
                  ? 'default'
                  : apiStatus?.enabled
                    ? 'destructive'
                    : 'outline'
              }
            >
              <HugeiconsIcon
                icon={ServerStack01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {apiStatusLabel}
            </Badge>
            <Badge variant={chromium.variant} title={chromium.title}>
              Chromium {chromium.badge}
            </Badge>
            <RefreshButton
              variant="outline"
              size="icon"
              iconOnly
              isRefreshing={statusQuery.isFetching}
              onRefresh={statusQuery.refetch}
              aria-label="刷新状态"
              successMessage="应用状态已刷新"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              aria-label="切换主题"
            >
              <HugeiconsIcon
                icon={resolvedTheme === 'dark' ? Sun02Icon : Moon02Icon}
                strokeWidth={2}
              />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 md:hidden">
            {sections.map((item) => (
              <Button
                key={item.value}
                variant={section === item.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSection(item.value)}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                {item.label}
              </Button>
            ))}
          </div>
        </header>
        <Tabs
          value={section}
          onValueChange={(value) => setSection(value as BrowserSection)}
        >
          <TabsContent value="profiles">
            <ProfilesPage search={globalSearch} />
          </TabsContent>
          <TabsContent value="proxies">
            <ProxiesPage search={globalSearch} />
          </TabsContent>
          <TabsContent value="runtime">
            <RuntimePage />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
