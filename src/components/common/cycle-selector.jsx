import { CalendarIcon } from "lucide-react"
import { useCycle } from "@/components/common/use-cycle"

export default function CycleSelector({ className = "" }) {
    const { cycles, selectedCycleId, setCycleId, loading } = useCycle()

    if (!cycles || cycles.length === 0) {
        return (
            <div className={`rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground ${className}`}>
                No academic cycle yet
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <CalendarIcon className="size-4 text-muted-foreground" />
            <select
                value={selectedCycleId || ""}
                onChange={(e) => setCycleId(e.target.value)}
                disabled={loading}
                className="h-9 rounded-lg border border-border bg-background px-3 pr-8 text-sm font-medium"
                aria-label="Select academic cycle"
            >
                {cycles.map((c) => (
                    <option key={c._id} value={c._id}>
                        {c.session} — {c.term}{c.isCurrent ? " (Current)" : ""}{c.isPublished ? " • Published" : ""}
                    </option>
                ))}
            </select>
        </div>
    )
}
