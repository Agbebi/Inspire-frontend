import { Outlet, Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState } from "react"
import { MenuIcon, XIcon, LayoutDashboardIcon, SchoolIcon, UsersIcon, SettingsIcon, LogOutIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { logout } from "@/store/superadmin/index"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "/superadmin/dashboard" },
  { icon: SchoolIcon, label: "Schools", href: "/superadmin/schools" },
  { icon: UsersIcon, label: "Users", href: "/superadmin/users" },
  { icon: SettingsIcon, label: "Settings", href: "/superadmin/settings" },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    toast.success("Logged out successfully")
    navigate("/auth/superadmin/login")
  }

  return (
    <div className="flex h-svh">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboardIcon className="size-4" />
              </div>
              <span className="font-semibold tracking-tight">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <MenuIcon className="size-5" />
          </button>
          <span className="text-sm font-semibold tracking-tight text-brand">Inspire</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
