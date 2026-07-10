import * as React from "react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, GlobeIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSuperAdmin } from "@/store/superadmin/index"

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await dispatch(loginSuperAdmin({ email, password })).unwrap()
      toast.success("Signed in successfully", {
        description: `Welcome back, ${result?.data?.user?.name || 'admin'}.`,
      })
      navigate("/superadmin/dashboard")
    } catch (error) {
      toast.error("Login failed", {
        description: error || "Invalid email or password.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
          <ShieldCheckIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Super Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Access the platform administration dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@platform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pl-9 pr-10"
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

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="size-4 rounded border-input accent-primary"
          />
          <Label htmlFor="remember" className="font-normal text-muted-foreground">
            Keep me signed in
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/auth/superadmin/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  )
}
