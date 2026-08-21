import { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BookOpenIcon, UsersIcon, ClipboardCheckIcon, ArrowRightIcon } from "lucide-react"

import { PageLoading } from "@/components/ui/loading"
import API from "@/api/axios"
import { useCycle } from "@/components/common/use-cycle"

export default function TeacherDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { selectedCycleId } = useCycle()
  const [teacher, setTeacher] = useState(null)
  const [classes, setClasses] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [tRes, cRes, rRes] = await Promise.all([
          API.get("/api/school/manage/teachers/me"),
          API.get("/api/school/manage/teachers/me/classes"),
          API.get("/api/school/manage/teachers/me/results", { params: selectedCycleId ? { cycleId: selectedCycleId } : {} }),
        ])
        setTeacher(tRes.data?.data || null)
        setClasses(cRes.data?.data || [])
        setResults(rRes.data?.data || [])
      } catch {
        setTeacher(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCycleId])

  const stats = useMemo(() => {
    if (!teacher) return null
    const assignedClasses = classes.length
    const assignedSubjects = new Set((teacher.assignedSubjects || []).map((a) => a.subjectId)).size
    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
    const totalResults = results.length
    return { assignedClasses, assignedSubjects, totalStudents, totalResults }
  }, [teacher, classes, results])

  if (loading) {
    return <PageLoading message="Loading dashboard…" />
  }

  if (!teacher) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Unable to load teacher profile.</p>
        </div>
      </div>
    )
  }

  if (!selectedCycleId) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Please select an academic cycle to view results.</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: BookOpenIcon, label: "My Classes", value: stats?.assignedClasses || 0, hint: "Classes assigned to you" },
    { icon: BookOpenIcon, label: "Subjects", value: stats?.assignedSubjects || 0, hint: "Subjects you teach" },
    { icon: UsersIcon, label: "Students", value: stats?.totalStudents || 0, hint: "Across your classes" },
    { icon: ClipboardCheckIcon, label: "Results Done", value: stats?.totalResults || 0, hint: "Results recorded" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Teacher Portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
            Welcome back, {teacher.name}
          </h1>
          <p className="text-base text-muted-foreground">{teacher.email}</p>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105 dark:bg-brand/15">
              <stat.icon className="size-[18px]" />
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="text-[0.8rem] text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/80">{stat.hint}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-foreground">Assigned Classes</h2>
              <p className="text-[0.8rem] text-muted-foreground">Jump into a class to view its students.</p>
            </div>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </div>

          {classes.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No classes assigned yet.</p>
          ) : (
            <div className="mt-6 space-y-2.5">
              {classes.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => navigate(`/${slug}/teacher/classes/${c._id}`)}
                  className="group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-all duration-200 hover:border-brand/20 hover:bg-muted/40"
                >
                  <span className="text-sm font-medium text-foreground">
                    {c.name}{c.arm ? ` ${c.arm}` : ""}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {c.studentCount || 0} students
                    <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Assigned Subjects</h2>
            <p className="text-[0.8rem] text-muted-foreground">Subjects you are scheduled to teach.</p>
          </div>

          {(teacher.assignedSubjects || []).length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No subjects assigned yet.</p>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {[...new Map((teacher.assignedSubjects || []).map((a) => [a.subjectId, a.subjectId])).keys()].map((subjectId) => {
                const subject = (teacher.assignedSubjects || []).find((a) => a.subjectId === subjectId)?.subjectId
                const subjectName = typeof subject === 'object' ? subject?.name : null
                return (
                  <span
                    key={subjectId}
                    className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand dark:bg-brand/15"
                  >
                    {subjectName || "Unknown"}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
