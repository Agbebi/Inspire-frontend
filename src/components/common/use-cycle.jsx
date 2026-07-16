import { useContext } from "react"
import { CycleContext } from "@/components/common/cycle-context"

export function useCycle() {
    const ctx = useContext(CycleContext)
    if (!ctx) {
        throw new Error("useCycle must be used within a CycleProvider")
    }
    return ctx
}
