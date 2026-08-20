import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { GraduationCapIcon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import parentAPI from "@/api/parent"
import { useParentAuth } from "@/context/parent-auth"
import { toast } from "sonner"

export default function ParentRegister() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { login } = useParentAuth()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    subDomain: slug || "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      return toast.error("Passwords do not match")
    }
    setLoading(true)
    try {
      const res = await parentAPI.post("/parent/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        subDomain: (form.subDomain || slug || "").toLowerCase(),
      })
      if (res.data?.success) {
        login(res.data.data)
        toast.success("Account created")
        navigate(`/${slug}/parent`)
      } else {
        toast.error(res.data?.message || "Registration failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Create Parent Account</h1>
          <p className="text-sm text-muted-foreground">Then link your child with their access PIN</p>
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
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Doe"
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
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to={`/${slug}/parent/login`} className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
