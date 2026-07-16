import { useEffect, useState, useRef, useMemo } from "react"
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, RefreshCwIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import { PageLoading } from "@/components/ui/loading"
import { useDispatch, useSelector } from "react-redux"
import {
    fetchCycles,
    addCycle,
    updateCycle,
    deleteCycle,
    publishCycle,
    startNextTerm,
    startNewSession,
    clearCycleError,
    resetCycleSuccess,
} from "@/store/admin/cycleSlice"
import { toast } from "sonner"

export default function CycleManagement() {
    const dispatch = useDispatch()
    const { items, loading, error, success, resultsLocked } = useSelector((state) => state.cycle)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ session: "", term: "", startDate: "", endDate: "", isCurrent: false })
    const [submitting, setSubmitting] = useState(false)
    const [nextTermSubmitting, setNextTermSubmitting] = useState(false)
    const [publishingId, setPublishingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [newSessionModalOpen, setNewSessionModalOpen] = useState(false)
    const [newSessionForm, setNewSessionForm] = useState({ session: "", startDate: "", endDate: "" })
    const successRef = useRef(false)

    const TERM_ORDER = ['First Term', 'Second Term', 'Third Term']

    function getNextTerm(term) {
        const idx = TERM_ORDER.indexOf(term)
        if (idx >= 0 && idx < TERM_ORDER.length - 1) {
            return TERM_ORDER[idx + 1]
        }
        return null
    }

    function canStartNextTerm(cycle) {
        if (!cycle.isPublished) return false
        const nextTerm = getNextTerm(cycle.term)
        if (!nextTerm) return false
        return !items.some(c => c.session === cycle.session && c.term === nextTerm)
    }

    function suggestNextSession(currentSession) {
        if (!currentSession) return ""
        const match = currentSession.match(/(\d{4})[-/](\d{4})/)
        if (match) {
            const startYear = parseInt(match[1], 10)
            const endYear = parseInt(match[2], 10)
            if (endYear === startYear + 1) {
                return `${startYear + 1}/${endYear + 1}`
            }
        }
        return ""
    }

    const currentOrLatestCycle = useMemo(() => {
        const current = items.find((c) => c.isCurrent)
        if (current) return current
        if (items.length > 0) {
            return [...items].sort((a, b) => (b.session || "").localeCompare(a.session || ""))[0]
        }
        return null
    }, [items])

    useEffect(() => {
        dispatch(fetchCycles())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearCycleError())
        }
    }, [error, dispatch])

    useEffect(() => {
        if (success && !successRef.current) {
            successRef.current = true
            toast.success(editingId ? "Cycle updated" : "Cycle added")
            dispatch(resetCycleSuccess())
            setModalOpen(false)
        }
        if (!success) {
            successRef.current = false
        }
    }, [success, editingId, dispatch])

    function openAdd() {
        setEditingId(null)
        setFormData({ session: "", term: "", startDate: "", endDate: "", isCurrent: false })
        setModalOpen(true)
    }

    function openEdit(cycle) {
        setEditingId(cycle._id)
        setFormData({
            session: cycle.session,
            term: cycle.term,
            startDate: cycle.startDate ? cycle.startDate.slice(0, 10) : "",
            endDate: cycle.endDate ? cycle.endDate.slice(0, 10) : "",
            isCurrent: cycle.isCurrent,
        })
        setModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        const payload = {
            session: formData.session.trim(),
            term: formData.term.trim(),
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            isCurrent: formData.isCurrent,
        }
        if (editingId) {
            await dispatch(updateCycle({ id: editingId, data: payload }))
        } else {
            await dispatch(addCycle(payload))
        }
        setSubmitting(false)
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this academic cycle? This cannot be undone.")) return
        setDeletingId(id)
        try {
            await dispatch(deleteCycle(id))
            toast.success("Cycle deleted")
        } catch {
            toast.error("Failed to delete cycle")
        } finally {
            setDeletingId(null)
        }
    }

    async function handlePublish(cycle) {
        setPublishingId(cycle._id)
        try {
            await dispatch(publishCycle({ id: cycle._id, isPublished: !cycle.isPublished })).unwrap()
            toast.success(cycle.isPublished ? "Results unpublished" : "Results published")
            dispatch(fetchCycles())
        } catch {
            toast.error("Failed to update publish status")
        } finally {
            setPublishingId(null)
        }
    }

    async function handleStartNextTerm(cycle) {
        if (!window.confirm(`Start the next term for ${cycle.session}? Previous results will be preserved.`)) return
        setNextTermSubmitting(true)
        try {
            await dispatch(startNextTerm({ currentCycleId: cycle._id })).unwrap()
            toast.success("Next term started. The cycle is locked until the superadmin unlocks it.")
            dispatch(fetchCycles())
        } catch {
            toast.error("Failed to start next term")
        } finally {
            setNextTermSubmitting(false)
        }
    }

    function openNewSession() {
        const suggested = currentOrLatestCycle ? suggestNextSession(currentOrLatestCycle.session) : ""
        setNewSessionForm({ session: suggested, startDate: "", endDate: "" })
        setNewSessionModalOpen(true)
    }

    async function handleStartNewSession(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            await dispatch(startNewSession({
                newSession: newSessionForm.session,
                startDate: newSessionForm.startDate || undefined,
                endDate: newSessionForm.endDate || undefined,
            })).unwrap()
            toast.success("New session started. The cycle is locked until the superadmin unlocks it.")
            setNewSessionModalOpen(false)
            dispatch(fetchCycles())
        } catch {
            toast.error("Failed to start new session")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading && items.length === 0) {
        return <PageLoading message="Loading academic cycles…" />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Academic Cycles</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage sessions and terms. Set the current cycle and publish results for students.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2">
                    <Button onClick={openAdd} className="gap-2">
                        <PlusIcon className="size-4" /> Add Cycle
                    </Button>
                    <Button onClick={openNewSession} variant="outline" className="gap-2">
                        <RefreshCwIcon className="size-4" /> New Session
                    </Button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <CalendarIcon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium">No academic cycles</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Create a session and term to start recording results.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((cycle) => (
                        <div
                            key={cycle._id}
                            className="rounded-xl border border-border bg-card p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium">{cycle.session}</h3>
                                    <p className="text-sm text-muted-foreground">{cycle.term}</p>
                                </div>
                                {cycle.isCurrent && (
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Current
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                {cycle.isPublished ? (
                                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                                        <EyeIcon className="mr-1 size-3" /> Published
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                                        <EyeOffIcon className="mr-1 size-3" /> Draft
                                    </span>
                                )}
                                {cycle.resultsLocked && (
                                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                                        <LockIcon className="mr-1 size-3" /> Locked
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                {canStartNextTerm(cycle) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStartNextTerm(cycle)}
                                        disabled={nextTermSubmitting}
                                        className="gap-1.5"
                                    >
                                        {nextTermSubmitting ? "Starting…" : <><ArrowRightIcon className="size-4" /> Start Next Term</>}
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => handlePublish(cycle)} disabled={cycle.resultsLocked || publishingId === cycle._id} className="gap-1.5">
                                    {publishingId === cycle._id ? (
                                        "Saving…"
                                    ) : (
                                        <>
                                            {cycle.isPublished ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                            {cycle.isPublished ? "Unpublish" : "Publish"}
                                        </>
                                    )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(cycle)} aria-label="Edit" disabled={publishingId === cycle._id || deletingId === cycle._id}>
                                    <PencilIcon className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(cycle._id)}
                                    aria-label="Delete"
                                    className="text-destructive hover:text-destructive ml-auto"
                                    disabled={deletingId === cycle._id || publishingId === cycle._id}
                                >
                                    {deletingId === cycle._id ? "Deleting…" : <TrashIcon className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId ? "Edit Cycle" : "Add Cycle"}
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" form="cycle-form" disabled={submitting}>
                            {submitting ? "Saving…" : editingId ? "Save changes" : "Add Cycle"}
                        </Button>
                    </>
                }
            >
                <form id="cycle-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="session">Session</Label>
                            <Input
                                id="session"
                                value={formData.session}
                                onChange={(e) => setFormData((p) => ({ ...p, session: e.target.value }))}
                                placeholder="e.g 2025/2026"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="term">Term</Label>
                            <Input
                                id="term"
                                value={formData.term}
                                onChange={(e) => setFormData((p) => ({ ...p, term: e.target.value }))}
                                placeholder="e.g First Term"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={formData.isCurrent}
                            onChange={(e) => setFormData((p) => ({ ...p, isCurrent: e.target.checked }))}
                            className="size-4 rounded border-border"
                        />
                        Set as current cycle
                    </label>
                </form>
            </Modal>

            <Modal
                open={newSessionModalOpen}
                onClose={() => setNewSessionModalOpen(false)}
                title="Start New Session"
                footer={
                    <>
                        <Button type="button" variant="outline" onClick={() => setNewSessionModalOpen(false)}>Cancel</Button>
                        <Button type="submit" form="new-session-form" disabled={submitting}>
                            {submitting ? "Starting…" : "Start Session"}
                        </Button>
                    </>
                }
            >
                <form id="new-session-form" onSubmit={handleStartNewSession} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newSession">Session Name</Label>
                        <Input
                            id="newSession"
                            value={newSessionForm.session}
                            onChange={(e) => setNewSessionForm((p) => ({ ...p, session: e.target.value }))}
                            placeholder="e.g 2025/2026"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            {currentOrLatestCycle ? `Suggested: ${suggestNextSession(currentOrLatestCycle.session) || "same as current"}` : "Enter the new session name"}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="nsStartDate">Start Date</Label>
                            <Input
                                id="nsStartDate"
                                type="date"
                                value={newSessionForm.startDate}
                                onChange={(e) => setNewSessionForm((p) => ({ ...p, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nsEndDate">End Date</Label>
                            <Input
                                id="nsEndDate"
                                type="date"
                                value={newSessionForm.endDate}
                                onChange={(e) => setNewSessionForm((p) => ({ ...p, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This will create <span className="font-medium">First Term</span> for the new session and set it as the current cycle.
                    </p>
                </form>
            </Modal>
        </div>
    )
}
