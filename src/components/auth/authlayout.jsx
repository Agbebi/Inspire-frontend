import {
  GraduationCap,
  BarChart3,
  Users,
  ShieldCheck,
} from "lucide-react"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"
import { Outlet } from "react-router-dom"

const features = [
  {
    icon: GraduationCap,
    title: "Centralized result processing",
    description: "Create sessions, terms and classes in one place.",
  },
  {
    icon: BarChart3,
    title: "Insightful academic analytics",
    description: "Track performance with rich, auto-generated reports.",
  },
  {
    icon: Users,
    title: "Role-based access",
    description: "Tailored dashboards for admins, teachers and students.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & tenant-isolated",
    description: "Every school runs in its own private, secure workspace.",
  },
]

export default function AuthLayout({
  brandName = "Inspire",
  tagline = "The all-in-one platform for effortless school result management.",
}) {
  return (
    <div className="h-svh p-2">

    <div className="grid h-full overflow-y-scroll rounded-2xl lg:border glow-border lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <div className="relative hidden overflow-hidden rounded-l-2xl border border-white/10 bg-gray-950 lg:block">
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-white/[0.06] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8 xl:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              {brandName}
            </span>
          </div>

          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              School result management
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance text-white">
              Empowering schools with effortless result management
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {tagline}
            </p>

            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="flex items-center gap-4 py-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400">
                    <feature.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            Trusted by schools to manage results with clarity and confidence.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-between gap-4 p-5 md:p-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-semibold tracking-tight">{brandName}</span>
          </div>
          <div className={cn("ml-auto")}>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-6 md:px-10">
            <div className="w-full max-w-sm rounded-2xl border bg-card/40 p-6 backdrop-blur glow-border">
            {<Outlet />}
          </div>
        </main>

        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground md:px-10">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </footer>
      </div>
    </div>
    </div>
  )
}
