import { useEffect, useState, useMemo } from "react"
import { ArrowLeftIcon, ClipboardCheckIcon, UsersIcon, SchoolIcon, AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import Modal from "@/components/common/modal"
import { PageLoading, CardLoading } from "@/components/ui/loading"
import CycleSelector from "@/components/common/cycle-selector"
import { useCycle } from "@/components/common/use-cycle"
import API from "@/api/axios"
import { toast } from "sonner"

function toSentenceCase(str) {
    if (!str) return "—"
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function Results() {
    const { selectedCycleId } = useCycle()
    const [view, setView] = useState("classes")
    const [classes, setClasses] = useState([])
    const [students, setStudents] = useState([])
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedClass, setSelectedClass] = useState(null)
    const [selectedStudent, setSelectedStudent] = useState(null)

    const [missingOpen, setMissingOpen] = useState(false)
    const [missing, setMissing] = useState([])
    const [missingLoading, setMissingLoading] = useState(false)
    const [caConfig, setCaConfig] = useState({ caCount: 3, caMaxScores: [10, 10, 20], examMaxScore: 70 })

    useEffect(() => {
        async function loadClasses() {
            setLoading(true)
            try {
                const [cRes, sRes] = await Promise.all([
                    API.get("/api/school/manage/classes"),
                    API.get("/api/school/manage/settings"),
                ])
                setClasses(cRes.data?.data || [])
                const settings = sRes.data?.data || {}
                const count = settings.caConfig?.caCount || 3
                setCaConfig({
                    caCount: count,
                    caMaxScores: settings.caConfig?.caMaxScores || (count === 2 ? [15, 15] : [10, 10, 20]),
                    examMaxScore: settings.caConfig?.examMaxScore || 70,
                })
            } catch {
                setClasses([])
            } finally {
                setLoading(false)
            }
        }
        loadClasses()
    }, [])

    async function openClass(klass) {
        setSelectedClass(klass)
        setLoading(true)
        try {
            const res = await API.get("/api/school/manage/students", { params: { classId: klass._id } })
            setStudents(res.data?.data || [])
            setView("students")
        } catch {
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    async function openStudent(student) {
        setSelectedStudent(student)
        setLoading(true)
        try {
            const params = {}
            if (selectedCycleId) params.cycleId = selectedCycleId
            const res = await API.get(`/api/school/manage/students/${student._id}/results`, { params })
            setResults(res.data?.data || [])
            setView("report")
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function goBack() {
        if (view === "report") {
            setView("students")
            setSelectedStudent(null)
            setResults([])
        } else if (view === "students") {
            setView("classes")
            setSelectedClass(null)
            setStudents([])
        }
    }

    async function checkMissing() {
        setMissingLoading(true)
        setMissingOpen(true)
        try {
            const params = {}
            if (selectedCycleId) params.cycleId = selectedCycleId
            const res = await API.get("/api/school/manage/results/missing", { params })
            setMissing(res.data?.data || [])
        } catch {
            setMissing([])
            toast.error("Failed to load missing results")
        } finally {
            setMissingLoading(false)
        }
    }

    const groupedMissing = useMemo(() => {
        const map = new Map()
        missing.forEach((m) => {
            const key = m.classId
            if (!map.has(key)) {
                map.set(key, {
                    classId: key,
                    className: m.className,
                    classArm: m.classArm || "",
                    students: [],
                })
            }
            map.get(key).students.push(m)
        })
        return Array.from(map.values()).sort((a, b) => (a.className || "").localeCompare(b.className || ""))
    }, [missing])

    const groupedResults = useMemo(() => {
        const map = new Map()
        results.forEach((r) => {
            const key = r.classsId?._id || "unknown"
            if (!map.has(key)) {
                map.set(key, {
                    classId: key,
                    className: r.classsId?.name || "—",
                    classArm: r.classsId?.arm || "",
                    subjects: [],
                })
            }
            map.get(key).subjects.push(r)
        })
        return Array.from(map.values()).sort((a, b) => (a.className || "").localeCompare(b.className || ""))
    }, [results])

    if (loading && view === "classes") {
        return <PageLoading message="Loading classes…" />
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Academic</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Results</h1>
                    <p className="text-sm text-muted-foreground">
                        {view === "classes" && "Select a class to view student results."}
                        {view === "students" && `Students in ${selectedClass?.name}${selectedClass?.arm ? ` ${selectedClass.arm}` : ""}`}
                        {view === "report" && `${selectedStudent?.firstName} ${selectedStudent?.lastName} — Report Card`}
                    </p>
                </div>
                {view !== "classes" && (
                    <Button variant="outline" size="sm" onClick={goBack}>
                        <ArrowLeftIcon className="mr-2 size-4" /> Back
                    </Button>
                )}
                {view === "classes" && (
                    <Button variant="outline" size="sm" onClick={checkMissing} className="gap-1.5">
                        <AlertTriangleIcon className="size-4" /> Check Missing Results
                    </Button>
                )}
                {view === "classes" && (
                    <CycleSelector />
                )}
            </div>

            {view === "classes" && (
                <>
                    {classes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <SchoolIcon className="size-6" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-foreground">No classes yet</h3>
                            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Create classes first to view results.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((klass) => (
                                <div
                                    key={klass._id}
                                    className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                                    onClick={() => openClass(klass)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-medium text-foreground">{klass.name}{klass.arm ? ` ${klass.arm}` : ""}</h3>
                                            <p className="text-[0.8rem] text-muted-foreground">{klass.studentCount || 0} students</p>
                                        </div>
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/15">
                                            <ClipboardCheckIcon className="size-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {view === "students" && (
                <>
                    {loading ? (
                        <PageLoading message="Loading students…" />
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <UsersIcon className="size-6" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-foreground">No students in this class</h3>
                            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Add students to this class to see results.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th className="text-left">Name</th>
                                        <th className="text-left">Admission No.</th>
                                        <th className="text-left">Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student._id} className="cursor-pointer" onClick={() => openStudent(student)}>
                                            <td className="font-medium text-foreground">{student.firstName} {student.lastName}</td>
                                            <td className="text-muted-foreground">{student.admissionNumber}</td>
                                            <td>
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${student.status === "active" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                                                    <span className={`size-1.5 rounded-full ${student.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                                                    {student.status || "active"}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <Button variant="ghost" size="sm" className="gap-1.5">
                                                    <ClipboardCheckIcon className="size-4" /> View Results
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {view === "report" && (
                <>
                    {loading ? (
                        <PageLoading message="Loading results…" />
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <ClipboardCheckIcon className="size-6" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-foreground">No results recorded</h3>
                            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">This student has no results yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {groupedResults.map((group) => (
                                <div key={group.classId} className="overflow-hidden rounded-2xl border border-border bg-card">
                                    <div className="border-b border-border bg-muted/30 px-6 py-4">
                                        <h3 className="text-sm font-semibold text-foreground">{group.className}{group.classArm ? ` ${group.classArm}` : ""}</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table-premium">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">Subject</th>
                                                    <th className="text-left">CA1</th>
                                                    <th className="text-left">CA2</th>
                                                    {caConfig.caCount === 3 && (
                                                        <th className="text-left">CA3</th>
                                                    )}
                                                    <th className="text-left">Exam</th>
                                                    <th className="text-left">Total</th>
                                                    <th className="text-left">Grade</th>
                                                    <th className="text-left">Remark</th>
                                                    <th className="text-left">Teacher</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.subjects.map((r) => (
                                                    <tr key={r._id}>
                                                        <td className="font-medium text-foreground">{r.subjectId?.name || "—"}</td>
                                                        <td className="text-muted-foreground">{r.ca1 ?? "—"}</td>
                                                        <td className="text-muted-foreground">{r.ca2 ?? "—"}</td>
                                                        {caConfig.caCount === 3 && (
                                                            <td className="text-muted-foreground">{r.ca3 ?? "—"}</td>
                                                        )}
                                                        <td className="text-muted-foreground">{r.exam ?? "—"}</td>
                                                        <td className="font-medium text-foreground">{r.total ?? "—"}</td>
                                                        <td className="text-foreground">{r.grade || "—"}</td>
                                                        <td className="text-muted-foreground">{toSentenceCase(r.remark)}</td>
                                                        <td className="text-muted-foreground">{r.teacherId?.name || "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <Modal
                open={missingOpen}
                onClose={() => setMissingOpen(false)}
                title="Missing Results"
                footer={
                    <Button type="button" variant="outline" onClick={() => setMissingOpen(false)}>Close</Button>
                }
            >
                {missingLoading ? (
                    <CardLoading message="Checking…" />
                ) : missing.length === 0 ? (
                    <div className="space-y-2 text-center py-4">
                        <p className="text-sm font-medium">All results recorded</p>
                        <p className="text-sm text-muted-foreground">Every student in every class has results for all assigned subjects.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-muted-foreground">{missing.length} missing result{missing.length !== 1 ? "s" : ""} found across {groupedMissing.length} class{groupedMissing.length !== 1 ? "es" : ""}.</p>
                        {groupedMissing.map((group) => (
                            <div key={group.classId} className="space-y-2">
                                <h4 className="font-medium text-sm">{group.className}{group.classArm ? ` ${group.classArm}` : ""}</h4>
                                <div className="space-y-1.5">
                                    {group.students.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-[0.8rem]">
                                            <span className="font-medium text-foreground">{m.studentName}</span>
                                            <span className="text-muted-foreground">{m.subjectName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    )
}
