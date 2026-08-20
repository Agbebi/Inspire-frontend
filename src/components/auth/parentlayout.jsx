import { Outlet, Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useParentAuth } from "@/context/parent-auth"
import { useSocket } from "@/context/socket"
import { useState } from "react"
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  BellIcon,
  MessageSquareIcon,
  LogOutIcon,
  GraduationCapIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Zhipu } from '@thesvg/react'
import ParentNotificationDropdown from "@/components/common/parent-notification-dropdown"

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "" },
  { icon: BellIcon, label: "Notifications", href: "/notifications", badge: "unread" },
  { icon: MessageSquareIcon, label: "Messages", href: "/messages" },
]

export default function ParentLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { parentAuth, logout } = useParentAuth()
  const { unreadCount } = useSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const schoolName = parentAuth?.user?.schoolName || parentAuth?.user?.subDomain || "School"
  const parentName = parentAuth?.user?.name || "Parent"

  function handleLogout() {
    logout()
    toast.success("Logged out successfully")
    navigate(`/${slug}/parent/login`)
  }

  const initials = parentName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
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
        <div className="relative flex items-center gap-3 px-6 py-7">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[0_0_20px_var(--brand-glow)]">
            <GraduationCapIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
              {schoolName}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Parent Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-5 top-6 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent lg:hidden"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-4">
          {navItems.map((item) => {
            const to = `/${slug}/parent${item.href}`
            const isActive =
              item.href === ""
                ? location.pathname === `/${slug}/parent` || location.pathname === `/${slug}/parent/`
                : location.pathname === to
            const showBadge = item.badge === "unread" && unreadCount > 0
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
                <item.icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand text-[0.65rem] font-semibold text-brand-foreground">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{parentName}</p>
              <p className="truncate text-xs text-muted-foreground">Parent</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOutIcon className="size-[18px]" />
            Logout
          </button>
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
            <ParentNotificationDropdown />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
