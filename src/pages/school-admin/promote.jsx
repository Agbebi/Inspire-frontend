import { useEffect, useState, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { ArrowRightIcon, UsersIcon, GraduationCapIcon, CheckIcon, XIcon, AlertTriangleIcon, AwardIcon, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    fetchStudents,
    promoteStudents,
    fetchClassPerformance,
    clearStudentError,
    resetStudentSuccess,
} from "@/store/admin/studentSlice"
import { fetchClasses } from "@/store/admin/classSlice"
import { useCycle } from "@/components/common/use-cycle"

export default function PromoteStudents() {
    const dispatch = useDispatch()
    const { selectedCycleId } = useCycle()
    const { items: allStudents, loading: studentsLoading, error, success, classPerformance, classPerformanceLoading } = useSelector((state) => state.student)
    const classes = useSelector((state) => state.class.items)

    const [sourceClassId, setSourceClassId] = useState("")
    const [destClassId, setDestClassId] = useState("")
    const [selectedIds, setSelectedIds] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [mode, setMode] = useState("promote")
    const successHandledRef = useRef(false)

    const classGroups = useMemo(() => {
        const map = {}
        classes.forEach((c) => {
            if (!map[c.name]) map[c.name] = []
            map[c.name].push(c)
        })
        return map
    }, [classes])

    const classNames = useMemo(() => Object.keys(classGroups).sort(), [classGroups])

    const sourceStudents = useMemo(() => {
        if (classPerformance.length > 0) {
            return classPerformance
        }
        return allStudents.filter((s) => String(s.currentClassId?._id || s.currentClassId) === String(sourceClassId))
    }, [allStudents, classPerformance, sourceClassId])

    const isLoading = studentsLoading || classPerformanceLoading

    useEffect(() => { dispatch(fetchClasses()) }, [dispatch])

    useEffect(() => {
        if (sourceClassId) {
            dispatch(fetchStudents({ classId: sourceClassId }))
            dispatch(fetchClassPerformance({ classId: sourceClassId, cycleId: selectedCycleId || undefined }))
        }
    }, [sourceClassId, dispatch, selectedCycleId])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearStudentError()) }
    }, [error, dispatch])

    useEffect(() => {
        if (success && !successHandledRef.current) {
            successHandledRef.current = true
            toast.success(`Students ${mode === "promote" ? "promoted" : mode === "graduate" ? "graduated" : "marked as left"} successfully`)
            dispatch(resetStudentSuccess())
            setSourceClassId("")
            setDestClassId("")
            setSelectedIds([])
        }
        if (!success) {
            successHandledRef.current = false
        }
    }, [success, dispatch, mode])

    function handleSourceClassChange(e) {
        setSourceClassId(e.target.value)
        setSelectedIds([])
    }

    function toggleStudent(id) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    function toggleAll() {
        if (selectedIds.length === sourceStudents.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(sourceStudents.map((s) => s._id))
        }
    }

    async function handlePromote() {
        if (!sourceClassId) {
            return toast.error("Select a source class")
        }
        if (selectedIds.length === 0) {
            return toast.error("Select at least one student")
        }
        if (mode === "promote" && !destClassId) {
            return toast.error("Select a destination class")
        }
        if (mode === "promote" && String(sourceClassId) === String(destClassId)) {
            return toast.error("Source and destination classes must be different")
        }

        setSubmitting(true)
        try {
            await dispatch(promoteStudents({
                fromClassId: sourceClassId,
                toClassId: mode === "promote" ? destClassId : undefined,
                studentIds: selectedIds,
                mode,
            })).unwrap()
        } catch {
            toast.error(`Failed to ${mode === "promote" ? "promote" : mode === "graduate" ? "graduate" : "mark as left"} students`)
        } finally {
            setSubmitting(false)
        }
    }

    const allSelected = sourceStudents.length > 0 && selectedIds.length === sourceStudents.length

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {mode === "promote" ? "Promote Students" : mode === "graduate" ? "Graduate Students" : "Mark Students as Left"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {mode === "promote"
                        ? "Move students to the next class. Unchecked students will remain in the current class (repeat)."
                        : mode === "graduate"
                            ? "Mark selected students as graduated. They will be set to inactive status."
                            : "Mark selected students as left. They will be removed from the class and set to inactive status."}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="mode"
                        checked={mode === "promote"}
                        onChange={() => setMode("promote")}
                        className="size-4"
                    />
                    Promote
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="mode"
                        checked={mode === "graduate"}
                        onChange={() => setMode("graduate")}
                        className="size-4"
                    />
                    <GraduationCapIcon className="size-4" />
                    Graduate
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="mode"
                        checked={mode === "left"}
                        onChange={() => setMode("left")}
                        className="size-4"
                    />
                    <LogOutIcon className="size-4" />
                    Left
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="sourceClass">From Class</Label>
                    <select
                        id="sourceClass"
                        value={sourceClassId}
                        onChange={handleSourceClassChange}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
                    >
                        <option value="">Select class</option>
                        {classNames.map((name) => {
                            const arms = classGroups[name] || []
                            return arms.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                            ))
                        })}
                    </select>
                </div>
                {mode === "promote" && (
                    <div className="space-y-2">
                        <Label htmlFor="destClass">To Class</Label>
                        <select
                            id="destClass"
                            value={destClassId}
                            onChange={(e) => setDestClassId(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
                        >
                            <option value="">Select class</option>
                            {classNames.map((name) => {
                                const arms = classGroups[name] || []
                                return arms.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                                ))
                            })}
                        </select>
                    </div>
                )}
            </div>

            {sourceClassId && (
                <div className="rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {sourceStudents.length} student{sourceStudents.length !== 1 ? "s" : ""} in selected class
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleAll}
                            className="gap-1.5"
                        >
                            {allSelected ? <XIcon className="size-4" /> : <CheckIcon className="size-4" />}
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">Loading students…</div>
                    ) : sourceStudents.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">No students found in this class.</div>
                    ) : (
                        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                            {sourceStudents.map((student) => {
                                const isSelected = selectedIds.includes(student._id)
                                const avg = student.overallAverage
                                const grade = student.overallGrade
                                const hasLowGrade = grade === "F" || grade === "D" || (avg !== null && avg < 50)
                                return (
                                    <label
                                        key={student._id}
                                        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted/30" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleStudent(student._id)}
                                            className="size-4 rounded border-border"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {student.admissionNumber}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {avg !== null && (
                                                <span className={`text-xs font-medium ${hasLowGrade ? "text-red-600" : "text-green-600"}`}>
                                                    Avg: {avg}
                                                </span>
                                            )}
                                            {grade && (
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${grade === "F" || grade === "D" ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}`}>
                                                    {grade}
                                                </span>
                                            )}
                                            {hasLowGrade && (
                                                <AlertTriangleIcon className="size-3.5 text-yellow-600" />
                                            )}
                                            {isSelected ? (
                                                <GraduationCapIcon className="size-4 text-green-600" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Repeating</span>
                                            )}
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">
                    {selectedIds.length > 0 ? (
                        <span>{selectedIds.length} student{selectedIds.length !== 1 ? "s" : ""} selected for {mode}</span>
                    ) : (
                        <span>No students selected</span>
                    )}
                </div>
                <Button
                    onClick={handlePromote}
                    disabled={submitting || selectedIds.length === 0 || !sourceClassId || (mode === "promote" && !destClassId)}
                    className="gap-2"
                >
                    {mode === "promote" ? <ArrowRightIcon className="size-4" /> : mode === "graduate" ? <AwardIcon className="size-4" /> : <LogOutIcon className="size-4" />}
                    {submitting ? (mode === "promote" ? "Promoting…" : mode === "graduate" ? "Graduating…" : "Marking as Left…") : (mode === "promote" ? "Promote Selected Students" : mode === "graduate" ? "Graduate Selected Students" : "Mark Selected as Left")}
                </Button>
            </div>
        </div>
    )
}
