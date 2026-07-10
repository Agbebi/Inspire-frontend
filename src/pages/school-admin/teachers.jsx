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
    const { items, loading, error, success } = useSelector((state) => state.teacher)
    const classes = useSelector((state) => state.class.items)
    const subjects = useSelector((state) => state.subject.items)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })
    const [selClasses, setSelClasses] = useState([])
    const [selSubjects, setSelSubjects] = useState([])

    const [viewOpen, setViewOpen] = useState(false)
    const [viewTeacher, setViewTeacher] = useState(null)

    useEffect(() => {
        dispatch(fetchTeachers())
        dispatch(fetchClasses())
        dispatch(fetchSubjects())
    }, [dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearTeacherError()) }
        if (success) {
            toast.success(editingId ? "Teacher updated" : "Teacher added")
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            setSelClasses([])
            setSelSubjects([])
            dispatch(resetTeacherSuccess())
        }
    }, [error, success, dispatch, editingId])

    function openAdd() {
        setEditingId(null)
        setFormData({ ...emptyForm })
        setSelClasses([])
        setSelSubjects([])
        setModalOpen(true)
    }

    function openEdit(teacher) {
        setEditingId(teacher._id)
        setFormData({ name: teacher.name || "", email: teacher.email || "", password: "" })
        const assigned = teacher.assignedSubjects || []
        setSelClasses([...new Set(assigned.map((a) => a.classId))])
        setSelSubjects([...new Set(assigned.map((a) => a.subjectId))])
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

    function buildAssignedSubjects() {
        const result = []
        selClasses.forEach((classId) => {
            selSubjects.forEach((subjectId) => {
                result.push({ classId, subjectId })
            })
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
            } else {
                await dispatch(addTeacher(payload)).unwrap()
            }
        } catch {
            toast.error(editingId ? "Failed to update teacher" : "Failed to add teacher")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
                    <p className="text-sm text-muted-foreground">Manage teachers and the subjects they teach.</p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Teacher
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <BookUserIcon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium">No teachers yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add your first teacher to get started.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="table-header-brand border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subjects</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((teacher) => (
                                <tr key={teacher._id} className="transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{teacher.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{teacher.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${teacher.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                                            {teacher.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{(teacher.assignedSubjects || []).length}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }); setSelClasses([]); setSelSubjects([]) }}
                title={editingId ? "Edit Teacher" : "Add Teacher"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }); setSelClasses([]); setSelSubjects([]) }}>
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
                                <div className="grid grid-cols-2 gap-2">
                                    {classes.map((c) => (
                                        <label key={c._id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                            <input type="checkbox" checked={selClasses.includes(c._id)} onChange={() => setSelClasses((p) => p.includes(c._id) ? p.filter((x) => x !== c._id) : [...p, c._id])} className="size-4" />
                                             {c.name}{c.arm ? ` ${c.arm}` : ""}
                                        </label>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {subjects.map((s) => (
                                        <label key={s._id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                            <input type="checkbox" checked={selSubjects.includes(s._id)} onChange={() => setSelSubjects((p) => p.includes(s._id) ? p.filter((x) => x !== s._id) : [...p, s._id])} className="size-4" />
                                            {s.name}
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Every selected class will be paired with every selected subject (e.g. Physics + SS2).
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
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{teacher.name}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{teacher.isActive ? "Active" : "Inactive"}</p>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Assigned classes &amp; subjects</p>
                {assignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assignments yet.</p>
                ) : (
                    <div className="space-y-2">
                        {assignments.map((a) => (
                            <div key={`${a.classId}-${a.subjectId}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                                <span className="font-medium">{a.className}{a.classArm ? ` ${a.classArm}` : ""}</span>
                                <span className="text-muted-foreground">{a.subjectName}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
