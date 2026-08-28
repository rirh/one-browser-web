import { WorkspaceLoadingSkeleton } from '@/components/loading-skeleton';
import { AccountSettingsLayout } from '@/features/account/profile/account-settings-layout';
import { AuthGate } from '@/features/auth/auth-gate';
import { DashboardShell } from '@/features/browser-shell/dashboard-shell';
import { isTauriRuntime } from '@/lib/desktop';
import { AppErrorBoundary } from '@/views/error/error-boundary';
import NotFound from '@/views/error/not-found';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const LoginPage = lazy(() => import('@/views/auth/login'));
const CallbackPage = lazy(() => import('@/views/auth/callback'));
const TeamInvitePage = lazy(() => import('@/views/auth/team-invite'));
const DownloadPage = lazy(() => import('@/views/download'));
const DashboardOverviewPage = lazy(() => import('@/views/dashboard'));
const EnvironmentsPage = lazy(() => import('@/views/browser/environments'));
const ProxiesPage = lazy(() => import('@/views/browser/proxies'));
const TeamsPage = lazy(() => import('@/views/browser/teams'));
const MembersPage = lazy(() => import('@/views/browser/members'));
const VersionsPage = lazy(() => import('@/views/browser/versions'));
const SettingsPage = lazy(() => import('@/views/browser/settings'));
const AccountProfilePage = lazy(() => import('@/views/account/profile'));
const AccountPasswordPage = lazy(
  () => import('@/views/account/password/redirect'),
);
const AccountInvitePage = lazy(() => import('@/views/account/invite'));
const SystemUserPage = lazy(() => import('@/views/system/user'));
const SystemRolePage = lazy(() => import('@/views/system/role'));
const SystemMenuPage = lazy(() => import('@/views/system/menu'));
const SystemNoticePage = lazy(() => import('@/views/system/notice'));
const OperationLogPage = lazy(() => import('@/views/system/log/operation'));
const LoginLogPage = lazy(() => import('@/views/system/log/login'));
const HealthPage = lazy(() => import('@/views/monitor/health'));
const JobPage = lazy(() => import('@/views/monitor/job'));

export function AppRouter() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<WorkspaceLoadingSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/team-invite" element={<TeamInvitePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/index" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<DefaultEntryRedirect />} />
          <Route
            path="/dashboard"
            element={<DashboardPage page={<DashboardOverviewPage />} />}
          />
          <Route
            path="/system/user"
            element={<DashboardPage page={<SystemUserPage />} />}
          />
          <Route
            path="/system/role"
            element={<DashboardPage page={<SystemRolePage />} />}
          />
          <Route
            path="/system/menu"
            element={<DashboardPage page={<SystemMenuPage />} />}
          />
          <Route
            path="/system/notice"
            element={<DashboardPage page={<SystemNoticePage />} />}
          />
          <Route
            path="/system/log/operation"
            element={<DashboardPage page={<OperationLogPage />} />}
          />
          <Route
            path="/system/log/login"
            element={<DashboardPage page={<LoginLogPage />} />}
          />
          <Route
            path="/monitor/health"
            element={<DashboardPage page={<HealthPage />} />}
          />
          <Route
            path="/monitor/job"
            element={<DashboardPage page={<JobPage />} />}
          />
          <Route
            path="/environments"
            element={<DashboardPage page={<EnvironmentsPage />} />}
          />
          <Route
            path="/proxies"
            element={<DashboardPage page={<ProxiesPage />} />}
          />
          <Route
            path="/teams"
            element={<DashboardPage page={<TeamsPage />} />}
          />
          <Route
            path="/members"
            element={<DashboardPage page={<MembersPage />} />}
          />
          <Route
            path="/roles"
            element={<Navigate to="/system/role" replace />}
          />
          <Route
            path="/permissions"
            element={<Navigate to="/system/menu" replace />}
          />
          <Route
            path="/versions"
            element={<DashboardPage page={<VersionsPage />} />}
          />
          <Route
            path="/settings"
            element={<DashboardPage page={<SettingsPage />} />}
          />
          <Route
            path="/account"
            element={<Navigate to="/account/profile" replace />}
          />
          <Route
            path="/account/profile"
            element={<AccountPage page={<AccountProfilePage />} />}
          />
          <Route
            path="/account/password"
            element={<DashboardPage page={<AccountPasswordPage />} />}
          />
          <Route
            path="/account/invite"
            element={<AccountPage page={<AccountInvitePage />} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

function DefaultEntryRedirect() {
  return (
    <Navigate replace to={isTauriRuntime() ? '/dashboard' : '/download'} />
  );
}

function DashboardPage({ page }: { page: React.ReactNode }) {
  return (
    <AuthGate>
      <DashboardShell>{page}</DashboardShell>
    </AuthGate>
  );
}

function AccountPage({ page }: { page: React.ReactNode }) {
  return (
    <DashboardPage
      page={<AccountSettingsLayout>{page}</AccountSettingsLayout>}
    />
  );
}
