import { useEffect, useState, useMemo } from "react"
import { BarChart3Icon, TrendingUpIcon, FileSpreadsheetIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/loading"
import CycleSelector from "@/components/common/cycle-selector"
import { useCycle } from "@/components/common/use-cycle"
import SubjectDoughnut from "@/components/common/subject-doughnut"
import API from "@/api/axios"
import { toast } from "sonner"

function getGradeColor(grade) {
    switch (grade) {
        case 'A': return 'text-green-600 bg-green-500/10'
        case 'B': return 'text-blue-600 bg-blue-500/10'
        case 'C': return 'text-yellow-600 bg-yellow-500/10'
        case 'D': return 'text-orange-600 bg-orange-500/10'
        case 'F': return 'text-red-600 bg-red-500/10'
        default: return 'text-muted-foreground bg-muted'
    }
}

export default function Analytics() {
    const { selectedCycleId, selectedCycle } = useCycle()
    const [classes, setClasses] = useState([])
    const [classId, setClassId] = useState("")
    const [broadsheet, setBroadsheet] = useState(null)
    const [performance, setPerformance] = useState(null)
    const [cumulative, setCumulative] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function loadClasses() {
            try {
                const res = await API.get("/api/school/manage/classes")
                setClasses(res.data?.data || [])
                if (res.data?.data?.length > 0) setClassId(res.data.data[0]._id)
            } catch {
                setClasses([])
            }
        }
        loadClasses()
    }, [])

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const perf = await API.get("/api/school/manage/analytics/performance", {
                    params: selectedCycleId ? { cycleId: selectedCycleId } : {},
                })
                setPerformance(perf.data?.data || null)

                const cum = await API.get("/api/school/manage/analytics/cumulative")
                setCumulative(cum.data?.data || null)

                if (classId && selectedCycleId) {
                    const sheet = await API.get("/api/school/manage/analytics/broadsheet", {
                        params: { classId, cycleId: selectedCycleId },
                    })
                    setBroadsheet(sheet.data?.data || null)
                } else {
                    setBroadsheet(null)
                }
            } catch {
                toast.error("Failed to load analytics")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [classId, selectedCycleId])

    const cumGrades = useMemo(() => {
        if (!cumulative?.perCycle) return []
        return cumulative.perCycle
    }, [cumulative])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Insights</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        {selectedCycle ? `${selectedCycle.session} — ${selectedCycle.term}` : "All terms"} performance overview.
                    </p>
                </div>
                <CycleSelector />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Term Average
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{performance?.average ?? "—"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            CGPA (Cumulative)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold flex items-center gap-2">
                            {cumulative?.cgpa ?? "—"}
                            <TrendingUpIcon className="size-5 text-muted-foreground" />
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Results Recorded
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{performance?.resultCount ?? 0}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3Icon className="size-4" /> Subject Averages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!performance || performance.subjectAverages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No data for this term yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {performance.subjectAverages.map((s) => (
                                    <SubjectDoughnut key={s.name} name={s.name} average={s.average} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Grade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!performance || Object.keys(performance.gradeDist || {}).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No data for this term yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(performance.gradeDist).map(([grade, count]) => (
                                    <span
                                        key={grade}
                                        className={`inline-flex items-center rounded-xl px-3 py-1 text-[0.8rem] font-bold ${getGradeColor(grade)}`}
                                    >
                                        {grade}: {count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileSpreadsheetIcon className="size-4" /> Class Broadsheet
                    </CardTitle>
                    <select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="select-premium w-full max-w-sm text-xs sm:w-56"
                    >
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</option>
                        ))}
                    </select>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <PageLoading message="Loading broadsheet…" />
                    ) : !broadsheet || broadsheet.rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No results for this class in the selected term.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th className="text-left">Position</th>
                                        <th className="text-left">Student</th>
                                        <th className="text-right">Total</th>
                                        <th className="text-right">Average</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {broadsheet.rows.map((row) => (
                                        <tr key={row.studentId}>
                                            <td className="font-medium text-foreground">{row.position}</td>
                                            <td className="font-medium text-foreground">
                                                {row.lastName} {row.firstName}
                                                <span className="ml-2 text-xs text-muted-foreground">{row.admissionNumber}</span>
                                            </td>
                                            <td className="text-right text-muted-foreground">{row.total}</td>
                                            <td className="text-right text-muted-foreground">{row.average}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Cumulative Term Averages</CardTitle>
                </CardHeader>
                <CardContent>
                    {!cumulative || cumGrades.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No cumulative data yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th className="text-left">Session</th>
                                        <th className="text-left">Term</th>
                                        <th className="text-right">Subjects</th>
                                        <th className="text-right">Total</th>
                                        <th className="text-right">Average</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cumGrades.map((c) => (
                                        <tr key={c.cycleId}>
                                            <td className="font-medium text-foreground">{c.session}</td>
                                            <td className="text-muted-foreground">{c.term}</td>
                                            <td className="text-right text-muted-foreground">{c.subjects}</td>
                                            <td className="text-right text-muted-foreground">{c.total}</td>
                                            <td className="text-right font-medium text-foreground">{c.average}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t border-border font-semibold">
                                        <td className="text-foreground" colSpan={3}>CGPA</td>
                                        <td className="text-right text-foreground">{cumulative.grandTotal}</td>
                                        <td className="text-right text-foreground">{cumulative.cgpa}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
