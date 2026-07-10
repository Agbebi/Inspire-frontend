import { Link, useLocation } from "react-router-dom"
import { ShieldAlertIcon, HomeIcon, GraduationCapIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const location = useLocation()
  const currentSlug = location.pathname.split('/')[1]

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-destructive">
          <ShieldAlertIcon className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Unauthorized</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don't have permission to access this page. Please use the correct portal for your role.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 w-full max-w-lg">
        {currentSlug && (
          <Link to={`/${currentSlug}/student/login`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <GraduationCapIcon className="size-4" />
            Student Portal
          </Link>
        )}

        {currentSlug && (
          <Link to={`/${currentSlug}/admin/dashboard`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <ShieldAlertIcon className="size-4" />
            Admin Portal
          </Link>
        )}

        {currentSlug && (
          <Link to={`/${currentSlug}/teacher/dashboard`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <ShieldAlertIcon className="size-4" />
            Teacher Portal
          </Link>
        )}

        <Link to="/" className={buttonVariants({ variant: "outline", className: "justify-start gap-2 sm:col-span-2" })}>
          <HomeIcon className="size-4" />
          Go to homepage
        </Link>
      </div>
    </div>
  )
}
