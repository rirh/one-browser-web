import { APP_NAME } from "@/app"
import { useLanguage } from "@/components/providers/language-context"

export function RouteLoading() {
  const { t } = useLanguage()

  return (
    <main className="fixed inset-0 z-50 flex min-h-svh items-center justify-center overflow-hidden bg-background px-6 py-8 text-foreground select-none">
      <section
        className="flex w-full max-w-80 flex-col items-center text-center"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          src="/pwa-512x512.png"
          alt={APP_NAME}
          className="size-16 rounded-[1.35rem] drop-shadow-[0_12px_20px_rgba(15,23,42,0.18)] select-none dark:drop-shadow-[0_14px_22px_rgba(0,0,0,0.4)]"
          draggable={false}
        />
        <p className="sweep-shine mt-5 max-w-full text-sm/6 font-medium tracking-normal text-muted-foreground">
          {t("common.loading")}
        </p>
      </section>
    </main>
  )
}
