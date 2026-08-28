import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-4">
      <title>页面出现问题 · One Browser</title>
      <section className="bg-card flex w-full max-w-md flex-col items-center rounded-2xl p-6 text-center sm:p-8">
        <img
          src="/pwa-512x512.png"
          alt="One Browser"
          className="size-12 rounded-xl"
        />
        <h1 className="mt-4 text-xl font-semibold">页面出现问题</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          页面暂时无法正常显示，可以重试或返回首页。
        </p>
        <div className="bg-muted text-muted-foreground mt-4 w-full rounded-lg px-3 py-2 text-left text-xs break-words">
          {error.message || '未知错误'}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Button type="button" variant="outline" onClick={reset}>
            重试
          </Button>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
