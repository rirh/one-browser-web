import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { logout } from '@/features/auth/api';
import { useAuth } from '@/features/auth/auth-gate';
import {
  hasAnyTeamPermission,
  hasPermission,
} from '@/features/auth/permissions';
import type { AuthRoute } from '@/features/auth/types';
import { cn } from '@/lib/utils';
import { http } from '@/platform/http';
import {
  DashboardBrowsingIcon,
  Key01Icon,
  PackageOpenIcon,
  Route02Icon,
  ShieldUserIcon,
  UserGroupIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { usePathname, useRouter } from '@/router/compat';

import { AppNavUser } from './app-nav-user';
import { AppTeamSwitcher } from './app-team-switcher';

type NavItem = {
  href: string;
  icon: typeof DashboardBrowsingIcon;
  title: string;
};

const navItemByAuthPath: Record<string, Omit<NavItem, 'title'>> = {
  '/browser/environment': {
    href: '/',
    icon: DashboardBrowsingIcon,
  },
  '/browser/proxy': {
    href: '/proxies',
    icon: Route02Icon,
  },
  '/browser/team': {
    href: '/teams',
    icon: UserGroupIcon,
  },
  '/browser/member': {
    href: '/members',
    icon: UserMultipleIcon,
  },
  '/browser/role': {
    href: '/roles',
    icon: ShieldUserIcon,
  },
  '/browser/permission': {
    href: '/permissions',
    icon: Key01Icon,
  },
  '/browser/assets': {
    href: '/versions',
    icon: PackageOpenIcon,
  },
};

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { access, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const navItems = React.useMemo(
    () => buildNavItems(access.routes),
    [access.routes],
  );
  const showTeamShortcuts =
    hasPermission(access, 'browser:team:list') ||
    hasAnyTeamPermission(access, 'browser:team:list');

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('已退出登录');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `退出登录请求失败，已清除本地登录：${error.message}`
          : '退出登录请求失败，已清除本地登录',
      );
    } finally {
      http.updateTokens(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.removeQueries({ queryKey: ['remote-browser'] });
      router.replace('/login');
      setIsLoggingOut(false);
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {showTeamShortcuts ? (
        <SidebarHeader>
          <AppTeamSwitcher access={access} />
        </SidebarHeader>
      ) : null}
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AppNavUser
          user={user}
          isLoggingOut={isLoggingOut}
          onLogout={() => void handleLogout()}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = isActivePath(pathname, item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          '[&_svg]:size-3.5',
          active &&
            'bg-sidebar-primary/10 font-medium text-sidebar-primary hover:bg-sidebar-primary/15 hover:text-sidebar-primary',
        )}
        tooltip={item.title}
      >
        <Link to={item.href} aria-current={active ? 'page' : undefined}>
          <HugeiconsIcon
            icon={item.icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          <span className="truncate">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function buildNavItems(routes: AuthRoute[] | undefined): NavItem[] {
  const items: NavItem[] = [];
  const seenPaths = new Set<string>();

  function collect(route: AuthRoute) {
    const item = navItemByAuthPath[route.path];
    if (!route.hidden && item && !seenPaths.has(route.path)) {
      seenPaths.add(route.path);
      items.push({
        ...item,
        title: route.meta.title,
      });
    }

    route.children?.forEach(collect);
  }

  routes?.forEach(collect);
  return items;
}
