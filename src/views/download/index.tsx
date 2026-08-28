import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { AppDownloadCard } from '@/features/app-download/download-card';
import { isTauriRuntime } from '@/lib/desktop';
import { launchDesktopApp } from '@/lib/desktop/app-gate';
import { Link, Navigate } from 'react-router-dom';

const APP_ICON_SRC = '/pwa-512x512.png';

export default function DownloadPage() {
  if (isTauriRuntime()) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="bg-background text-foreground min-h-svh">
      <header className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={APP_ICON_SRC}
            alt=""
            className="size-8 shrink-0 rounded-md"
          />
          <span className="truncate text-sm font-semibold">One Browser</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggleButton />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">登录</Link>
          </Button>
          <Button type="button" size="sm" onClick={launchDesktopApp}>
            打开 One Browser
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <AppDownloadCard />
      </section>
    </main>
  );
}
