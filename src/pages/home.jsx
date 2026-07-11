import { Link } from "react-router-dom"
import { GraduationCapIcon, BarChart3Icon, UsersIcon, ShieldCheckIcon, SearchIcon, GraduationCapIcon as StudentIcon, LayoutDashboardIcon as AdminIcon, BookOpenIcon as TeacherIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const features = [
  {
    icon: BarChart3Icon,
    title: "Insightful academic analytics",
    description: "Track performance with rich, auto-generated reports.",
  },
  {
    icon: UsersIcon,
    title: "Role-based access",
    description: "Tailored dashboards for admins, teachers and students.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure & tenant-isolated",
    description: "Every school runs in its own private, secure workspace.",
  },
  {
    icon: GraduationCapIcon,
    title: "Centralized result processing",
    description: "Create sessions, terms and classes in one place.",
  },
]

const portals = [
  {
    icon: SearchIcon,
    title: "Find Your School",
    description: "Search and access your school portal",
    href: "/auth/school/find",
    variant: "brand",
  },
  {
    icon: StudentIcon,
    title: "Student Portal",
    description: "View your results and academic records",
    href: "/auth/school/find",
    variant: "outline",
  },
  {
    icon: AdminIcon,
    title: "Admin Portal",
    description: "Manage school settings and users",
    href: "/auth/school/find",
    variant: "outline",
  },
  {
    icon: TeacherIcon,
    title: "Teacher Portal",
    description: "Record and manage student results",
    href: "/auth/school/find",
    variant: "outline",
  },
  {
    icon: ShieldCheckIcon,
    title: "Super Admin",
    description: "Platform administration access",
    href: "/auth/superadmin/login",
    variant: "outline",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCapIcon className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Inspire</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        <section className="space-y-6 px-4 py-12 lg:px-6 lg:py-20">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Empowering schools with{" "}
              <span className="text-brand">effortless</span> result management
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The all-in-one platform for schools to manage results, track performance, and publish report cards with clarity and confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link className="flex items-center flex-row gap-2" to="/auth/school/find">
                  <SearchIcon className="size-4" />
                  <span>Find Your School</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 lg:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-brand">
                    <feature.icon className="size-5" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 lg:px-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Access Your Portal</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your role below to get started
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {portals.map((portal) => (
                <Link
                  key={portal.title}
                  to={portal.href}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50 group"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-brand transition-colors">
                    <portal.icon className="size-5" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium">{portal.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {portal.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Inspire. All rights reserved.</p>
          <p>Built for schools that value clarity and confidence.</p>
        </div>
      </footer>
    </div>
  )
}
