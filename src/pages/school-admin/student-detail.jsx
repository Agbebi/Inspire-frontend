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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate(`/${slug}/admin/students`)}>
                    <ArrowLeftIcon className="mr-2 size-4" /> Back
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <GraduationCapIcon className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">{fullName}</h1>
                        <p className="text-sm text-muted-foreground">
                            {student.admissionNumber} · {student.currentClassId?.name ? `${student.currentClassId.name}${student.currentClassId.arm ? " " + student.currentClassId.arm : ""}` : "Unassigned"} · {student.status || "active"}
                        </p>
                    </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">{student.email || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Access PIN</dt>
                        <dd className="font-medium">{student.accessPin || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd className="font-medium capitalize">{student.status || "active"}</dd>
                    </div>
                </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-medium">Results</h3>
                {results.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">No results recorded yet.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">Subject</th>
                                    <th className="px-3 py-2 font-medium">Class</th>
                                    <th className="px-3 py-2 font-medium">CA1</th>
                                    <th className="px-3 py-2 font-medium">CA2</th>
                                    <th className="px-3 py-2 font-medium">Exam</th>
                                    <th className="px-3 py-2 font-medium">Total</th>
                                    <th className="px-3 py-2 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {results.map((r) => (
                                    <tr key={r._id}>
                                        <td className="px-3 py-2 font-medium">{r.subjectId?.name || "—"}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{r.classsId?.name || "—"}</td>
                                        <td className="px-3 py-2">{r.ca1 ?? "—"}</td>
                                        <td className="px-3 py-2">{r.ca2 ?? "—"}</td>
                                        <td className="px-3 py-2">{r.exam ?? "—"}</td>
                                        <td className="px-3 py-2">{r.total ?? "—"}</td>
                                        <td className="px-3 py-2">{r.grade || "—"}</td>
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
