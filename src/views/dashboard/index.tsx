import { RefreshButton } from '@/components/refresh-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/auth-gate';
import { hasPermission } from '@/features/auth/permissions';
import type { AuthRoute } from '@/features/auth/types';
import { formatDateTimeTitle, formatDisplayDateTime } from '@/lib/date-time';
import { useRouter } from '@/router/compat';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight01Icon,
  DashboardSquare01Icon,
  Notification01Icon,
  PackageOpenIcon,
  Route02Icon,
  UserGroupIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Navigate, Link } from 'react-router-dom';

import { getDashboardOverview } from './api';
import {
  ActivityChart,
  ResourceDistributionChart,
  StatusPieChart,
} from './charts';
import type { DashboardMetric } from './types';

const DASHBOARD_PERMISSION = 'index:overview';

const METRIC_ICONS = {
  teams: UserGroupIcon,
  environments: DashboardSquare01Icon,
  proxies: Route02Icon,
  members: UserMultipleIcon,
  assets: PackageOpenIcon,
  notices: Notification01Icon,
} as const;

const ROUTE_ALIASES: Record<string, string> = {
  '/index': '/dashboard',
  '/browser/environment': '/environments',
  '/browser/proxy': '/proxies',
  '/browser/team': '/teams',
  '/browser/member': '/members',
  '/browser/assets': '/versions',
};

export default function DashboardOverviewPage() {
  const { access, user } = useAuth();
  const router = useRouter();
  const canView = hasPermission(access, DASHBOARD_PERMISSION);
  const quickLinks = flattenAuthorizedRoutes(access.routes);
  const query = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: getDashboardOverview,
    enabled: canView,
  });

  if (!canView) {
    return <Navigate replace to={quickLinks[0]?.href ?? '/account/profile'} />;
  }

  const displayName = user.nick_name || user.user_name;
  const data = query.data;

  return (
    <section className="bg-muted/30 flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 p-3 lg:p-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <Badge variant="outline">聚合统计</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {displayName ? `${displayName}，` : ''}
              这里仅展示你有权访问的数据。
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data ? (
              <span
                className="text-muted-foreground text-xs"
                title={formatDateTimeTitle(data.generated_at)}
              >
                更新于 {formatDisplayDateTime(data.generated_at)}
              </span>
            ) : null}
            <RefreshButton
              size="sm"
              variant="outline"
              isRefreshing={query.isFetching}
              onRefresh={query.refetch}
              successMessage="Dashboard 已刷新"
            />
          </div>
        </header>

        {query.isLoading ? (
          <DashboardSkeleton />
        ) : query.isError ? (
          <Empty className="bg-card min-h-80">
            <EmptyHeader>
              <EmptyTitle>Dashboard 加载失败</EmptyTitle>
              <EmptyDescription>{query.error.message}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.key} metric={metric} />
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {data.charts.resource_distribution.length ? (
                <ResourceDistributionChart
                  data={data.charts.resource_distribution}
                  metrics={data.metrics}
                  onNavigate={router.push}
                />
              ) : null}
              {hasValues(data.charts.environment_status) ? (
                <StatusPieChart
                  title="环境状态"
                  data={data.charts.environment_status}
                />
              ) : null}
              {hasValues(data.charts.proxy_status) ? (
                <StatusPieChart
                  title="代理检测状态"
                  data={data.charts.proxy_status}
                />
              ) : null}
              {data.charts.activity.length ? (
                <ActivityChart data={data.charts.activity} />
              ) : null}
            </div>

            <div className="bg-card rounded-xl border p-4">
              <div className="mb-3">
                <h2 className="text-sm font-semibold">快捷入口</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  根据当前账号权限生成，可直接进入所有可见页面。
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group bg-background hover:border-primary/30 hover:bg-primary/5 flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors"
                  >
                    <div className="bg-muted text-muted-foreground group-hover:text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                      <HugeiconsIcon
                        icon={DashboardSquare01Icon}
                        strokeWidth={2}
                      />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon =
    METRIC_ICONS[metric.key as keyof typeof METRIC_ICONS] ??
    DashboardSquare01Icon;
  return (
    <Link to={metric.href} className="min-w-0">
      <Card className="hover:border-primary/30 hover:bg-primary/[0.03] h-full transition-colors">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Icon} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">{metric.title}</p>
            <p className="font-heading mt-0.5 text-2xl font-semibold tabular-nums">
              {metric.value}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-[0.6875rem]">
              {metric.secondary_label} {metric.secondary_value}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

function flattenAuthorizedRoutes(routes: AuthRoute[] | undefined) {
  const links: Array<{ title: string; href: string }> = [];
  const seen = new Set<string>();

  function visit(route: AuthRoute) {
    if (route.menu_type === 'C' && !route.hidden) {
      const href = ROUTE_ALIASES[route.path] ?? route.path;
      if (!['/dashboard', '/index'].includes(href) && !seen.has(href)) {
        seen.add(href);
        links.push({ title: route.meta.title, href });
      }
    }
    route.children?.forEach(visit);
  }

  routes?.forEach(visit);
  return links;
}

function hasValues(data: Array<{ value: number }>) {
  return data.some((item) => item.value > 0);
}
