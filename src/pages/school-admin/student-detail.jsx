import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { ArrowLeftIcon, GraduationCapIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import API from "@/api/axios"
import { Button } from "@/components/ui/button"
import { PageLoading } from "@/components/ui/loading"
import { updateStudentVisibility } from "@/store/admin/studentSlice"

export default function StudentDetail() {
    const { slug, id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [student, setStudent] = useState(null)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [sRes, rRes] = await Promise.all([
                    API.get(`/api/school/manage/students/${id}`),
                    API.get(`/api/school/manage/students/${id}/results`),
                ])
                setStudent(sRes.data?.data || null)
                setResults(rRes.data?.data || [])
            } catch {
                setStudent(null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    async function toggleVisibility() {
        if (!student) return
        const next = student.resultVisibility === "hidden" ? "visible" : "hidden"
        setToggling(true)
        try {
            const res = await dispatch(updateStudentVisibility({ id: student._id, resultVisibility: next })).unwrap()
            setStudent((prev) => ({ ...prev, resultVisibility: res.data.resultVisibility }))
            toast.success(next === "hidden" ? "Results hidden from public and parent views" : "Results published and visible")
        } catch (err) {
            toast.error(err || "Failed to update visibility")
        } finally {
            setToggling(false)
        }
    }

    if (loading) {
        return <PageLoading />
    }

    if (!student) {
        return (
            <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={() => navigate(`/${slug}/admin/students`)}>
                    <ArrowLeftIcon className="mr-2 size-4" /> Back to students
                </Button>
                <p className="text-sm text-muted-foreground">Student not found.</p>
            </div>
        )
    }

    const fullName = `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName}`
    const linkedParents = student.linkedParents || []

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate(`/${slug}/admin/students`)}>
                    <ArrowLeftIcon className="mr-2 size-4" /> Back
                </Button>
                <Button
                    variant={student.resultVisibility === "hidden" ? "default" : "outline"}
                    size="sm"
                    onClick={toggleVisibility}
                    disabled={toggling}
                >
                    {student.resultVisibility === "hidden" ? (
                        <><EyeIcon className="mr-2 size-4" /> Publish results</>
                    ) : (
                        <><EyeOffIcon className="mr-2 size-4" /> Hide results</>
                    )}
                </Button>
            </div>

            {student.resultVisibility === "hidden" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                    <EyeOffIcon className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p className="font-medium">Results are hidden</p>
                        <p className="text-amber-700/80 dark:text-amber-300/80">Parents and public visitors cannot view this student's results until you publish them again.</p>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-4 p-6">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/15">
                        <GraduationCapIcon className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{fullName}</h1>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-muted-foreground">
                            <span>{student.admissionNumber}</span>
                            <span>·</span>
                            <span>{student.currentClassId?.name ? `${student.currentClassId.name}${student.currentClassId.arm ? " " + student.currentClassId.arm : ""}` : "Unassigned"}</span>
                            <span>·</span>
                            <span className={`inline-flex items-center gap-1.5 font-medium ${student.status === "active" ? "text-green-600 dark:text-green-400" : student.status === "graduated" ? "text-brand" : "text-amber-600 dark:text-amber-400"}`}>
                                <span className={`size-1.5 rounded-full ${student.status === "active" ? "bg-green-500" : student.status === "graduated" ? "bg-brand" : "bg-amber-500"}`} />
                                <span className="capitalize">{student.status || "active"}</span>
                            </span>
                        </p>
                    </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border p-6 text-[0.8rem] sm:grid-cols-3">
                    <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{student.email || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Access PIN</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{student.accessPin || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Gender</dt>
                        <dd className="mt-0.5 font-medium capitalize text-foreground">{student.gender || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Age</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{student.age ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Date of birth</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd className="mt-0.5 font-medium capitalize text-foreground">{student.status || "active"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Result visibility</dt>
                        <dd className="mt-0.5 font-medium">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${student.resultVisibility === "hidden" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-green-500/10 text-green-600 dark:text-green-400"}`}>
                                {student.resultVisibility === "hidden" ? "Hidden" : "Visible"}
                            </span>
                        </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{student.address || "—"}</dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                        <dt className="text-muted-foreground">Likes / Interests</dt>
                        <dd className="mt-0.5 font-medium text-foreground whitespace-pre-line">{student.likes || "—"}</dd>
                    </div>
                </dl>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Linked Parents</h3>
                </div>
                {linkedParents.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground">No parents linked to this student yet.</p>
                ) : (
                    <div className="divide-y divide-border">
                        {linkedParents.map((parent) => (
                            <div key={parent._id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand dark:bg-brand/15">
                                        {parent.name?.[0]?.toUpperCase() || "P"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{parent.name}</p>
                                        <p className="text-xs text-muted-foreground">{parent.email}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{parent.phone || "—"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Results</h3>
                    {results.length > 0 && results[0].cycleId && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {results[0].cycleId.session} · {results[0].cycleId.term}
                        </p>
                    )}
                </div>
                {results.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground">No results recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-premium">
                            <thead>
                                <tr>
                                    <th className="text-left">Subject</th>
                                    <th className="text-left">Class</th>
                                    <th className="text-left">CA1</th>
                                    <th className="text-left">CA2</th>
                                    <th className="text-left">Exam</th>
                                    <th className="text-left">Total</th>
                                    <th className="text-left">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r._id}>
                                        <td className="font-medium text-foreground">{r.subjectId?.name || "—"}</td>
                                        <td className="text-muted-foreground">{r.classsId?.name || "—"}</td>
                                        <td className="text-muted-foreground">{r.ca1 ?? "—"}</td>
                                        <td className="text-muted-foreground">{r.ca2 ?? "—"}</td>
                                        <td className="text-muted-foreground">{r.exam ?? "—"}</td>
                                        <td className="font-medium text-foreground">{r.total ?? "—"}</td>
                                        <td className="text-foreground">{r.grade || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
