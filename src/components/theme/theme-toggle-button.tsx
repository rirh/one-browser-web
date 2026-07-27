"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { type MouseEvent } from "react"

import { useTranslation } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useTheme } from "./provider"
import {
  type ThemeName,
  applyThemeToRoot,
  getDomTheme,
  resolveThemeName,
} from "./shared"

type ViewTransition = {
  ready: Promise<void>
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => ViewTransition
}

type ThemeToggleButtonProps = {
  className?: string
  label?: string
}

const THEME_TOGGLE_VIEW_TRANSITION_CSS = `
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  ::view-transition-old(root) {
    z-index: 1;
  }

  ::view-transition-new(root) {
    z-index: 2147483646;
  }

  .dark::view-transition-old(root) {
    z-index: 2147483646;
  }

  .dark::view-transition-new(root) {
    z-index: 1;
  }
`

function ThemeToggleViewTransitionStyles() {
  return <style>{THEME_TOGGLE_VIEW_TRANSITION_CSS}</style>
}

export function ThemeToggleButton({
  className,
  label,
}: ThemeToggleButtonProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useTranslation()
  const accessibleLabel = label ?? t("theme.toggle")

  function updateTheme(nextTheme: ThemeName) {
    applyThemeToRoot(nextTheme)
    setTheme(nextTheme)
  }

  function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    const currentTheme = resolveThemeName(resolvedTheme) || getDomTheme()
    const nextTheme: ThemeName = currentTheme === "dark" ? "light" : "dark"
    const transitionDocument = document as DocumentWithViewTransition
    const supportsTransition =
      typeof transitionDocument.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!supportsTransition) {
      updateTheme(nextTheme)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )
    const ratioX = (100 * x) / window.innerWidth
    const ratioY = (100 * y) / window.innerHeight
    const referenceRadius =
      Math.hypot(window.innerWidth, window.innerHeight) / Math.SQRT2
    const ratioRadius = (100 * endRadius) / referenceRadius

    const transition = transitionDocument.startViewTransition(() => {
      updateTheme(nextTheme)
    })

    void transition.ready
      .then(() => {
        const clipPath = [
          `circle(0% at ${ratioX}% ${ratioY}%)`,
          `circle(${ratioRadius}% at ${ratioX}% ${ratioY}%)`,
        ]

        document.documentElement.animate(
          {
            clipPath: nextTheme === "dark" ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 400,
            easing: "ease-in",
            fill: "both",
            pseudoElement:
              nextTheme === "dark"
                ? "::view-transition-old(root)"
                : "::view-transition-new(root)",
          }
        )
      })
      .catch(() => undefined)
  }

  return (
    <>
      <ThemeToggleViewTransitionStyles />
      <Button
        aria-label={accessibleLabel}
        className={cn(
          "shrink-0 border-border/60 bg-muted/70 text-foreground shadow-none hover:bg-muted dark:bg-muted/50 dark:hover:bg-muted/70",
          className
        )}
        onClick={handleToggle}
        size="icon-sm"
        title={accessibleLabel}
        variant="outline"
      >
        <MoonIcon aria-hidden="true" strokeWidth={2} className="dark:hidden" />
        <SunIcon
          aria-hidden="true"
          strokeWidth={2}
          className="hidden dark:block"
        />
      </Button>
    </>
  )
}
