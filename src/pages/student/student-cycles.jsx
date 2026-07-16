import { useEffect, useState } from "react"
import { useNavigate, useParams, Link, useLocation } from "react-router-dom"
import { GraduationCapIcon, HomeIcon, LockIcon, ClipboardCheckIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import API from "@/api/axios"
import { toast } from "sonner"

export default function StudentCycles() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [student, setStudent] = useState(null)
    const [cycles, setCycles] = useState([])

    useEffect(() => {
        async function loadCycles() {
            const state = location.state
            if (!state?.admissionNumber || !state?.accessPin) {
                navigate(`/${slug}/student/login`)
                return
            }

            setLoading(true)
            try {
                const res = await API.get("/api/results/public/cycles", {
                    params: {
                        admissionNumber: state.admissionNumber,
                        accessPin: state.accessPin
                    }
                })
                if (res.data?.success && res.data?.data) {
                    setStudent(res.data.data.student)
                    setCycles(res.data.data.cycles || [])
                } else {
                    toast.error(res.data?.message || "Failed to load available results")
                }
            } catch {
                toast.error("Failed to load available results")
            } finally {
                setLoading(false)
            }
        }
        loadCycles()
    }, [slug, navigate, location])

    function handleSelectCycle(cycleId) {
        const state = location.state
        navigate(`/${slug}/student/results`, {
            state: {
                admissionNumber: state?.admissionNumber,
                accessPin: state?.accessPin,
                cycleId
            }
        })
    }

    if (loading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">Loading available results…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link
                    to="/"
                    aria-label="Back to home"
                    className="rounded-md border border-primary/20 bg-primary/5 p-1.5 text-primary transition-colors hover:bg-primary/10"
                >
                    <HomeIcon className="size-4" />
                </Link>
                <ThemeToggle />
            </div>

            <div className="w-full max-w-lg space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCapIcon className="size-5" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">Welcome, {student?.firstName}</h1>
                    <p className="text-sm text-muted-foreground">
                        Select a session/term to view your result
                    </p>
                </div>

                {cycles.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardCheckIcon className="size-10 text-muted-foreground" />
                            <h3 className="mt-4 text-sm font-medium">No results available</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Results have not been published yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {cycles.map((cycle) => (
                            <Card
                                key={cycle._id}
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => handleSelectCycle(cycle._id)}
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium">{cycle.session} — {cycle.term}</p>
                                    </div>
                                    {cycle.isLocked && (
                                        <LockIcon className="size-4 text-muted-foreground" />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
