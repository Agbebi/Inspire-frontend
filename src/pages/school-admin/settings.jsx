import { useEffect, useState } from "react"
import { toast } from "sonner"
import { SchoolIcon, ClipboardCheckIcon } from "lucide-react"

import API from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageLoading } from "@/components/ui/loading"

export default function Settings() {
    const [school, setSchool] = useState(null)
    const [formData, setFormData] = useState({ name: "", address: "", logoUrl: "", supportEmail: "", motto: "" })
    const [caCount, setCaCount] = useState(3)
    const [caMaxScores, setCaMaxScores] = useState([10, 10, 20])
    const [examMaxScore, setExamMaxScore] = useState(70)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const res = await API.get("/api/school/manage/settings")
                const data = res.data?.data || {}
                setSchool(data)
                setFormData({
                    name: data.name || "",
                    address: data.address || "",
                    logoUrl: data.logoUrl || "",
                    supportEmail: data.supportEmail || "",
                    motto: data.motto || "",
                })
                const count = data.caConfig?.caCount || 3
                setCaCount(count)
                setCaMaxScores(data.caConfig?.caMaxScores || (count === 2 ? [15, 15] : [10, 10, 20]))
                setExamMaxScore(data.caConfig?.examMaxScore || 70)
            } catch {
                // ignore
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    function updateCaMaxScore(index, value) {
        const next = [...caMaxScores]
        next[index] = value === "" ? 0 : Number(value)
        setCaMaxScores(next)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                logoUrl: formData.logoUrl,
                supportEmail: formData.supportEmail,
                motto: formData.motto,
                caConfig: {
                    caCount,
                    caMaxScores,
                    examMaxScore,
                }
            }
            const res = await API.put("/api/school/manage/settings", payload)
            setSchool(res.data?.data || school)
            toast.success("Settings saved successfully")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your school profile and result configuration.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <SchoolIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">School Profile</p>
                            <p className="text-xs text-muted-foreground">{school?.subDomain}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">School name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support email</Label>
                        <Input id="supportEmail" type="email" value={formData.supportEmail} onChange={(e) => setFormData((p) => ({ ...p, supportEmail: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" type="url" value={formData.logoUrl} onChange={(e) => setFormData((p) => ({ ...p, logoUrl: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motto">Motto</Label>
                        <Input id="motto" value={formData.motto} onChange={(e) => setFormData((p) => ({ ...p, motto: e.target.value }))} placeholder="e.g. Knowledge and Integrity" />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ClipboardCheckIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Result Configuration</p>
                            <p className="text-xs text-muted-foreground">Set how student results are recorded and scored.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="caCount">Number of CAs</Label>
                        <select
                            id="caCount"
                            value={String(caCount)}
                            onChange={(e) => {
                                const count = Number(e.target.value)
                                setCaCount(count)
                                if (count === 2) {
                                    setCaMaxScores([15, 15])
                                    setExamMaxScore(70)
                                } else {
                                    setCaMaxScores([10, 10, 20])
                                    setExamMaxScore(70)
                                }
                            }}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 text-sm"
                        >
                            <option value="2">2 CAs</option>
                            <option value="3">3 CAs</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className='mb-2'>CA Max Scores</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {caMaxScores.map((score, idx) => (
                                <div key={idx}>
                                    <Label className='mb-1' htmlFor={`ca-max-${idx + 1}`}>CA{idx + 1} Max</Label>
                                    <Input
                                        id={`ca-max-${idx + 1}`}
                                        type="number"
                                        value={score}
                                        onChange={(e) => updateCaMaxScore(idx, e.target.value)}
                                        min={0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="examMaxScore">Exam Max Score</Label>
                            <Input id="examMaxScore" type="number" value={examMaxScore} onChange={(e) => setExamMaxScore(e.target.value === "" ? 0 : Number(e.target.value))} min={0} />
                    </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    {saving ? "Saving…" : "Save changes"}
                </Button>
            </form>
        </div>
    )
}
