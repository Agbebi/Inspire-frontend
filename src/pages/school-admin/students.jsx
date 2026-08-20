import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, EyeIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon, CopyIcon, UserCheckIcon, GraduationCapIcon, UserMinusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import {
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    clearStudentError,
    resetStudentSuccess,
} from "@/store/admin/studentSlice"
import { fetchClasses } from "@/store/admin/classSlice"

const emptyForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    accessPin: "",
    admissionNumber: "",
    className: "",
    arm: "",
    status: "active",
}

const selectClass =
    "h-10 w-full rounded-xl border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"

const statusStyles = {
    active: {
        icon: UserCheckIcon,
        label: "Active",
        className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    graduated: {
        icon: GraduationCapIcon,
        label: "Graduated",
        className: "bg-brand/10 text-brand dark:bg-brand/15",
    },
    left: {
        icon: UserMinusIcon,
        label: "Left",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
}

export default function Students() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { slug } = useParams()
    const { items, loading, error, success } = useSelector((state) => state.student)
    const classes = useSelector((state) => state.class.items)

    const [search, setSearch] = useState("")
    const [classFilter, setClassFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [sortField, setSortField] = useState("")
    const [sortDir, setSortDir] = useState("asc")
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })

    const classGroups = useMemo(() => {
        const map = {}
        classes.forEach((c) => {
            if (!map[c.name]) map[c.name] = []
            map[c.name].push(c)
        })
        return map
    }, [classes])

    const classNames = useMemo(() => Object.keys(classGroups).sort(), [classGroups])
    const armOptions = formData.className ? (classGroups[formData.className] || []) : []

    function classIdFromSelection(name, arm) {
        const match = classes.find((c) => c.name === name && (c.arm || "") === (arm || ""))
        return match ? match._id : null
    }

    function handleSort(field) {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDir("asc")
        }
    }

    const filteredStudents = useMemo(() => {
        let data = [...items]

        if (classFilter) {
            data = data.filter((s) => String(s.currentClassId?._id || s.currentClassId) === String(classFilter))
        }
        if (statusFilter) {
            data = data.filter((s) => (s.status || "active") === statusFilter)
        }

        if (sortField) {
            data.sort((a, b) => {
                let aVal = ""
                let bVal = ""
                switch (sortField) {
                    case "name":
                        aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase()
                        bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase()
                        break
                    case "admissionNumber":
                        aVal = (a.admissionNumber || "").toLowerCase()
                        bVal = (b.admissionNumber || "").toLowerCase()
                        break
                    case "class":
                        aVal = `${a.currentClassId?.name || ""}${a.currentClassId?.arm || ""}`.toLowerCase()
                        bVal = `${b.currentClassId?.name || ""}${b.currentClassId?.arm || ""}`.toLowerCase()
                        break
                    case "status":
                        aVal = (a.status || "active").toLowerCase()
                        bVal = (b.status || "active").toLowerCase()
                        break
                    default:
                        break
                }
                if (aVal < bVal) return sortDir === "asc" ? -1 : 1
                if (aVal > bVal) return sortDir === "asc" ? 1 : -1
                return 0
            })
        }

        return data
    }, [items, classFilter, statusFilter, sortField, sortDir])

    useEffect(() => { dispatch(fetchClasses()) }, [dispatch])

    useEffect(() => {
        const t = setTimeout(() => { dispatch(fetchStudents(search.trim())) }, 300)
        return () => clearTimeout(t)
    }, [search, dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearStudentError()) }
        if (success) {
            toast.success(editingId ? "Student updated" : "Student added")
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            dispatch(resetStudentSuccess())
        }
    }, [error, success, dispatch, editingId])

    function openAdd() {
        const randomPin = String(Math.floor(100000 + Math.random() * 900000))
        setEditingId(null)
        setFormData({ ...emptyForm, accessPin: randomPin })
        setModalOpen(true)
    }

    function openEdit(student) {
        const classObj = classes.find((c) => c._id === (student.currentClassId?._id || student.currentClassId))
        setEditingId(student._id)
        setFormData({
            firstName: student.firstName || "",
            middleName: student.middleName || "",
            lastName: student.lastName || "",
            email: student.email || "",
            accessPin: student.accessPin || "",
            admissionNumber: student.admissionNumber || "",
            className: classObj?.name || "",
            arm: classObj?.arm || "",
            status: student.status || "active",
        })
        setModalOpen(true)
    }

    function handleDelete(id) {
        if (window.confirm("Delete this student and their results?")) {
            dispatch(deleteStudent(id))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const { className, arm, ...rest } = formData
        const payload = { ...rest, currentClassId: classIdFromSelection(className, arm) }
        try {
            if (editingId) {
                await dispatch(updateStudent({ id: editingId, data: payload })).unwrap()
            } else {
                await dispatch(addStudent(payload)).unwrap()
            }
        } catch {
            toast.error(editingId ? "Failed to update student" : "Failed to add student")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        Directory
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Students
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Find and manage every student record in your school.
                    </p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Student
                </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative flex-1">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, admission no…"
                        className="h-11 rounded-xl pl-10"
                    />
                </div>
                <div className="space-y-1.5 sm:w-48">
                    <Label htmlFor="classFilter">Class</Label>
                    <select
                        id="classFilter"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All classes</option>
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1.5 sm:w-40">
                    <Label htmlFor="statusFilter">Status</Label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <UsersIcon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">No students found</h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        {search ? "Try a different search term or adjust your filters." : "Add your first student to get started."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[0.8rem]">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-6 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("name")}>
                                        <span className="inline-flex items-center gap-1.5">Name {sortField === "name" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("admissionNumber")}>
                                        <span className="inline-flex items-center gap-1.5">Admission No. {sortField === "admissionNumber" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Access PIN</th>
                                    <th className="px-6 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("class")}>
                                        <span className="inline-flex items-center gap-1.5">Class {sortField === "class" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("status")}>
                                        <span className="inline-flex items-center gap-1.5">Status {sortField === "status" && (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)}</span>
                                    </th>
                                    <th className="px-6 py-4 text-right text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.map((student) => {
                                    const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
                                    return (
                                        <tr key={student._id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand dark:bg-brand/15">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-foreground">
                                                            {student.firstName} {student.lastName}
                                                        </p>
                                                        <p className="truncate text-[0.7rem] text-muted-foreground">
                                                            {student.email || "No email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[0.7rem] text-muted-foreground">{student.admissionNumber}</td>
                                            <td className="px-6 py-4 font-mono text-[0.7rem] text-muted-foreground">{student.accessPin || "—"}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {student.currentClassId?.name || "—"}{student.currentClassId?.arm ? ` ${student.currentClassId.arm}` : ""}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const s = statusStyles[student.status] || { icon: UsersIcon, label: student.status || "Active", className: "bg-muted text-muted-foreground" }
                                                    const StatusIcon = s.icon
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${s.className}`}>
                                                            <StatusIcon className="size-3" />
                                                            {s.label}
                                                        </span>
                                                    )
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/${slug}/admin/students/${student._id}`)} aria-label="View">
                                                        <EyeIcon className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(student)} aria-label="Edit">
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(student._id)} aria-label="Delete" className="text-destructive hover:text-destructive">
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
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }) }}
                title={editingId ? "Edit Student" : "Add Student"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }) }}>
                            Cancel
                        </Button>
                        <Button type="submit" form="student-form" disabled={loading}>
                            {loading ? "Saving…" : editingId ? "Save changes" : "Add Student"}
                        </Button>
                    </>
                }
            >
                <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input id="firstName" required value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" required value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middleName">Middle name</Label>
                        <Input id="middleName" value={formData.middleName} onChange={(e) => setFormData((p) => ({ ...p, middleName: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="admissionNumber">Admission No.</Label>
                            <Input id="admissionNumber" required value={formData.admissionNumber} onChange={(e) => setFormData((p) => ({ ...p, admissionNumber: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accessPin">Access PIN</Label>
                            <div className="flex items-center gap-2">
                                <Input id="accessPin" value={formData.accessPin} readOnly className="font-mono" />
                                <Button type="button" variant="outline" size="icon-sm" onClick={() => { navigator.clipboard.writeText(formData.accessPin); toast.success("PIN copied") }}>
                                    <CopyIcon className="size-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Auto-generated 6-digit PIN for student login.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="className">Class</Label>
                            <select
                                id="className"
                                value={formData.className}
                                onChange={(e) => setFormData((p) => ({ ...p, className: e.target.value, arm: "" }))}
                                className={selectClass}
                            >
                                <option value="">Select class</option>
                                {classNames.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="arm">Arm</Label>
                            <select
                                id="arm"
                                value={formData.arm}
                                disabled={!formData.className}
                                onChange={(e) => setFormData((p) => ({ ...p, arm: e.target.value }))}
                                 className={`${selectClass} disabled:opacity-50`}
                            >
                                <option value="">{formData.className ? "Select arm" : "Pick a class first"}</option>
                                {armOptions.map((c) => (
                                    <option key={c._id} value={c.arm || ""}>{c.arm || "—"}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
