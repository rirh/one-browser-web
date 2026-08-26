import { BrowserAssetsPage } from '@/features/browser/assets/page';
import { RemoteMembersPage } from '@/features/browser/organization/members';
import { RemotePermissionsPage } from '@/features/browser/organization/permissions';
import { RemoteRolesPage } from '@/features/browser/organization/roles';
import { RemoteTeamsPage } from '@/features/browser/organization/teams';
import { ProfilesPage } from '@/features/browser/profiles/page';
import { ProxiesPage } from '@/features/browser/proxies/page';
import { SettingsPage } from '@/features/browser/settings/page';

import { useBrowserShell } from './dashboard-shell';

export function ProfilesRoute() {
  const { search } = useBrowserShell();

  return <ProfilesPage search={search} />;
}

export function ProxiesRoute() {
  const { search } = useBrowserShell();

  return <ProxiesPage search={search} />;
}

export function TeamsRoute() {
  return <RemoteTeamsPage />;
}

export function MembersRoute() {
  return <RemoteMembersPage />;
}

export function RolesRoute() {
  return <RemoteRolesPage />;
}

export function PermissionsRoute() {
  return <RemotePermissionsPage />;
}

export function VersionsRoute() {
  return <BrowserAssetsPage />;
}

export function SettingsRoute() {
  return <SettingsPage />;
}
