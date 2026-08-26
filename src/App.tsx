import { AccountSettingsLayout } from '@/features/account/profile/account-settings-layout';
import { WorkspaceLoadingSkeleton } from '@/components/loading-skeleton';
import { AuthGate } from '@/features/auth/auth-gate';
import { DashboardShell } from '@/features/browser-shell/dashboard-shell';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppErrorBoundary } from '@/routes/error-boundary';
import NotFound from '@/routes/not-found';

const AccountInvitePage = lazy(() =>
  import('@/features/account/profile/invite-page').then((module) => ({
    default: module.AccountInvitePage,
  })),
);
const AccountProfilePage = lazy(() =>
  import('@/features/account/profile/page').then((module) => ({
    default: module.AccountProfilePage,
  })),
);
const PasswordSettingsCard = lazy(() =>
  import('@/features/account/profile/password-settings-card').then(
    (module) => ({
      default: module.PasswordSettingsCard,
    }),
  ),
);
const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((module) => ({
    default: module.LoginPage,
  })),
);
const CallbackPage = lazy(() =>
  import('@/features/auth/callback-page').then((module) => ({
    default: module.CallbackPage,
  })),
);
const TeamInvitePage = lazy(() =>
  import('@/features/auth/team-invite-page').then((module) => ({
    default: module.TeamInvitePage,
  })),
);
const BrowserAssetsPage = lazy(() =>
  import('@/features/browser/assets/page').then((module) => ({
    default: module.BrowserAssetsPage,
  })),
);
const RemoteEnvironmentsPage = lazy(() =>
  import('@/features/browser/environments').then((module) => ({
    default: module.RemoteEnvironmentsPage,
  })),
);
const RemoteMembersPage = lazy(() =>
  import('@/features/browser/organization/members').then((module) => ({
    default: module.RemoteMembersPage,
  })),
);
const RemotePermissionsPage = lazy(() =>
  import('@/features/browser/organization/permissions').then((module) => ({
    default: module.RemotePermissionsPage,
  })),
);
const RemoteRolesPage = lazy(() =>
  import('@/features/browser/organization/roles').then((module) => ({
    default: module.RemoteRolesPage,
  })),
);
const RemoteTeamsPage = lazy(() =>
  import('@/features/browser/organization/teams').then((module) => ({
    default: module.RemoteTeamsPage,
  })),
);
const RemoteProxiesPage = lazy(() =>
  import('@/features/browser/remote-proxies').then((module) => ({
    default: module.RemoteProxiesPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/features/browser/settings/page').then((module) => ({
    default: module.SettingsPage,
  })),
);

function DashboardRoute({ children }: React.PropsWithChildren) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}

function AccountRoute({ children }: React.PropsWithChildren) {
  return (
    <DashboardRoute>
      <AccountSettingsLayout>{children}</AccountSettingsLayout>
    </DashboardRoute>
  );
}

export function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<WorkspaceLoadingSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/team-invite" element={<TeamInvitePage />} />
          <Route
            path="/"
            element={
              <DashboardRoute>
                <RemoteEnvironmentsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/proxies"
            element={
              <DashboardRoute>
                <RemoteProxiesPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <DashboardRoute>
                <RemoteTeamsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/members"
            element={
              <DashboardRoute>
                <RemoteMembersPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <DashboardRoute>
                <RemoteRolesPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <DashboardRoute>
                <RemotePermissionsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/versions"
            element={
              <DashboardRoute>
                <BrowserAssetsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <DashboardRoute>
                <SettingsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/account"
            element={<Navigate to="/account/profile" replace />}
          />
          <Route
            path="/account/profile"
            element={
              <AccountRoute>
                <AccountProfilePage />
              </AccountRoute>
            }
          />
          <Route
            path="/account/password"
            element={
              <AccountRoute>
                <PasswordSettingsCard />
              </AccountRoute>
            }
          />
          <Route
            path="/account/invite"
            element={
              <AccountRoute>
                <AccountInvitePage />
              </AccountRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
