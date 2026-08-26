import { ProxiesPageContent } from './components/proxies-page-content';

export function ProxiesPage({ search }: { search: string }) {
  return <ProxiesPageContent search={search} />;
}
