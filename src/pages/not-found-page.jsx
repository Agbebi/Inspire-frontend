import { Link, useLocation } from "react-router-dom"
import { SearchIcon, GraduationCapIcon, Building2Icon, ShieldCheckIcon, HomeIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  const location = useLocation()
  const currentSlug = location.pathname.split('/')[1]

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-lg font-medium">Page not found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 w-full max-w-lg">
        <Link to="/auth/school/find" className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
          <SearchIcon className="size-4" />
          Find School
        </Link>

        {currentSlug && (
          <Link to={`/${currentSlug}/student/login`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <GraduationCapIcon className="size-4" />
            Student Portal
          </Link>
        )}

        {currentSlug && (
          <Link to={`/${currentSlug}/admin/dashboard`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <ShieldCheckIcon className="size-4" />
            Admin
          </Link>
        )}

        {currentSlug && (
          <Link to={`/${currentSlug}/teacher/dashboard`} className={buttonVariants({ variant: "outline", className: "justify-start gap-2" })}>
            <Building2Icon className="size-4" />
            Teacher
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
