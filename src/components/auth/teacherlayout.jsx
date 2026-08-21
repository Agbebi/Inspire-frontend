import { Outlet, Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CycleProvider } from "@/components/common/cycle-provider"
import { useState, useEffect } from "react"
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  LogOutIcon,
  SchoolIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Zhipu } from '@thesvg/react'
import NotificationDropdown from "@/components/common/notification-dropdown"
import API from "@/api/axios"

const navGroups = [
  {
    label: "General",
    items: [
      { icon: LayoutDashboardIcon, label: "Dashboard", href: "" },
    ],
  },
  {
    label: "Teaching",
    items: [
      { icon: BookOpenIcon, label: "My Classes", href: "/classes" },
      { icon: ClipboardCheckIcon, label: "Results", href: "/results" },
    ],
  },
]

export default function TeacherLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teacherName, setTeacherName] = useState(null)

  const schoolName = (() => {
    try {
      const raw = localStorage.getItem("school_auth")
      if (raw) {
        const auth = JSON.parse(raw)
        return auth?.user?.schoolName || auth?.user?.subDomain || slug
      }
    } catch {
      // ignore
    }
    return slug
  })()

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await API.get("/api/school/manage/teachers/me")
        setTeacherName(res.data?.data?.name || null)
      } catch {
        // keep null
      }
    }
    loadTeacher()
  }, [])

  const displayName = teacherName || "Teacher"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  function handleLogout() {
    localStorage.removeItem("school_auth")
    toast.success("Logged out successfully")
    navigate(`/auth/school/${slug}/login`)
  }

  return (
    <CycleProvider>
      <div className="flex h-svh">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:static lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex h-full flex-col">
            <div className="relative flex items-center gap-3 px-6 py-7">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[0_0_20px_var(--brand-glow)]">
                <SchoolIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
                  {schoolName}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Teacher Portal
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-5 top-6 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent lg:hidden"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const to = `/${slug}/teacher${item.href}`
                      const isActive = location.pathname === to
                      return (
                        <Link
                          key={item.label}
                          to={to}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-brand/10 text-brand brand-ring dark:bg-brand/15"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          }`}
                        >
                          <item.icon
                            className={`size-[18px] transition-transform duration-200 group-hover:scale-105 ${
                              isActive ? "text-brand" : ""
                            }`}
                          />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="space-y-3 border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Teacher
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOutIcon className="size-[18px]" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border px-5 py-4 lg:px-10 lg:py-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <MenuIcon className="size-5" />
              </button>
              <span className="hidden text-sm font-semibold tracking-tight text-brand items-center gap-2 sm:flex">
                <Zhipu className="size-5" />
                Craftie
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <NotificationDropdown />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </CycleProvider>
  )
}
