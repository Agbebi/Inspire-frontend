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
    const { items, loading, error, success } = useSelector((state) => state.subject)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...emptyForm })

    useEffect(() => { dispatch(fetchSubjects()) }, [dispatch])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearSubjectError()) }
        if (success) {
            toast.success(editingId ? "Subject updated" : "Subject added")
            setModalOpen(false)
            setEditingId(null)
            setFormData({ ...emptyForm })
            dispatch(resetSubjectSuccess())
        }
    }, [error, success, dispatch, editingId])

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
            } else {
                await dispatch(addSubject(formData)).unwrap()
            }
        } catch {
            toast.error(editingId ? "Failed to update subject" : "Failed to add subject")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
                    <p className="text-sm text-muted-foreground">Manage the subjects offered by your school.</p>
                </div>
                <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                    <PlusIcon className="size-4" /> Add Subject
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <BookOpenIcon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium">No subjects yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add your first subject to get started.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="table-header-brand border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((subject) => (
                                <tr key={subject._id} className="transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{subject.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{subject.code || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
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
