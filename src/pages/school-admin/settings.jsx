import { useEffect, useState } from "react"
import { toast } from "sonner"
import { SchoolIcon } from "lucide-react"

import API from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageLoading } from "@/components/ui/loading"

export default function Settings() {
    const [school, setSchool] = useState(null)
    const [formData, setFormData] = useState({ name: "", address: "", logoUrl: "", supportEmail: "", motto: "" })
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
            } catch {
                // ignore
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await API.put("/api/school/manage/settings", formData)
            setSchool(res.data?.data || school)
            toast.success("School updated successfully")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update school")
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
                <p className="text-sm text-muted-foreground">Manage your school profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <SchoolIcon className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{school?.subDomain}</p>
                        <p className="text-xs text-muted-foreground">Subscription: {school?.subscriptionStatus || "inactive"}</p>
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

                <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                </Button>
            </form>
        </div>
    )
}
