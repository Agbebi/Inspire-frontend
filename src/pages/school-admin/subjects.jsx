import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import {
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    clearSubjectError,
    resetSubjectSuccess,
} from "@/store/admin/subjectSlice"

const emptyForm = { name: "", code: "" }

export default function Subjects() {
    const dispatch = useDispatch()
    const { items, loading, error } = useSelector((state) => state.subject)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })

    useEffect(() => { dispatch(fetchSubjects()) }, [dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearSubjectError()) }
  }, [error, dispatch])
    function openAdd() {
        setEditingId(null)
        setFormData({ ...emptyForm })
        setModalOpen(true)
    }

    function openEdit(subject) {
        setEditingId(subject._id)
        setFormData({ name: subject.name || "", code: subject.code || "" })
        setModalOpen(true)
    }

    function handleDelete(id) {
        if (window.confirm("Delete this subject? This also removes it from any classes.")) {
            dispatch(deleteSubject(id))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editingId) {
                await dispatch(updateSubject({ id: editingId, data: formData })).unwrap()
                toast.success("Subject updated")
            } else {
                await dispatch(addSubject(formData)).unwrap()
                toast.success("Subject added")
            }
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            dispatch(resetSubjectSuccess())
        } catch {
            toast.error(editingId ? "Failed to update subject" : "Failed to add subject")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Structure</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subjects</h1>
                    <p className="text-sm text-muted-foreground">Manage the subjects offered by your school.</p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Subject
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <BookOpenIcon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">No subjects yet</h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Add your first subject to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                    <table className="table-premium">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                                <th className="text-left">Code</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((subject) => (
                                <tr key={subject._id}>
                                    <td className="font-medium text-foreground">{subject.name}</td>
                                    <td className="text-muted-foreground">{subject.code || "—"}</td>
                                    <td>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(subject)} aria-label="Edit">
                                                <PencilIcon className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(subject._id)} aria-label="Delete" className="text-destructive hover:text-destructive">
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
                title={editingId ? "Edit Subject" : "Add Subject"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); setFormData({ ...emptyForm }) }}>
                            Cancel
                        </Button>
                        <Button type="submit" form="subject-form" disabled={loading}>
                            {loading ? "Saving…" : editingId ? "Save changes" : "Add Subject"}
                        </Button>
                    </>
                }
            >
                <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Subject name</Label>
                        <Input id="name" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Mathematics" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} placeholder="MTH" />
                    </div>
                </form>
            </Modal>
        </div>
    )
}
