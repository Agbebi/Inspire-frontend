import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, Loader2Icon, SchoolIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import API from "@/api/axios"

export default function LoginSchool() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [loadingSchool, setLoadingSchool] = useState(true)

  useEffect(() => {
    if (!slug) {
      navigate("/auth/school/find")
      return
    }

    async function loadSchool() {
      setLoadingSchool(true)
      try {
        const response = await API.get(`/api/school/info/${slug}`)
        setSchoolName(response.data.data.name)
      } catch {
        navigate(`/auth/school/${slug}/not-found`)
      } finally {
        setLoadingSchool(false)
      }
    }

    loadSchool()
  }, [slug, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await API.post("/api/school/login", {
        email,
        password,
        subDomain: slug,
      })

      const { user, token } = response.data.data

      localStorage.setItem("school_auth", JSON.stringify({ user, token }))

      toast.success("Signed in successfully", {
        description: `Welcome back, ${user.name}.`,
      })

      if (user.role === "admin") {
        navigate(`/${slug}/admin/dashboard`)
      } else if (user.role === "teacher") {
        navigate(`/${slug}/teacher/dashboard`)
      } else if (user.role === "student") {
        navigate(`/${slug}/student/dashboard`)
      } else {
        navigate(`/${slug}/admin/dashboard`)
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again."
      setError(message)
      toast.error("Login failed", {
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  const displayName = schoolName || slug

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
          <SchoolIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {loadingSchool ? "Sign in" : `Sign in to ${displayName}`}
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to access your school portal.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 pl-9"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="#"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
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
              disabled={loading}
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

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        <Link
          to="/auth/school/find"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to school search
        </Link>
      </div>
    </div>
  )
}
