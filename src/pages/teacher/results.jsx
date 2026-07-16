import { useEffect, useState, useMemo } from "react"
import { PencilIcon, TrashIcon, ClipboardCheckIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import { PageLoading } from "@/components/ui/loading"
import CycleSelector from "@/components/common/cycle-selector"
import { useCycle } from "@/components/common/use-cycle"
import API from "@/api/axios"
import { toast } from "sonner"

export default function TeacherResults() {
  const { selectedCycle, selectedCycleId, cycles } = useCycle()
  const isPublished = selectedCycle?.isPublished === true
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ studentId: "", classsId: "", subjectId: "", ca1: "", ca2: "", ca3: "", exam: "" })
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [caConfig, setCaConfig] = useState({ caCount: 3, caMaxScores: [10, 10, 20], examMaxScore: 70 })
  const [validationError, setValidationError] = useState("")

  const [classFilter, setClassFilter] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortDir, setSortDir] = useState("asc")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = {}
        if (selectedCycleId) params.cycleId = selectedCycleId
        const [rRes, cRes, sRes] = await Promise.all([
          API.get("/api/school/manage/teachers/me/results", { params }),
          API.get("/api/school/manage/teachers/me/classes"),
          API.get("/api/school/manage/settings"),
        ])
        setResults(rRes.data?.data || [])
        setClasses(cRes.data?.data || [])
        const settings = sRes.data?.data || {}
        const count = settings.caConfig?.caCount || 3
        setCaConfig({
          caCount: count,
          caMaxScores: settings.caConfig?.caMaxScores || (count === 2 ? [15, 15] : [10, 10, 20]),
          examMaxScore: settings.caConfig?.examMaxScore || 70,
        })
      } catch {
        setResults([])
        setClasses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCycleId])

  async function loadClasses() {
    try {
      const res = await API.get("/api/school/manage/teachers/me/classes")
      setClasses(res.data?.data || [])
    } catch {
      setClasses([])
    }
  }

  async function loadStudents(classId) {
    try {
      const res = await API.get(`/api/school/manage/teachers/me/classes/${classId}/students`)
      setStudents(res.data?.data || [])
    } catch {
      setStudents([])
    }
  }

  const availableStudents = useMemo(() => {
    if (!formData.classsId || !formData.subjectId || editingId) return students
    const recordedIds = new Set(
      results
        .filter((r) => String(r.classsId?._id) === String(formData.classsId) && String(r.subjectId?._id) === String(formData.subjectId))
        .map((r) => r.studentId?._id)
        .filter(Boolean)
    )
    return students.filter((s) => !recordedIds.has(s._id))
  }, [students, results, formData.classsId, formData.subjectId, editingId])

  function openAdd() {
    if (isPublished) {
      toast.error("This cycle is published and results cannot be added")
      return
    }
    if (!selectedCycleId) {
      toast.error("Select an academic cycle first")
      return
    }
    const cycleExists = (cycles || []).some((c) => c._id === selectedCycleId)
    if (!cycleExists) {
      toast.error("Selected cycle is no longer available. Please select a valid cycle.")
      return
    }
    setEditingId(null)
    setFormData({ studentId: "", classsId: "", subjectId: "", ca1: "", ca2: "", ca3: "", exam: "" })
    setValidationError("")
    setStudents([])
    loadClasses()
    setModalOpen(true)
  }

  function openEdit(result) {
    if (isPublished || result.cycleId?.isPublished) {
      toast.error("This cycle is published and results cannot be edited")
      return
    }
    setEditingId(result._id)
    setFormData({
      studentId: result.studentId?._id || "",
      classsId: result.classsId?._id || "",
      subjectId: result.subjectId?._id || "",
      ca1: result.ca1 ?? "",
      ca2: result.ca2 ?? "",
      ca3: result.ca3 ?? "",
      exam: result.exam ?? "",
    })
    setValidationError("")
    loadClasses().then(() => {
      if (result.classsId?._id) loadStudents(result.classsId._id)
    })
    setModalOpen(true)
  }

  function validateForm() {
    const caMaxScores = caConfig.caMaxScores || [10, 10, 20]
    const examMaxScore = caConfig.examMaxScore || 70
    const ca1 = formData.ca1 === "" ? 0 : Number(formData.ca1)
    const ca2 = formData.ca2 === "" ? 0 : Number(formData.ca2)
    const exam = formData.exam === "" ? 0 : Number(formData.exam)

    if (ca1 < 0 || ca1 > caMaxScores[0]) {
      return `CA1 must be between 0 and ${caMaxScores[0]}`
    }
    if (ca2 < 0 || ca2 > caMaxScores[1]) {
      return `CA2 must be between 0 and ${caMaxScores[1]}`
    }
    if (caConfig.caCount === 3) {
      const ca3 = formData.ca3 === "" ? 0 : Number(formData.ca3)
      if (ca3 < 0 || ca3 > (caMaxScores[2] || 20)) {
        return `CA3 must be between 0 and ${caMaxScores[2] || 20}`
      }
    }
    if (exam < 0 || exam > examMaxScore) {
      return `Exam must be between 0 and ${examMaxScore}`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const validation = validateForm()
    if (validation) {
      toast.error(validation)
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        studentId: formData.studentId,
        classsId: formData.classsId,
        subjectId: formData.subjectId,
        cycleId: selectedCycleId || undefined,
        ca1: formData.ca1 === "" ? null : Number(formData.ca1),
        ca2: formData.ca2 === "" ? null : Number(formData.ca2),
        exam: formData.exam === "" ? null : Number(formData.exam),
      }
      if (caConfig.caCount === 3) {
        payload.ca3 = formData.ca3 === "" ? null : Number(formData.ca3)
      }

      if (editingId) {
        await API.put(`/api/school/manage/teachers/me/results/${editingId}`, payload)
        toast.success("Result updated")
      } else {
        await API.post("/api/school/manage/teachers/me/results", payload)
        toast.success("Result added")
      }
      setModalOpen(false)
      const params = {}
      if (selectedCycleId) params.cycleId = selectedCycleId
      const res = await API.get("/api/school/manage/teachers/me/results", { params })
      setResults(res.data?.data || [])
    } catch (error) {
      const message = error?.response?.data?.message || (editingId ? "Failed to update result" : "Failed to add result")
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id, cyclePublished) {
    if (isPublished || cyclePublished) {
      return toast.error("This cycle is published and results cannot be deleted")
    }
    if (!window.confirm("Delete this result?")) return
    try {
      await API.delete(`/api/school/manage/teachers/me/results/${id}`)
      toast.success("Result deleted")
      setResults((p) => p.filter((r) => r._id !== id))
    } catch {
      toast.error("Failed to delete result")
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const uniqueClasses = useMemo(() => {
    const map = new Map()
    results.forEach((r) => {
      if (r.classsId?._id) map.set(r.classsId._id, r.classsId)
    })
    return Array.from(map.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [results])

  const uniqueSubjects = useMemo(() => {
    const map = new Map()
    results.forEach((r) => {
      if (r.subjectId?._id) map.set(r.subjectId._id, r.subjectId)
    })
    return Array.from(map.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [results])

  const filteredResults = useMemo(() => {
    let data = [...results]

    if (classFilter) {
      data = data.filter((r) => String(r.classsId?._id) === String(classFilter))
    }
    if (subjectFilter) {
      data = data.filter((r) => String(r.subjectId?._id) === String(subjectFilter))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      data = data.filter((r) => {
        const name = `${r.studentId?.firstName || ""} ${r.studentId?.lastName || ""}`.toLowerCase()
        return name.includes(q) || (r.studentId?.admissionNumber || "").toLowerCase().includes(q)
      })
    }

    if (sortField) {
      data.sort((a, b) => {
        let cmp = 0
        switch (sortField) {
          case "student":
            cmp = `${a.studentId?.firstName || ""} ${a.studentId?.lastName || ""}`.toLowerCase().localeCompare(`${b.studentId?.firstName || ""} ${b.studentId?.lastName || ""}`.toLowerCase())
            break
          case "class":
            cmp = `${a.classsId?.name || ""}${a.classsId?.arm || ""}`.toLowerCase().localeCompare(`${b.classsId?.name || ""}${b.classsId?.arm || ""}`.toLowerCase())
            break
          case "subject":
            cmp = (a.subjectId?.name || "").toLowerCase().localeCompare((b.subjectId?.name || "").toLowerCase())
            break
          case "total":
            cmp = (a.total ?? -1) - (b.total ?? -1)
            break
          case "grade":
            cmp = (a.grade || "").toLowerCase().localeCompare((b.grade || "").toLowerCase())
            break
          default:
            break
        }
        if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp

        const nameCmp = `${a.studentId?.firstName || ""} ${a.studentId?.lastName || ""}`.toLowerCase().localeCompare(`${b.studentId?.firstName || ""} ${b.studentId?.lastName || ""}`.toLowerCase())
        return sortDir === "asc" ? nameCmp : -nameCmp
      })
    } else {
      data.sort((a, b) => {
        const subjectCmp = (a.subjectId?.name || "").toLowerCase().localeCompare((b.subjectId?.name || "").toLowerCase())
        if (subjectCmp !== 0) return subjectCmp
        return `${a.studentId?.firstName || ""} ${a.studentId?.lastName || ""}`.toLowerCase().localeCompare(`${b.studentId?.firstName || ""} ${b.studentId?.lastName || ""}`.toLowerCase())
      })
    }

    return data
  }, [results, classFilter, subjectFilter, searchQuery, sortField, sortDir])

  const totalPossibleResults = useMemo(() => {
    return classes.reduce((sum, c) => {
      return sum + (c.studentCount || 0) * (c.subjects?.length || 0)
    }, 0)
  }, [classes])

  const resultsDone = results.length
  const resultsRemaining = Math.max(totalPossibleResults - resultsDone, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="text-sm text-muted-foreground">Manage results for your classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <CycleSelector />
          <Button onClick={openAdd} className="gap-2 w-full sm:w-auto" disabled={isPublished || !selectedCycleId}>
            <PlusIcon className="size-4" /> Add Result
          </Button>
          {isPublished && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LockIcon className="size-3.5" /> Published — editing locked
            </span>
          )}
          {!selectedCycleId && !isPublished && (
            <span className="text-xs text-muted-foreground">Select a cycle first</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Results Done</p>
          <p className="text-2xl font-bold">{resultsDone}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Results Remaining</p>
          <p className="text-2xl font-bold">{resultsRemaining}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="search">Search student</Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or admission no…"
          />
        </div>
        <div className="space-y-1.5 sm:w-48">
          <Label htmlFor="classFilter">Class</Label>
          <select
            id="classFilter"
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setSubjectFilter("") }}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
          >
            <option value="">All classes</option>
            {uniqueClasses.map((c) => (
              <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:w-48">
          <Label htmlFor="subjectFilter">Subject</Label>
          <select
            id="subjectFilter"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
          >
            <option value="">All subjects</option>
            {uniqueSubjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoading message="Loading results…" />
      ) : filteredResults.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ClipboardCheckIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No results found</h3>
          <p className="mt-1 text-sm text-muted-foreground">{resultsRemaining > 0 ? `${resultsRemaining} results still to record.` : "Try adjusting your filters or add a new result."}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header-brand border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("student")}>
                  <span className="inline-flex items-center gap-1">Student {sortField === "student" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("class")}>
                  <span className="inline-flex items-center gap-1">Class {sortField === "class" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("subject")}>
                  <span className="inline-flex items-center gap-1">Subject {sortField === "subject" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CA1</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CA2</th>
                {caConfig.caCount === 3 && (
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">CA3</th>
                )}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Exam</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("total")}>
                  <span className="inline-flex items-center gap-1">Total {sortField === "total" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("grade")}>
                  <span className="inline-flex items-center gap-1">Grade {sortField === "grade" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-border">
                {filteredResults.map((r) => (
                  <tr key={r._id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">
                      {r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.classsId?.name || "—"}{r.classsId?.arm ? ` ${r.classsId.arm}` : ""}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.subjectId?.name || "—"}</td>
                    <td className="px-4 py-3">{r.ca1 ?? "—"}</td>
                    <td className="px-4 py-3">{r.ca2 ?? "—"}</td>
                    {caConfig.caCount === 3 && (
                      <td className="px-4 py-3">{r.ca3 ?? "—"}</td>
                    )}
                    <td className="px-4 py-3">{r.exam ?? "—"}</td>
                    <td className="px-4 py-3">{r.total ?? "—"}</td>
                    <td className="px-4 py-3">{r.grade || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)} aria-label="Edit" disabled={isPublished || r.cycleId?.isPublished}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(r._id, r.cycleId?.isPublished)} aria-label="Delete" className="text-destructive hover:text-destructive" disabled={isPublished || r.cycleId?.isPublished}>
                          <TrashIcon className="size-4" />
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Result" : "Add Result"}
        subtitle={selectedCycle ? `${selectedCycle.session} — ${selectedCycle.term}` : ""}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="result-form" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save changes" : "Add Result"}
            </Button>
          </>
        }
      >
        <form id="result-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classsId">Class</Label>
            <select
              id="classsId"
              value={formData.classsId}
              onChange={(e) => { setFormData((p) => ({ ...p, classsId: e.target.value, studentId: "", subjectId: "" })); loadStudents(e.target.value) }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
              required
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectId">Subject</Label>
            <select
              id="subjectId"
              value={formData.subjectId}
              onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
              required
            >
              <option value="">Select subject</option>
              {[...new Set(classes.find((c) => String(c._id) === String(formData.classsId))?.subjects?.map((s) => s._id) || [])].map((id) => {
                const subj = classes.find((c) => String(c._id) === String(formData.classsId))?.subjects?.find((s) => String(s._id) === String(id))
                return <option key={id} value={id}>{subj?.name || id}</option>
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student</Label>
            <select
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData((p) => ({ ...p, studentId: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
              required
            >
              <option value="">Select student</option>
              {availableStudents.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
              ))}
            </select>
            {formData.classsId && formData.subjectId && availableStudents.length === 0 && students.length > 0 && (
              <p className="text-xs text-muted-foreground">All students already have results recorded for this class and subject.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ca1">CA1</Label>
              <Input id="ca1" type="number" value={formData.ca1} onChange={(e) => setFormData((p) => ({ ...p, ca1: e.target.value }))} placeholder="0" max={caConfig.caMaxScores[0]} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca2">CA2</Label>
              <Input id="ca2" type="number" value={formData.ca2} onChange={(e) => setFormData((p) => ({ ...p, ca2: e.target.value }))} placeholder="0" max={caConfig.caMaxScores[1]} min={0} />
            </div>
            {caConfig.caCount === 3 && (
              <div className="space-y-2">
                <Label htmlFor="ca3">CA3</Label>
                <Input id="ca3" type="number" value={formData.ca3} onChange={(e) => setFormData((p) => ({ ...p, ca3: e.target.value }))} placeholder="0" max={caConfig.caMaxScores[2] || 20} min={0} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="exam">Exam</Label>
              <Input id="exam" type="number" value={formData.exam} onChange={(e) => setFormData((p) => ({ ...p, exam: e.target.value }))} placeholder="0" max={caConfig.examMaxScore} min={0} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
