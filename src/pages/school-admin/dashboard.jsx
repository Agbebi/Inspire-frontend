import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  UserPlusIcon,
  PlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import API from "@/api/axios"

function getSchoolAuth() {
  try {
    const raw = localStorage.getItem("school_auth")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function SchoolAdminDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const auth = getSchoolAuth()
  const schoolName = auth?.user?.schoolName || auth?.user?.subDomain || "School"
  const adminName = auth?.user?.name || "Admin"

  const [stats, setStats] = useState([
    { icon: UsersIcon, label: "Students", value: "—" },
    { icon: GraduationCapIcon, label: "Teachers", value: "—" },
    { icon: BookOpenIcon, label: "Classes", value: "—" },
    { icon: ClipboardCheckIcon, label: "Results Published", value: "—" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const res = await API.get("/api/school/manage/dashboard/stats")
        const data = res.data?.data || {}
        setStats([
          { icon: UsersIcon, label: "Students", value: data.studentCount ?? 0 },
          { icon: GraduationCapIcon, label: "Teachers", value: data.teacherCount ?? 0 },
          { icon: BookOpenIcon, label: "Classes", value: data.classCount ?? 0 },
          { icon: ClipboardCheckIcon, label: "Results Published", value: data.resultCount ?? 0 },
        ])
      } catch {
        // keep placeholder values
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const quickActions = [
    { icon: UserPlusIcon, label: "Add Student", onClick: () => navigate(`/${slug}/admin/students`) },
    { icon: PlusIcon, label: "Add Teacher", onClick: () => navigate(`/${slug}/admin/teachers`) },
    { icon: BookOpenIcon, label: "Create Class", onClick: () => navigate(`/${slug}/admin/classes`) },
    { icon: ClipboardCheckIcon, label: "View Results", onClick: () => navigate(`/${slug}/admin/results`) },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {adminName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's an overview of {schoolName}.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-brand/10 text-brand dark:bg-brand/20">
              <stat.icon className="size-5" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold tracking-tight">
                {loading ? "…" : stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-medium">Quick Actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start gap-3"
                onClick={action.onClick}
              >
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium">Recent Activity</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Recent activity will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
