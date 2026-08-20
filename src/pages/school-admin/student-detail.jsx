import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, GraduationCapIcon } from "lucide-react"

import API from "@/api/axios"
import { Button } from "@/components/ui/button"
import { PageLoading } from "@/components/ui/loading"

export default function StudentDetail() {
    const { slug, id } = useParams()
    const navigate = useNavigate()
    const [student, setStudent] = useState(null)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate(`/${slug}/admin/students`)}>
                    <ArrowLeftIcon className="mr-2 size-4" /> Back
                </Button>
            </div>

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
                        <dt className="text-muted-foreground">Status</dt>
                        <dd className="mt-0.5 font-medium capitalize text-foreground">{student.status || "active"}</dd>
                    </div>
                </dl>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Results</h3>
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
