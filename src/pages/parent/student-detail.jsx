import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { TriangleAlertIcon } from "lucide-react"
import parentAPI from "@/api/parent"
import TrendChart from "@/components/parent/TrendChart"

function getGradeColor(grade) {
  switch (grade) {
    case "A": return "text-green-600 bg-green-500/10"
    case "B": return "text-blue-600 bg-blue-500/10"
    case "C": return "text-yellow-600 bg-yellow-500/10"
    case "D": return "text-orange-600 bg-orange-500/10"
    case "F": return "text-red-600 bg-red-500/10"
    default: return "text-muted-foreground bg-muted"
  }
}

export default function ParentStudentDetail() {
  const { id } = useParams()
  const [cycles, setCycles] = useState([])
  const [selectedCycle, setSelectedCycle] = useState("")
  const [results, setResults] = useState([])
  const [report, setReport] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [trend, setTrend] = useState([])
  const [risk, setRisk] = useState({ isAtRisk: false, reasons: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [cRes, rRes, pRes, tRes, riskRes] = await Promise.all([
          parentAPI.get("/parent/cycles"),
          parentAPI.get(`/parent/students/${id}/results`),
          parentAPI.get(`/parent/students/${id}/performance`),
          parentAPI.get(`/parent/students/${id}/trend`),
          parentAPI.get(`/parent/students/${id}/at-risk`),
        ])
        setResults(rRes.data?.data?.scores || [])
        setCycles(cRes.data?.data || [])
        setPerformance(pRes.data?.data || null)
        setTrend(tRes.data?.data || [])
        setRisk(riskRes.data?.data || { isAtRisk: false, reasons: [] })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!selectedCycle) return
    parentAPI
      .get(`/parent/students/${id}/report`, { params: { cycleId: selectedCycle } })
      .then((res) => setReport(res.data?.data || null))
      .catch(() => setReport(null))
  }, [selectedCycle, id])

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Child Profile</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {loading ? "Loading…" : (performance?.student?.name || "Student")}
        </h1>
        <p className="text-base text-muted-foreground">
          {performance?.student?.classSize ? `Position ${performance.student.position} of ${performance.student.classSize} · Average ${performance.student.average ?? "—"}%` : ""}
        </p>
      </header>

      {risk?.isAtRisk && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Performance needs attention</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
              {risk.reasons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Average</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {performance?.student?.average ?? "—"}<span className="text-base text-muted-foreground">%</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Class Position</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {performance?.student?.position ?? "—"}
            <span className="text-base text-muted-foreground">/{performance?.student?.classSize ?? "—"}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Class Average</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {performance?.class?.average ?? "—"}<span className="text-base text-muted-foreground">%</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-7">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Current Term Results</h2>
        <p className="mt-1 text-sm text-muted-foreground">Latest published scores for this child.</p>
        {results.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No results recorded yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="table-premium min-w-[640px] whitespace-nowrap">
              <thead>
                <tr>
                  <th className="text-left">Subject</th>
                  <th className="text-left">CA1</th>
                  <th className="text-left">CA2</th>
                  {results.some((r) => r.ca3 != null) && <th className="text-left">CA3</th>}
                  <th className="text-left">Exam</th>
                  <th className="text-left">Total</th>
                  <th className="text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td className="font-medium text-foreground">{r.subject}</td>
                    <td className="text-muted-foreground">{r.ca1 ?? "—"}</td>
                    <td className="text-muted-foreground">{r.ca2 ?? "—"}</td>
                    {results.some((x) => x.ca3 != null) && <td className="text-muted-foreground">{r.ca3 ?? "—"}</td>}
                    <td className="text-muted-foreground">{r.exam ?? "—"}</td>
                    <td className="font-medium text-foreground">{r.total ?? "—"}</td>
                    <td>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${getGradeColor(r.grade)}`}>
                        {r.grade || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Report Card</h2>
            <p className="text-sm text-muted-foreground">Choose a session and term to view.</p>
          </div>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="select-premium sm:w-56"
          >
            <option value="">Select session / term</option>
            {cycles.map((c) => (
              <option key={c._id} value={c._id}>{c.session} — {c.term}</option>
            ))}
          </select>
        </div>

        {!selectedCycle ? (
          <p className="mt-6 text-sm text-muted-foreground">Select a session/term above to load the full report card.</p>
        ) : !report ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading report card…</p>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{report.student?.name}</span>
              <span className="text-muted-foreground">
                {report.summary?.position ? `Position ${report.summary.position}/${report.summary.classSize}` : ""} · Avg {report.summary?.average ?? "—"}%
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="table-premium min-w-[640px] whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="text-left">Subject</th>
                    <th className="text-left">CA1</th>
                    <th className="text-left">CA2</th>
                    <th className="text-left">Exam</th>
                    <th className="text-left">Total</th>
                    <th className="text-left">Grade</th>
                    <th className="text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {report.scores.map((r) => (
                    <tr key={r._id}>
                      <td className="font-medium text-foreground">{r.subject}</td>
                      <td className="text-muted-foreground">{r.ca1 ?? "—"}</td>
                      <td className="text-muted-foreground">{r.ca2 ?? "—"}</td>
                      <td className="text-muted-foreground">{r.exam ?? "—"}</td>
                      <td className="font-medium text-foreground">{r.total ?? "—"}</td>
                      <td>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${getGradeColor(r.grade)}`}>
                          {r.grade || "—"}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{r.remark || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-7">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Performance Trend</h2>
        <p className="mt-1 text-sm text-muted-foreground">Average score across all published terms.</p>
        <div className="mt-6">
          <TrendChart data={trend} />
        </div>
      </section>

      {performance?.subjectAverages?.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-7">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Class Subject Averages</h2>
          <p className="mt-1 text-sm text-muted-foreground">How the class performed per subject this term.</p>
          <div className="mt-6 space-y-3">
            {performance.subjectAverages.map((s) => (
              <div key={s.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{s.subject}</span>
                  <span className="text-muted-foreground">{s.average}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(s.average, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
