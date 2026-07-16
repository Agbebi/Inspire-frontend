import { useEffect, useState, useMemo } from "react"
import { BarChart3Icon, TrendingUpIcon, FileSpreadsheetIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/loading"
import CycleSelector from "@/components/common/cycle-selector"
import { useCycle } from "@/components/common/use-cycle"
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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
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
                            <div className="space-y-2">
                                {performance.subjectAverages.map((s) => (
                                    <div key={s.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{s.name}</span>
                                            <span className="text-muted-foreground">{s.average}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-brand"
                                                style={{ width: `${Math.min((s.average / 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
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
                                        className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-bold ${getGradeColor(grade)}`}
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
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileSpreadsheetIcon className="size-4" /> Class Broadsheet
                    </CardTitle>
                    <select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="h-9 rounded-lg border border-border bg-background px-3 pr-8 text-sm"
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
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="table-header-brand border-b border-border text-left text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Position</th>
                                        <th className="px-3 py-2 font-medium">Student</th>
                                        <th className="px-3 py-2 font-medium text-right">Total</th>
                                        <th className="px-3 py-2 font-medium text-right">Average</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {broadsheet.rows.map((row) => (
                                        <tr key={row.studentId} className="transition-colors hover:bg-muted/50">
                                            <td className="px-3 py-2 font-medium">{row.position}</td>
                                            <td className="px-3 py-2 font-medium">
                                                {row.lastName} {row.firstName}
                                                <span className="ml-2 text-xs text-muted-foreground">{row.admissionNumber}</span>
                                            </td>
                                            <td className="px-3 py-2 text-right">{row.total}</td>
                                            <td className="px-3 py-2 text-right">{row.average}</td>
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
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="table-header-brand border-b border-border text-left text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Session</th>
                                        <th className="px-3 py-2 font-medium">Term</th>
                                        <th className="px-3 py-2 font-medium text-right">Subjects</th>
                                        <th className="px-3 py-2 font-medium text-right">Total</th>
                                        <th className="px-3 py-2 font-medium text-right">Average</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {cumGrades.map((c) => (
                                        <tr key={c.cycleId} className="transition-colors hover:bg-muted/50">
                                            <td className="px-3 py-2 font-medium">{c.session}</td>
                                            <td className="px-3 py-2">{c.term}</td>
                                            <td className="px-3 py-2 text-right">{c.subjects}</td>
                                            <td className="px-3 py-2 text-right">{c.total}</td>
                                            <td className="px-3 py-2 text-right font-medium">{c.average}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t border-border font-semibold">
                                        <td className="px-3 py-2" colSpan={3}>CGPA</td>
                                        <td className="px-3 py-2 text-right">{cumulative.grandTotal}</td>
                                        <td className="px-3 py-2 text-right">{cumulative.cgpa}</td>
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
