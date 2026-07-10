import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

function LoadingSpinner({ className, size = "default" }) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2Icon className={cn("animate-spin text-brand", sizeClasses[size])} />
    </div>
  )
}

function PageLoading({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function CardLoading({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <LoadingSpinner size="default" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export { LoadingSpinner, PageLoading, CardLoading }
