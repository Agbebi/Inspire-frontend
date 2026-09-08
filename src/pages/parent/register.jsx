import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { GraduationCapIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react"
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
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    subDomain: slug || "",
    phone: "",
  })
  const [otp, setOtp] = useState("")
  const [parentId, setParentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  async function handleRegister(e) {
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
        setParentId(res.data.data?._id || "")
        setStep(2)
        startCooldown()
        toast.success("Account created. Please verify your email.")
      } else {
        toast.error(res.data?.message || "Registration failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  function startCooldown() {
    setCooldown(60)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      return toast.error("Enter the 6-digit OTP")
    }
    setLoading(true)
    try {
      const res = await parentAPI.post("/parent/verify-otp", {
        parentId,
        otp,
      })
      if (res.data?.success && res.data.data?.token) {
        login(res.data.data)
        toast.success("Email verified successfully")
        navigate(`/${slug}/parent`)
      } else {
        toast.error(res.data?.message || "Verification failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !parentId) return
    setResending(true)
    try {
      const res = await parentAPI.post("/parent/resend-otp", {
        parentId,
      })
      if (res.data?.success) {
        toast.success("OTP resent successfully")
        startCooldown()
      } else {
        toast.error(res.data?.message || "Failed to resend OTP")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setResending(false)
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            {step === 1 ? "Create Parent Account" : "Verify your email"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 1
              ? "Then link your child with their access PIN"
              : `Enter the 6-digit code sent to ${form.email}`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subDomain">School code</Label>
              <Input
                id="subDomain"
                value={form.subDomain}
                readOnly
                disabled
                className="bg-muted"
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying…" : "Verify Email"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Didn't receive the code?"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="text-brand"
              >
                {resending ? "Sending…" : "Resend"}
              </Button>
            </div>
          </form>
        )}

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
