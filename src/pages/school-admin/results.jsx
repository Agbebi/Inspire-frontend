import { useEffect, useState, useMemo } from "react"
import { ArrowLeftIcon, ClipboardCheckIcon, UsersIcon, SchoolIcon, AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import Modal from "@/components/common/modal"
import { PageLoading, CardLoading } from "@/components/ui/loading"
import API from "@/api/axios"
import { toast } from "sonner"

function toSentenceCase(str) {
    if (!str) return "—"
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function Results() {
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

    useEffect(() => {
        async function loadClasses() {
            setLoading(true)
            try {
                const res = await API.get("/api/school/manage/classes")
                setClasses(res.data?.data || [])
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
            const res = await API.get(`/api/school/manage/students/${student._id}/results`)
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
            const res = await API.get("/api/school/manage/results/missing")
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
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
            </div>

            {view === "classes" && (
                <>
                    {classes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <SchoolIcon className="size-6" />
                            </div>
                            <h3 className="mt-4 text-sm font-medium">No classes yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Create classes first to view results.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((klass) => (
                                <div
                                    key={klass._id}
                                    className="rounded-xl border border-border bg-card p-5 cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => openClass(klass)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">{klass.name}{klass.arm ? ` ${klass.arm}` : ""}</h3>
                                            <p className="text-sm text-muted-foreground">{klass.studentCount || 0} students</p>
                                        </div>
                                        <ClipboardCheckIcon className="size-5 text-muted-foreground" />
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
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <UsersIcon className="size-6" />
                            </div>
                            <h3 className="mt-4 text-sm font-medium">No students in this class</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Add students to this class to see results.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="table-header-brand border-b border-border bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Admission No.</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {students.map((student) => (
                                        <tr key={student._id} className="transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => openStudent(student)}>
                                            <td className="px-4 py-3 font-medium">{student.firstName} {student.lastName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{student.admissionNumber}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${student.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                                                    {student.status || "active"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
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
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <ClipboardCheckIcon className="size-6" />
                            </div>
                            <h3 className="mt-4 text-sm font-medium">No results recorded</h3>
                            <p className="mt-1 text-sm text-muted-foreground">This student has no results yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedResults.map((group) => (
                                <div key={group.classId} className="rounded-xl border border-border bg-card overflow-x-auto">
                                    <div className="border-b border-border bg-muted/50 px-4 py-3">
                                        <h3 className="font-medium">{group.className}{group.classArm ? ` ${group.classArm}` : ""}</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="table-header-brand border-b border-border text-left text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">Subject</th>
                                                <th className="px-4 py-3 font-medium">CA1</th>
                                                <th className="px-4 py-3 font-medium">CA2</th>
                                                <th className="px-4 py-3 font-medium">Exam</th>
                                                <th className="px-4 py-3 font-medium">Total</th>
                                                <th className="px-4 py-3 font-medium">Grade</th>
                                                <th className="px-4 py-3 font-medium">Remark</th>
                                                <th className="px-4 py-3 font-medium">Teacher</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {group.subjects.map((r) => (
                                                <tr key={r._id} className="transition-colors hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{r.subjectId?.name || "—"}</td>
                                                    <td className="px-4 py-3">{r.ca1 ?? "—"}</td>
                                                    <td className="px-4 py-3">{r.ca2 ?? "—"}</td>
                                                    <td className="px-4 py-3">{r.exam ?? "—"}</td>
                                                    <td className="px-4 py-3">{r.total ?? "—"}</td>
                                                    <td className="px-4 py-3">{r.grade || "—"}</td>
                                                    <td className="px-4 py-3">{toSentenceCase(r.remark)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{r.teacherId?.name || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                                <div className="space-y-1">
                                    {group.students.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                            <span className="font-medium">{m.studentName}</span>
                                            <span className="text-xs text-muted-foreground">{m.subjectName}</span>
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
