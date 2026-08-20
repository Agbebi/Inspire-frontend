import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { UsersIcon, TriangleAlertIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import parentAPI from "@/api/parent"
import { useParentAuth } from "@/context/parent-auth"
import { toast } from "sonner"

function initialsOf(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function ParentDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { parentAuth } = useParentAuth()
  const parentName = parentAuth?.user?.name || "Parent"

  const [students, setStudents] = useState([])
  const [risk, setRisk] = useState({})
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [linkForm, setLinkForm] = useState({ admissionNumber: "", accessPin: "" })

  async function loadStudents() {
    setLoading(true)
    try {
      const res = await parentAPI.get("/parent/students")
      const list = res.data?.data || []
      setStudents(list)
      const riskMap = {}
      await Promise.all(
        list.map(async (s) => {
          try {
            const r = await parentAPI.get(`/parent/students/${s._id}/at-risk`)
            riskMap[s._id] = r.data?.data || { isAtRisk: false, reasons: [] }
          } catch {
            riskMap[s._id] = { isAtRisk: false, reasons: [] }
          }
        })
      )
      setRisk(riskMap)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents()
  }, [])

  async function handleLink(e) {
    e.preventDefault()
    setLinking(true)
    try {
      const res = await parentAPI.post("/parent/students/link", {
        admissionNumber: linkForm.admissionNumber,
        accessPin: linkForm.accessPin,
      })
      if (res.data?.success) {
        toast.success("Child linked")
        setLinkForm({ admissionNumber: "", accessPin: "" })
        loadStudents()
      } else {
        toast.error(res.data?.message || "Could not link student")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not link student")
    } finally {
      setLinking(false)
    }
  }

  const atRiskCount = Object.values(risk).filter((r) => r?.isAtRisk).length

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Parent Portal</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
          Welcome, {parentName}
        </h1>
        <p className="text-base text-muted-foreground">Follow your child&apos;s academic progress in real time.</p>
      </header>

      {atRiskCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {atRiskCount} child{atRiskCount !== 1 ? "ren" : ""} need attention
            </p>
            <p className="text-sm text-muted-foreground">
              One or more of your children has a low average or declining performance. Open their profile for details.
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Your Children</h2>
              <p className="text-sm text-muted-foreground">Tap a child to view results and performance.</p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
          ) : students.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <UsersIcon className="size-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">No children linked yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Use the form to link a child with their access PIN.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {students.map((s) => {
                const isRisk = risk[s._id]?.isAtRisk
                return (
                  <button
                    key={s._id}
                    onClick={() => navigate(`/${slug}/parent/students/${s._id}`)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-brand/30"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand dark:bg-brand/15">
                      {initialsOf(`${s.firstName} ${s.lastName}`)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.className}{s.classArm ? ` ${s.classArm}` : ""} · {s.admissionNumber}
                      </p>
                    </div>
                    {isRisk && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.7rem] font-medium text-amber-600 dark:text-amber-400">
                        <TriangleAlertIcon className="size-3" /> At risk
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Link a Child</h2>
            <p className="text-sm text-muted-foreground">Enter the admission number and access PIN from the school.</p>
          </div>
          <form onSubmit={handleLink} className="mt-6 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="admissionNumber">Admission number</Label>
              <Input
                id="admissionNumber"
                value={linkForm.admissionNumber}
                onChange={(e) => setLinkForm((p) => ({ ...p, admissionNumber: e.target.value }))}
                placeholder="e.g. GRD/001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessPin">Access PIN</Label>
              <Input
                id="accessPin"
                value={linkForm.accessPin}
                onChange={(e) => setLinkForm((p) => ({ ...p, accessPin: e.target.value }))}
                placeholder="e.g. 1234"
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={linking}>
              <PlusIcon className="size-4" /> {linking ? "Linking…" : "Link Child"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
