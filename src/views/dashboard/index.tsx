import { RefreshButton } from '@/components/refresh-button';
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
import { resolveRouteIcon } from '@/features/browser-shell/route-icons';
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
import type { DashboardActivityPoint, DashboardMetric } from './types';

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
  const visibleMetrics = data?.metrics.filter(hasMetricValues) ?? [];
  const resourceData =
    data?.charts.resource_distribution.filter(hasChartPointValue) ?? [];
  const environmentData =
    data?.charts.environment_status.filter(hasChartPointValue) ?? [];
  const proxyData = data?.charts.proxy_status.filter(hasChartPointValue) ?? [];
  const activityHasValues = hasActivityValues(data?.charts.activity ?? []);
  const hasChartScope = Boolean(
    resourceData.length ||
      environmentData.length ||
      proxyData.length ||
      activityHasValues,
  );

  return (
    <section className="bg-muted flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-3 p-3 lg:p-4">
        <div className="flex flex-col gap-3 px-1 py-1">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                工作台
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {displayName ? `欢迎回来，${displayName}` : '查看资源与最近动态'}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
                variant="ghost"
                isRefreshing={query.isFetching}
                onRefresh={query.refetch}
                successMessage="Dashboard 已刷新"
              />
            </div>
          </header>

          {query.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-48 rounded-xl" />
              ))}
            </div>
          ) : visibleMetrics.length ? (
            <div className="flex flex-wrap gap-2">
              {visibleMetrics.map((metric) => (
                <MetricCard key={metric.key} metric={metric} />
              ))}
            </div>
          ) : null}
        </div>

        {query.isLoading ? (
          <DashboardSkeleton />
        ) : query.isError ? (
          <Empty className="bg-card min-h-64 border-0">
            <EmptyHeader>
              <EmptyTitle>Dashboard 加载失败</EmptyTitle>
              <EmptyDescription>{query.error.message}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : data ? (
          <>
            {hasChartScope ? (
              <div className="grid gap-2 lg:grid-cols-2">
                {resourceData.length ? (
                  <ResourceDistributionChart
                    data={resourceData}
                    metrics={visibleMetrics}
                    onNavigate={router.push}
                  />
                ) : null}
                {environmentData.length ? (
                  <StatusPieChart title="环境状态" data={environmentData} />
                ) : null}
                {proxyData.length ? (
                  <StatusPieChart title="代理检测状态" data={proxyData} />
                ) : null}
                {activityHasValues ? (
                  <ActivityChart data={data.charts.activity} />
                ) : null}
              </div>
            ) : null}

            {quickLinks.length ? (
              <section className="flex flex-col gap-2 py-1">
              <div className="px-1">
                <h2 className="text-sm font-semibold">快捷入口</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  进入当前账号可访问的功能。
                </p>
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group bg-card hover:bg-muted flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-md transition-colors">
                      <HugeiconsIcon
                        icon={item.icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="text-muted-foreground group-hover:text-primary size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
              </section>
            ) : null}
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
    <Link
      to={metric.href}
      className="group hover:bg-background flex min-w-44 items-center gap-2 rounded-xl px-2.5 py-2 transition-colors"
    >
      <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
        <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-muted-foreground truncate text-xs">{metric.title}</p>
          <p className="text-base font-semibold tabular-nums">
            {metric.value}
          </p>
        </div>
        <p className="text-muted-foreground/80 truncate text-[0.6875rem]">
          {metric.secondary_label} {metric.secondary_value}
        </p>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg lg:col-span-2" />
      </div>
    </div>
  );
}

function flattenAuthorizedRoutes(routes: AuthRoute[] | undefined) {
  const links: Array<{
    title: string;
    href: string;
    icon: ReturnType<typeof resolveRouteIcon>;
  }> = [];
  const seen = new Set<string>();

  function visit(route: AuthRoute) {
    if (route.menu_type === 'C' && !route.hidden) {
      const href = ROUTE_ALIASES[route.path] ?? route.path;
      if (!['/dashboard', '/index'].includes(href) && !seen.has(href)) {
        seen.add(href);
        links.push({
          title: route.meta.title,
          href,
          icon: resolveRouteIcon(route.meta.icon),
        });
      }
    }
    route.children?.forEach(visit);
  }

  routes?.forEach(visit);
  return links;
}

function hasMetricValues(metric: DashboardMetric) {
  return metric.value > 0 || metric.secondary_value > 0;
}

function hasChartPointValue(point: { value: number }) {
  return point.value > 0;
}

function hasActivityValues(data: DashboardActivityPoint[]) {
  return data.some(
    (point) =>
      Number(point.teams ?? 0) > 0 ||
      Number(point.environments ?? 0) > 0 ||
      Number(point.proxies ?? 0) > 0,
  );
}
