import { Outlet, Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CycleProvider } from "@/components/common/cycle-provider"
import { useState, useEffect } from "react"
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  SettingsIcon,
  LogOutIcon,
  SchoolIcon,
  CalendarIcon,
  BarChart3Icon,
} from "lucide-react"
import { toast } from "sonner"

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", href: "" },
  { icon: UsersIcon, label: "Students", href: "/students" },
  { icon: GraduationCapIcon, label: "Teachers", href: "/teachers" },
  { icon: BookOpenIcon, label: "Classes", href: "/classes" },
  { icon: BookOpenIcon, label: "Subjects", href: "/subjects" },
  { icon: ClipboardCheckIcon, label: "Results", href: "/results" },
  { icon: CalendarIcon, label: "Academic Cycles", href: "/cycles" },
  { icon: GraduationCapIcon, label: "Promote Students", href: "/promote" },
  { icon: BarChart3Icon, label: "Analytics", href: "/analytics" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
]

export default function SchoolAdminLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [schoolName, setSchoolName] = useState(slug)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("school_auth")
      if (raw) {
        const auth = JSON.parse(raw)
        setSchoolName(auth?.user?.schoolName || auth?.user?.subDomain || slug)
      }
    } catch {
      // ignore
    }
  }, [slug])

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
          fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="relative border-b border-border px-4 py-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <XIcon className="size-4" />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-2 pt-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <SchoolIcon className="size-5" />
              </div>
              <span className="max-w-[10rem] truncate text-center text-base font-semibold tracking-tight">
                {schoolName}
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const to = `/${slug}/admin${item.href}`
              const isActive = location.pathname === to
              return (
                <Link
                  key={item.label}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-foreground shadow-[0_0_8px_rgba(0,0,0,0.08)] dark:shadow-[0_0_8px_rgba(255,255,255,0.12)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-[0_0_8px_rgba(239,68,68,0.15)]"
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

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
    </CycleProvider>
  )
}
