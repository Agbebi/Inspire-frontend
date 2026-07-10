import * as React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { UserIcon, MailIcon, LockIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useDispatch } from "react-redux"
import { registerSuperAdmin } from "@/store/superadmin/index"

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const step1Valid = formData.name.trim() && formData.email.trim()
  const step2Valid = formData.password.trim() && formData.confirmPassword.trim() && formData.password === formData.confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    if (!step2Valid) return

    setLoading(true)
    try {
      const result = await dispatch(registerSuperAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })).unwrap()
      toast.success("Super admin account created", {
        description: result?.data?.user?.name || "You can now log in.",
      })
      navigate("/auth/superadmin/login")
    } catch (error) {
      toast.error("Registration failed", {
        description: error || "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
          <UserIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create super admin account
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your super admin credentials in two steps.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className={`flex size-8 items-center justify-center rounded-full border text-xs font-medium ${step === 1 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          1
        </div>
        <div className={`h-px w-8 ${step === 2 ? "bg-primary" : "bg-border"}`} />
        <div className={`flex size-8 items-center justify-center rounded-full border text-xs font-medium ${step === 2 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          2
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UserIcon className="size-4" />
                Personal Information
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-10"
                />
              </div>

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
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <LockIcon className="size-4" />
                Security
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="h-10"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step === 2 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="gap-2"
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button
              type="button"
              size="lg"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="gap-2"
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={loading || !step2Valid}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          )}
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/superadmin/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
