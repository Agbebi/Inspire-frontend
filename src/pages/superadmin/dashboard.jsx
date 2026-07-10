import { useSelector } from "react-redux"
import { UsersIcon, SchoolIcon, BookOpenIcon, TrendingUpIcon } from "lucide-react"

const stats = [
  { icon: SchoolIcon, label: "Total Schools", value: "12", change: "+2 this month" },
  { icon: UsersIcon, label: "Active Users", value: "1,284", change: "+18% this week" },
  { icon: BookOpenIcon, label: "Classes", value: "86", change: "Across all schools" },
  { icon: TrendingUpIcon, label: "Engagement", value: "94%", change: "+5% improvement" },
]

export default function SuperAdminDashboard() {
  const user = useSelector((state) => state.superadmin.user)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening across your platform.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                <stat.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/80">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Activity feed coming soon...
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Quick actions coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
