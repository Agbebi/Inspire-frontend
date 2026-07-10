import { Link } from "react-router-dom"
import { Building2Icon, SearchIcon, HelpCircleIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

const SUPPORT_EMAIL = "support@result-management.app"

export default function SchoolNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
        <Building2Icon className="size-6" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          School not found
        </h1>
        <p className="text-sm text-muted-foreground">
          We couldn't find a school for this address. It may have been removed
          or the link is incorrect.
        </p>
      </div>

      <Link to="/auth/school/find" className={buttonVariants({ size: "lg", className: "w-full" })}>
        <SearchIcon className="mr-2 size-4" />
        Find your school
      </Link>

      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("My school is missing")}`}
        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        <HelpCircleIcon className="mr-1 inline size-3.5 align-text-bottom" />
        Contact admin
      </a>
    </div>
  )
}
