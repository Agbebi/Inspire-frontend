import { useLocation, useParams } from "react-router-dom"
import { ArrowLeftIcon, SchoolIcon, ClipboardCheckIcon, PrinterIcon, CalendarIcon, CheckCircle2Icon } from "lucide-react"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import API from "@/api/axios"
import { toast } from "sonner"

function getGradeColor(grade) {
    switch (grade) {
        case 'A': return 'text-green-600 bg-green-500/10'
        case 'B': return 'text-blue-600 bg-blue-500/10'
        case 'C': return 'text-yellow-600 bg-yellow-500/10'
        case 'D': return 'text-orange-600 text-orange-500/10'
        case 'F': return 'text-red-600 bg-red-500/10'
        default: return 'text-muted-foreground bg-muted'
    }
}

function toSentenceCase(str) {
    if (!str) return "—"
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function StudentResultView() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, setTheme } = useTheme()

    const [resultData, setResultData] = useState(null)
    const [loading, setLoading] = useState(true)

    const { admissionNumber, accessPin, cycleId } = location.state || {}

    useEffect(() => {
        async function loadResults() {
            if (!admissionNumber || !accessPin || !cycleId) {
                navigate(`/${slug}/student/cycles`, { state: { admissionNumber, accessPin } })
                return
            }

            setLoading(true)
            try {
                const res = await API.get("/api/results/public", {
                    params: { admissionNumber, accessPin, cycleId }
                })
                if (res.data?.success && res.data?.data) {
                    setResultData(res.data.data)
                } else {
                    toast.error(res.data?.message || "Failed to load results")
                }
            } catch {
                toast.error("Failed to load results")
            } finally {
                setLoading(false)
            }
        }
        loadResults()
    }, [admissionNumber, accessPin, cycleId, slug, navigate])

    if (loading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">Loading results…</p>
                </div>
            </div>
        )
    }

    if (!resultData) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">No result data found.</p>
                    <Button onClick={() => navigate(`/${slug}/student/cycles`, { state: { admissionNumber, accessPin } })}>
                        Back to Results
                    </Button>
                </div>
            </div>
        )
    }

    const { student, school, gradingScale, scores, principalRemark, position, totalInClass, subjectsOffered, totalScore, averageScore, cycle } = resultData
    const caCount = school?.caConfig?.caCount || 3

    const positionRank = position ? position.split(' out of ')[0] : null
    const positionTotal = totalInClass ? `out of ${totalInClass}` : null

    const computedTotalScore = totalScore ?? scores.reduce((sum, s) => sum + (s.total || 0), 0)
    const computedAverageScore = averageScore ?? (scores.length > 0 ? (computedTotalScore / scores.length).toFixed(2) : "0.00")
    const computedSubjectsOffered = subjectsOffered ?? scores.length

    const avgForGrade = Number(computedAverageScore)

    const overallGrade = gradingScale && gradingScale.length > 0
        ? gradingScale.find((g) => avgForGrade >= g.minScore && avgForGrade <= g.maxScore)?.grade || "—"
        : "—"

    const overallRemark = gradingScale && gradingScale.length > 0
        ? gradingScale.find((g) => avgForGrade >= g.minScore && avgForGrade <= g.maxScore)?.remark || "—"
        : "—"

    const displayPrincipalRemark = principalRemark || (() => {
        if (!gradingScale || gradingScale.length === 0) return "Keep striving for excellence."
        const match = gradingScale.find((g) => avgForGrade >= g.minScore && avgForGrade <= g.maxScore)
        if (!match) return "Keep striving for excellence."
        switch (match.grade) {
            case 'A': return "Excellent performance! The student has demonstrated outstanding academic achievement and consistency across all subjects. Keep up the exceptional work."
            case 'B': return "Very Good performance! The student has shown strong academic capability. With continued effort, excellence is within reach."
            case 'C': return "Good performance! The student has achieved satisfactory results. Consistent effort and dedication will lead to even better outcomes."
            case 'D': return "Fair performance. The student is encouraged to put in more effort and seek additional support to improve academic outcomes."
            case 'F': return "The student needs significant improvement. Immediate intervention, extra coaching, and closer monitoring are strongly recommended."
            default: return "Keep striving for excellence."
        }
    })()

    const currentDate = new Date().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    function handlePrint() {
        const previousTheme = theme
        setTheme('light')
        const doPrint = () => {
            window.onafterprint = () => {
                setTheme(previousTheme)
                window.onafterprint = null
            }
            window.print()
        }
        const nextFrame = () => requestAnimationFrame(() => requestAnimationFrame(doPrint))
        if (document.fonts?.ready) {
            document.fonts.ready.then(nextFrame).catch(nextFrame)
        } else {
            nextFrame()
        }
    }

    const sessionTermLabel = cycle ? `${cycle.session} — ${cycle.term}` : ""

    return (
        <div className="result-print-root min-h-svh overflow-auto bg-muted/30 p-4 lg:p-8">
            <style>{`
                @media print {
                    :root {
                        --background: #ffffff !important;
                        --foreground: #000000 !important;
                        --card: #ffffff !important;
                        --card-foreground: #000000 !important;
                        --border: #e5e7eb !important;
                        --muted: #f3f4f6 !important;
                        --muted-foreground: #6b7280 !important;
                        --primary: #000000 !important;
                        --primary-foreground: #ffffff !important;
                    }
                    .dark {
                        --background: #ffffff !important;
                        --foreground: #000000 !important;
                        --card: #ffffff !important;
                        --card-foreground: #000000 !important;
                        --border: #e5e7eb !important;
                        --muted: #f3f4f6 !important;
                        --muted-foreground: #6b7280 !important;
                        --primary: #000000 !important;
                        --primary-foreground: #ffffff !important;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                    }

                    html, body, #root, main {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        color-scheme: light !important;
                        background: #ffffff !important;
                    }

                    html {
                        background: #ffffff !important;
                    }

                    main {
                        display: block !important;
                    }

                    .result-print-root {
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        background: #ffffff !important;
                    }

                    .overflow-x-auto {
                        overflow: visible !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .result-print-root .card {
                        overflow: visible !important;
                        break-inside: avoid;
                        box-shadow: none !important;
                        border-color: #e5e7eb !important;
                    }

                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }

                    table {
                        break-inside: auto;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        break-inside: avoid;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
            <div className="absolute top-4 right-4 no-print">
                <ThemeToggle />
            </div>
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between no-print">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/${slug}/student/cycles`, { state: { admissionNumber, accessPin } })}
                        className="gap-1.5"
                    >
                        <ArrowLeftIcon className="size-4" /> Back to Results
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-1.5"
                    >
                        <PrinterIcon className="size-4" /> Print Result
                    </Button>
                </div>

                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                                <SchoolIcon className="size-6" />
                            </div>
                            <CardTitle className="text-xl">{school.name}</CardTitle>
                            {school.motto ? (
                                <p className="text-sm italic text-muted-foreground">"{school.motto}"</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">{school.subDomain}</p>
                            )}
                            {sessionTermLabel && (
                                <p className="text-xs font-medium text-muted-foreground">{sessionTermLabel}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                            <span className="flex items-center gap-1">
                                <CalendarIcon className="size-3.5" />
                                {currentDate}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:text-center">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Student Name</p>
                                <p className="mt-1 text-sm font-medium">
                                    {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                                </p>
                            </div>
                            <div className="sm:text-center">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Admission Number</p>
                                <p className="mt-1 text-sm font-medium font-mono">{student.admissionNumber}</p>
                            </div>
                            <div className="sm:text-center">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</p>
                                <p className="mt-1 text-sm font-medium">
                                    {student.className}{student.classArm ? ` ${student.classArm}` : ""}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {scores.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardCheckIcon className="size-10 text-muted-foreground" />
                            <h3 className="mt-4 text-sm font-medium">No results recorded</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Results have not been published for you yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-5">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Position</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{positionRank || "—"}</p>
                                    {positionTotal && (
                                        <p className="text-xs text-muted-foreground">{positionTotal}</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subjects</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{computedSubjectsOffered}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{computedTotalScore}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{computedAverageScore}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Grade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-lg font-bold ${getGradeColor(overallGrade)}`}>
                                        {overallGrade}
                                    </span>
                                    <p className="mt-1 text-xs text-muted-foreground">{overallRemark}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Subject Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="table-header-brand border-b border-border text-left text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">Subject</th>
                                                <th className="px-4 py-3 font-medium text-center">CA1</th>
                                                <th className="px-4 py-3 font-medium text-center">CA2</th>
                                                {caCount === 3 && (
                                                    <th className="px-4 py-3 font-medium text-center">CA3</th>
                                                )}
                                                <th className="px-4 py-3 font-medium text-center">Exam</th>
                                                <th className="px-4 py-3 font-medium text-center">Total</th>
                                                <th className="px-4 py-3 font-medium text-center">Class Avg</th>
                                                <th className="px-4 py-3 font-medium text-center">Grade</th>
                                                <th className="px-4 py-3 font-medium">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {scores.map((score, idx) => (
                                                <tr key={idx} className="transition-colors hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">
                                                        {score.subject}
                                                        {score.subjectCode && <span className="ml-2 text-xs text-muted-foreground">({score.subjectCode})</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{score.ca1 ?? "—"}</td>
                                                    <td className="px-4 py-3 text-center">{score.ca2 ?? "—"}</td>
                                                    {caCount === 3 && (
                                                        <td className="px-4 py-3 text-center">{score.ca3 ?? "—"}</td>
                                                    )}
                                                    <td className="px-4 py-3 text-center">{score.exam ?? "—"}</td>
                                                    <td className="px-4 py-3 text-center font-medium">{score.total ?? "—"}</td>
                                                    <td className="px-4 py-3 text-center">{score.classAverage ?? "—"}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getGradeColor(score.grade)}`}>
                                                            {score.grade || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{toSentenceCase(score.remark)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2Icon className="size-4" />
                                    Principal's Remark
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed">{displayPrincipalRemark}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="text-center">
                                        <div className="mb-8 border-b border-border pb-1">
                                            <p className="text-xs text-muted-foreground">Class Teacher</p>
                                        </div>
                                        <p className="text-sm font-medium">Teacher's Name</p>
                                        <p className="text-xs text-muted-foreground">Signature / Date</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mb-8 border-b border-border pb-1">
                                            <p className="text-xs text-muted-foreground">Principal</p>
                                        </div>
                                        <p className="text-sm font-medium">{school.name}</p>
                                        <p className="text-xs text-muted-foreground">Signature / Date</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
