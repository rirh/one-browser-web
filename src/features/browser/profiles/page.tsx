import { ProfilesPageContent } from './components/profiles-page-content';

export function ProfilesPage({ search }: { search: string }) {
  return <ProfilesPageContent search={search} />;
}
