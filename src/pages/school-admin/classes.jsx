import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon, SchoolIcon, EyeIcon, BookOpenIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageLoading } from "@/components/ui/loading"
import Modal from "@/components/common/modal"
import {
    fetchClasses,
    addClass,
    updateClass,
    deleteClass,
    clearClassError,
    resetClassSuccess,
} from "@/store/admin/classSlice"
import { fetchSubjects } from "@/store/admin/subjectSlice"
import { fetchStudents } from "@/store/admin/studentSlice"

const emptyForm = { name: "", arm: "", subjects: [] }

function SubjectChips({ subjects, field = "code", max = 3 }) {
    const allSubjects = useSelector((state) => state.subject.items)
    const subjectMap = useMemo(() => {
        const map = {}
        allSubjects.forEach((s) => { map[s._id] = s })
        return map
    }, [allSubjects])

    const list = (subjects || []).map((s) => {
        const id = typeof s === "object" ? s._id : s
        const found = subjectMap[id]
        if (!found) return null
        return field === "name" ? found.name : found.code
    }).filter(Boolean)

    if (list.length === 0) {
        return <span className="text-muted-foreground">—</span>
    }

    const shown = list.slice(0, max)
    const extra = list.length - shown.length

    return (
        <span className="flex flex-wrap items-center gap-1">
            {shown.map((name, i) => (
                <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                    {name}
                </span>
            ))}
            {extra > 0 && (
                <span className="text-xs text-muted-foreground">+{extra}</span>
            )}
        </span>
    )
}

export default function Classes() {
    const dispatch = useDispatch()
    const { items, loading, error, success } = useSelector((state) => state.class)
    const subjects = useSelector((state) => state.subject.items)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })

    const [viewOpen, setViewOpen] = useState(false)
    const [viewClass, setViewClass] = useState(null)

    const [subjectsOpen, setSubjectsOpen] = useState(false)
    const [subjectsClass, setSubjectsClass] = useState(null)
    const [selectedSubjects, setSelectedSubjects] = useState([])
    const [savingSubjects, setSavingSubjects] = useState(false)

    useEffect(() => { dispatch(fetchClasses()); dispatch(fetchSubjects()) }, [dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearClassError()) }
        if (success) {
            toast.success(editingId ? "Class updated" : "Class added")
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            dispatch(resetClassSuccess())
        }
    }, [error, success, dispatch, editingId])

    function openAdd() {
        setEditingId(null)
        setFormData({ ...emptyForm })
        setModalOpen(true)
    }

    function openEdit(klass) {
        setEditingId(klass._id)
        setFormData({
            name: klass.name || "",
            arm: klass.arm || "",
            subjects: (klass.subjects || []).map((s) => (typeof s === "object" ? s._id : s)),
        })
        setModalOpen(true)
    }

    function handleDelete(id) {
        if (window.confirm("Delete this class? Students in it will be unassigned.")) {
            dispatch(deleteClass(id))
        }
    }

    function toggleSubject(id) {
        setFormData((p) => ({
            ...p,
            subjects: p.subjects.includes(id)
                ? p.subjects.filter((s) => s !== id)
                : [...p.subjects, id],
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editingId) {
                await dispatch(updateClass({ id: editingId, data: formData })).unwrap()
            } else {
                await dispatch(addClass(formData)).unwrap()
            }
        } catch {
            toast.error(editingId ? "Failed to update class" : "Failed to add class")
        }
    }

    function openView(klass) {
        setViewClass(klass)
        dispatch(fetchStudents())
        setViewOpen(true)
    }

    function openSubjects(klass) {
        setSubjectsClass(klass)
        setSelectedSubjects((klass.subjects || []).map((s) => (typeof s === "object" ? s._id : s)))
        setSubjectsOpen(true)
    }

    function toggleSubjectForClass(id) {
        setSelectedSubjects((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
    }

    async function handleSaveSubjects() {
        if (!subjectsClass) return
        setSavingSubjects(true)
        try {
            await dispatch(updateClass({ id: subjectsClass._id, data: { subjects: selectedSubjects } })).unwrap()
            toast.success("Class subjects updated")
            setSubjectsOpen(false)
        } catch {
            toast.error("Failed to update class subjects")
        } finally {
            setSavingSubjects(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
                    <p className="text-sm text-muted-foreground">Create classes, assign subjects, and view enrolled students.</p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Class
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <SchoolIcon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium">No classes yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add your first class to get started.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="table-header-brand border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subjects</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Students</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((klass) => (
                                <tr key={klass._id} className="transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{klass.name}{klass.arm ? ` ${klass.arm}` : ""}</td>
                                    <td className="px-4 py-3">
                                        <SubjectChips subjects={klass.subjects} />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{klass.studentCount || 0}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openView(klass)} className="gap-1.5">
                                                <EyeIcon className="size-4" /> View
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openSubjects(klass)} className="gap-1.5">
                                                <BookOpenIcon className="size-4" /> Subjects
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(klass)} aria-label="Edit">
                                                <PencilIcon className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(klass._id)} aria-label="Delete" className="text-destructive hover:text-destructive">
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
                onClose={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }) }}
                title={editingId ? "Edit Class" : "Add Class"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }) }}>
                            Cancel
                        </Button>
                        <Button type="submit" form="class-form" disabled={loading}>
                            {loading ? "Saving…" : editingId ? "Save changes" : "Add Class"}
                        </Button>
                    </>
                }
            >
                <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Class name</Label>
                            <Input id="name" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="JSS 1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="arm">Arm</Label>
                            <Input id="arm" value={formData.arm} onChange={(e) => setFormData((p) => ({ ...p, arm: e.target.value }))} placeholder="A" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Subjects</Label>
                        {subjects.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Add subjects first to attach them to a class.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {subjects.map((s) => (
                                    <label key={s._id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={formData.subjects.includes(s._id)}
                                            onChange={() => toggleSubject(s._id)}
                                            className="size-4"
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            <Modal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                title={viewClass ? `Students — ${viewClass.name}${viewClass.arm ? " " + viewClass.arm : ""}` : "Students"}
                footer={
                    <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                }
            >
                <ClassStudents klass={viewClass} />
            </Modal>

            <Modal
                open={subjectsOpen}
                onClose={() => setSubjectsOpen(false)}
                title={subjectsClass ? `Subjects — ${subjectsClass.name}${subjectsClass.arm ? " " + subjectsClass.arm : ""}` : "Subjects"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => setSubjectsOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSaveSubjects} disabled={savingSubjects}>
                            {savingSubjects ? "Saving…" : "Save subjects"}
                        </Button>
                    </>
                }
            >
                {subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects found. Create subjects in the Subjects section first.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {subjects.map((s) => (
                            <label key={s._id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedSubjects.includes(s._id)}
                                    onChange={() => toggleSubjectForClass(s._id)}
                                    className="size-4"
                                />
                                {s.name}
                            </label>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    )
}

function ClassStudents({ klass }) {
    const { items, loading } = useSelector((state) => state.student)

    if (!klass) return null

    if (loading && items.length === 0) {
        return <PageLoading message="Loading students…" />
    }

    const students = items.filter(
        (s) => (s.currentClassId?._id || s.currentClassId) === klass._id
    )

    if (students.length === 0) {
        return <p className="text-sm text-muted-foreground">No students are enrolled in this class yet.</p>
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subjects offered
                </p>
                <SubjectChips subjects={klass.subjects} field="name" max={99} />
            </div>

                    <div className="max-h-96 space-y-3 overflow-y-auto">
                {students.map((student) => (
                    <div key={student._id} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">
                                    {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{student.admissionNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground">{student.accessPin || "—"}</span>
                                {student.accessPin && (
                                    <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => { navigator.clipboard.writeText(student.accessPin); toast.success("PIN copied") }}>
                                        <CopyIcon className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
