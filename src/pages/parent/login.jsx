import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { GraduationCapIcon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import parentAPI from "@/api/parent"
import { useParentAuth } from "@/context/parent-auth"
import { toast } from "sonner"

export default function ParentLogin() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { login } = useParentAuth()
  const [form, setForm] = useState({ email: "", password: "", subDomain: slug || "" })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await parentAPI.post("/parent/login", {
        email: form.email,
        password: form.password,
        subDomain: (form.subDomain || slug || "").toLowerCase(),
      })
      if (res.data?.success) {
        login(res.data.data)
        toast.success("Login successful")
        navigate(`/${slug}/parent`)
      } else {
        toast.error(res.data?.message || "Login failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-sm">
        <div className="mb-6">
          <Link
            to={`/auth/school/${slug}/login`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to school login
          </Link>
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[0_0_20px_var(--brand-glow)]">
            <GraduationCapIcon className="size-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Parent Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to follow your child&apos;s progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subDomain">School code</Label>
            <Input
              id="subDomain"
              value={form.subDomain}
              onChange={(e) => setForm((p) => ({ ...p, subDomain: e.target.value }))}
              placeholder="e.g. greensprings"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to={`/${slug}/parent/register`} className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
