import { AppDownloadCard } from '@/features/app-download/download-card';

export default function DownloadPage() {
  return (
    <main className="bg-background flex min-h-dvh items-center justify-center p-4 sm:p-8">
      <AppDownloadCard className="w-full max-w-2xl" />
    </main>
  );
}
