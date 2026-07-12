import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { GraduationCapIcon, HomeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import API from "@/api/axios"
import { toast } from "sonner"

export default function StudentLogin() {
    const { slug } = useParams()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [admissionNumber, setAdmissionNumber] = useState("")
    const [accessPin, setAccessPin] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleAdmissionSubmit(e) {
        e.preventDefault()
        if (!admissionNumber.trim()) {
            toast.error("Please enter your admission number")
            return
        }
        setStep(2)
    }

    async function handlePinSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await API.get("/api/results/public", {
                params: { admissionNumber, accessPin }
            })
            if (res.data?.success && res.data?.data) {
                navigate(`/${slug}/student/results`, {
                    state: { resultData: res.data.data }
                })
            } else {
                toast.error(res.data?.message || "Invalid credentials")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
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
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCapIcon className="size-5" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">Student Result Portal</h1>
                    <p className="text-sm text-muted-foreground">
                        {step === 1
                            ? "Enter your admission number to continue"
                            : "Enter your access PIN to view your results"}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleAdmissionSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admissionNumber">Admission Number</Label>
                            <Input
                                id="admissionNumber"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                                placeholder="e.g. SCH/2026/001"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full">Continue</Button>
                    </form>
                ) : (
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accessPin">Access PIN</Label>
                            <Input
                                id="accessPin"
                                type="password"
                                value={accessPin}
                                onChange={(e) => setAccessPin(e.target.value)}
                                placeholder="Enter your 6-digit PIN"
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Admission number: {admissionNumber}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Verifying…" : "View Results"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
