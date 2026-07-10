import { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BookOpenIcon, UsersIcon, ClipboardCheckIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/loading"
import API from "@/api/axios"

export default function TeacherDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
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
          API.get("/api/school/manage/teachers/me/results"),
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
  }, [])

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
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Unable to load teacher profile.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {teacher.name}</h1>
        <p className="text-sm text-muted-foreground">{teacher.email}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedClasses || 0}</div>
            <p className="text-xs text-muted-foreground">Classes assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpenIcon className="size-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedSubjects || 0}</div>
            <p className="text-xs text-muted-foreground">Subjects you teach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UsersIcon className="size-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Across your classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Done</CardTitle>
            <ClipboardCheckIcon className="size-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResults || 0}</div>
            <p className="text-xs text-muted-foreground">Results recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/${slug}/teacher/classes/${c._id}`)}
                  >
                    <span className="font-medium">
                      {c.name}{c.arm ? ` ${c.arm}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.studentCount || 0} students</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {(teacher.assignedSubjects || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...new Map((teacher.assignedSubjects || []).map((a) => [a.subjectId, a.subjectId])).keys()].map((subjectId) => {
                  const subject = (teacher.assignedSubjects || []).find((a) => a.subjectId === subjectId)?.subjectId
                  const subjectName = typeof subject === 'object' ? subject?.name : null
                  return (
                    <span
                      key={subjectId}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {subjectName || "Unknown"}
                    </span>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
