import { createContext, useContext, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCycles, setSelectedCycle } from "@/store/admin/cycleSlice"
import { CycleContext } from "@/components/common/cycle-context"

export function CycleProvider({ children }) {
    const dispatch = useDispatch()
    const { items, selectedCycleId, loading } = useSelector((state) => state.cycle)

    useEffect(() => {
        dispatch(fetchCycles())
    }, [dispatch])

    useEffect(() => {
        if (!selectedCycleId && items.length > 0) {
            const current = items.find((c) => c.isCurrent)
            dispatch(setSelectedCycle((current || items[0])._id))
        }
    }, [items, selectedCycleId, dispatch])

    const value = useMemo(() => ({
        cycles: items,
        loading,
        selectedCycleId,
        selectedCycle: items.find((c) => c._id === selectedCycleId) || null,
        setCycleId: (id) => dispatch(setSelectedCycle(id)),
    }), [items, loading, selectedCycleId, dispatch])

    return (
        <CycleContext.Provider value={value}>
            {children}
        </CycleContext.Provider>
    )
}
