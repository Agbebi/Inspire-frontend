"use client"

import { useTheme } from "next-themes"
import { SunIcon, MoonIcon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-input bg-muted transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        className="flex size-5 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform duration-300 ease-in-out"
        style={{ transform: isDark ? "translateX(1.5rem)" : "translateX(0.125rem)" }}
      >
        {isDark ? (
          <MoonIcon className="size-3.5" />
        ) : (
          <SunIcon className="size-3.5" />
        )}
      </span>
    </button>
  )
}
