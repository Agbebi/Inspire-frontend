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
    { icon: UserPlusIcon, label: "Add Student", description: "Enroll a new learner", onClick: () => navigate(`/${slug}/admin/students`) },
    { icon: PlusIcon, label: "Add Teacher", description: "Invite a staff member", onClick: () => navigate(`/${slug}/admin/teachers`) },
    { icon: BookOpenIcon, label: "Create Class", description: "Set up a new class", onClick: () => navigate(`/${slug}/admin/classes`) },
    { icon: ClipboardCheckIcon, label: "View Results", description: "Review published results", onClick: () => navigate(`/${slug}/admin/results`) },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
            Welcome back, {adminName}
          </h1>
          <p className="text-base text-muted-foreground">
            Here&apos;s what&apos;s happening at {schoolName} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl px-4 py-2.5">
            This term
          </Button>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105 dark:bg-brand/15">
              <stat.icon className="size-[18px]" />
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {loading ? "…" : stat.value}
              </p>
              <p className="text-[0.8rem] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Quick Actions
            </h2>
            <p className="text-[0.8rem] text-muted-foreground">
              Common tasks to keep your school running smoothly.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto justify-start gap-3 rounded-xl px-3.5 py-3.5 text-left"
                onClick={action.onClick}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/15">
                  <action.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.8rem] font-semibold text-foreground">
                    {action.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Recent Activity
            </h2>
            <p className="text-[0.8rem] text-muted-foreground">
              A live feed of recent changes across your school.
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ClipboardCheckIcon className="size-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No activity yet
            </p>
            <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
              Your recent actions will appear here as they happen.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
