import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon, BookUserIcon, EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import {
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    clearTeacherError,
    resetTeacherSuccess,
} from "@/store/admin/teacherSlice"
import { fetchClasses } from "@/store/admin/classSlice"
import { fetchSubjects } from "@/store/admin/subjectSlice"

const emptyForm = { name: "", email: "", password: "" }

export default function Teachers() {
    const dispatch = useDispatch()
    const { items, loading, error } = useSelector((state) => state.teacher)
    const classes = useSelector((state) => state.class.items)
    const subjects = useSelector((state) => state.subject.items)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })
    const [assignments, setAssignments] = useState([])

    const [viewOpen, setViewOpen] = useState(false)
    const [viewTeacher, setViewTeacher] = useState(null)

    useEffect(() => {
        dispatch(fetchTeachers())
        dispatch(fetchClasses())
        dispatch(fetchSubjects())
    }, [dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearTeacherError()) }
    }, [error, dispatch])

    function openAdd() {
        setEditingId(null)
        setFormData({ ...emptyForm })
        setAssignments([])
        setModalOpen(true)
    }

    function openEdit(teacher) {
        setEditingId(teacher._id)
        setFormData({ name: teacher.name || "", email: teacher.email || "", password: "" })
        setAssignments((teacher.assignedSubjects || []).map((a) => ({ classId: a.classId, subjectId: a.subjectId })))
        setModalOpen(true)
    }

    function openView(teacher) {
        setViewTeacher(teacher)
        setViewOpen(true)
    }

    function handleDelete(id) {
        if (window.confirm("Remove this teacher?")) {
            dispatch(deleteTeacher(id))
        }
    }

    function addAssignmentRow() {
        setAssignments((p) => [...p, { classId: "", subjectId: "" }])
    }

    function updateAssignmentRow(index, field, value) {
        setAssignments((p) => p.map((a, i) => (i === index ? { ...a, [field]: value } : a)))
    }

    function removeAssignmentRow(index) {
        setAssignments((p) => p.filter((_, i) => i !== index))
    }

    function buildAssignedSubjects() {
        const seen = new Set()
        const result = []
        assignments.forEach((a) => {
            if (!a.classId || !a.subjectId) return
            const key = `${a.classId}-${a.subjectId}`
            if (seen.has(key)) return
            seen.add(key)
            result.push({ classId: a.classId, subjectId: a.subjectId })
        })
        return result
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const assignedSubjects = buildAssignedSubjects()
        const payload = { name: formData.name, email: formData.email, assignedSubjects }
        if (!editingId || formData.password) payload.password = formData.password
        try {
            if (editingId) {
                await dispatch(updateTeacher({ id: editingId, data: payload })).unwrap()
                toast.success("Teacher updated")
            } else {
                await dispatch(addTeacher(payload)).unwrap()
                toast.success("Teacher added")
            }
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            setAssignments([])
            dispatch(resetTeacherSuccess())
        } catch {
            toast.error(editingId ? "Failed to update teacher" : "Failed to add teacher")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Staff</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teachers</h1>
                    <p className="text-sm text-muted-foreground">Manage teachers and the subjects they teach.</p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Teacher
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <BookUserIcon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">No teachers yet</h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Add your first teacher to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                    <table className="table-premium">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                                <th className="text-left">Email</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">Subjects</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((teacher) => {
                                const initials = (teacher.name || "").split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
                                return (
                                    <tr key={teacher._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand dark:bg-brand/15">
                                                    {initials}
                                                </div>
                                                <span className="font-medium text-foreground">{teacher.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground">{teacher.email}</td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${teacher.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                                                <span className={`size-1.5 rounded-full ${teacher.isActive ? "bg-green-500" : "bg-yellow-500"}`} />
                                                {teacher.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="text-muted-foreground">{(teacher.assignedSubjects || []).length}</td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-sm" onClick={() => openView(teacher)} aria-label="View">
                                                    <EyeIcon className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(teacher)} aria-label="Edit">
                                                    <PencilIcon className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(teacher._id)} aria-label="Delete" className="text-destructive hover:text-destructive">
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }); setAssignments([]) }}
                title={editingId ? "Edit Teacher" : "Add Teacher"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }); setAssignments([]) }}>
                            Cancel
                        </Button>
                        <Button type="submit" form="teacher-form" disabled={loading}>
                            {loading ? "Saving…" : editingId ? "Save changes" : "Add Teacher"}
                        </Button>
                    </>
                }
            >
                <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="jane@school.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password {editingId && "(leave blank to keep)"}</Label>
                        <Input id="password" type="password" required={!editingId} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                    </div>

                    <div className="space-y-2">
                        <Label>Assign classes &amp; subjects</Label>
                        {classes.length === 0 || subjects.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Add at least one class and one subject first.</p>
                        ) : (
                            <div className="space-y-3">
                                {assignments.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No assignments yet. Add a class &amp; subject pair below.</p>
                                ) : (
                                    <div className="space-y-2">
                                {assignments.map((a, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <select
                                            value={a.classId}
                                            onChange={(e) => updateAssignmentRow(index, "classId", e.target.value)}
                                            className="select-premium flex-1"
                                        >
                                            <option value="">Select class</option>
                                            {classes.map((c) => (
                                                <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={a.subjectId}
                                            onChange={(e) => updateAssignmentRow(index, "subjectId", e.target.value)}
                                            className="select-premium flex-1"
                                        >
                                            <option value="">Select subject</option>
                                            {subjects.map((s) => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeAssignmentRow(index)} aria-label="Remove assignment">
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={addAssignmentRow} className="gap-2">
                                    <PlusIcon className="size-4" /> Add class &amp; subject
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Pair each subject with the specific class it is taught in (e.g. JSS1A + Home Economics, JSS1B + English).
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            <Modal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                title={viewTeacher ? `Teacher — ${viewTeacher.name}` : "Teacher"}
                footer={
                    <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                }
            >
                {viewTeacher && <TeacherDetails teacher={viewTeacher} classes={classes} subjects={subjects} />}
            </Modal>
        </div>
    )
}

function TeacherDetails({ teacher, classes, subjects }) {
    const classMap = useMemo(() => {
        const map = {}
        classes.forEach((c) => { map[c._id] = c })
        return map
    }, [classes])

    const subjectMap = useMemo(() => {
        const map = {}
        subjects.forEach((s) => { map[s._id] = s })
        return map
    }, [subjects])

    const assignments = useMemo(() => {
        const seen = new Set()
        return (teacher.assignedSubjects || [])
            .map((a) => {
                const c = classMap[a.classId]
                const s = subjectMap[a.subjectId]
                const key = `${a.classId}-${a.subjectId}`
                if (!c || !s || seen.has(key)) return null
                seen.add(key)
                return { classId: a.classId, subjectId: a.subjectId, className: c.name, classArm: c.arm || "", subjectName: s.name }
            })
            .filter(Boolean)
    }, [teacher.assignedSubjects, classMap, subjectMap])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-[0.8rem]">
                <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="mt-0.5 font-medium text-foreground">{teacher.name}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="mt-0.5 font-medium text-foreground">{teacher.email}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="mt-0.5 font-medium capitalize text-foreground">{teacher.isActive ? "Active" : "Inactive"}</p>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[0.8rem] font-medium text-foreground">Assigned classes &amp; subjects</p>
                {assignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assignments yet.</p>
                ) : (
                    <div className="space-y-2">
                        {assignments.map((a) => (
                            <div key={`${a.classId}-${a.subjectId}`} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-[0.8rem]">
                                <span className="font-medium text-foreground">{a.className}{a.classArm ? ` ${a.classArm}` : ""}</span>
                                <span className="text-muted-foreground">{a.subjectName}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
