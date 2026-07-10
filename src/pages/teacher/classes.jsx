import { useEffect, useState } from "react"
import { BookOpenIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import Modal from "@/components/common/modal"
import { PageLoading, CardLoading } from "@/components/ui/loading"
import API from "@/api/axios"

export default function TeacherClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)

  useEffect(() => {
    async function loadClasses() {
      setLoading(true)
      try {
        const res = await API.get("/api/school/manage/teachers/me/classes")
        setClasses(res.data?.data || [])
      } catch {
        setClasses([])
      } finally {
        setLoading(false)
      }
    }
    loadClasses()
  }, [])

  function openStudents(klass) {
    setSelectedClass(klass)
    setStudentsOpen(true)
    loadStudents(klass._id)
  }

  async function loadStudents(classId) {
    setStudentsLoading(true)
    try {
      const res = await API.get(`/api/school/manage/teachers/me/classes/${classId}/students`)
      setStudents(res.data?.data || [])
    } catch {
      setStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Classes</h1>
        <p className="text-sm text-muted-foreground">Classes assigned to you and their students.</p>
      </div>

      {loading ? (
        <PageLoading message="Loading classes…" />
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookOpenIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No classes assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">Contact an admin to get classes assigned to you.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Students</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {classes.map((klass) => (
                <tr key={klass._id} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{klass.name}{klass.arm ? ` ${klass.arm}` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{klass.studentCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openStudents(klass)} className="gap-1.5">
                        <UsersIcon className="size-4" /> Students
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={studentsOpen}
        onClose={() => { setStudentsOpen(false); setSelectedClass(null) }}
        title={selectedClass ? `Students — ${selectedClass.name}${selectedClass.arm ? " " + selectedClass.arm : ""}` : "Students"}
        footer={
          <Button type="button" variant="outline" onClick={() => { setStudentsOpen(false); setSelectedClass(null) }}>Close</Button>
        }
      >
        {studentsLoading ? (
          <CardLoading message="Loading students…" />
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students found in this class.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {students.map((student) => (
              <div key={student._id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-muted-foreground">{student.admissionNumber}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${student.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                  {student.status || "active"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
