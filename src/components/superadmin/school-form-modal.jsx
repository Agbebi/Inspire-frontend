import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const emptyForm = {
  name: "",
  logoUrl: "",
  address: "",
  supportEmail: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
}

export default function SchoolFormModal({ open, onClose, editingId, initialData, onSubmit, loading }) {
  const [formData, setFormData] = React.useState({ ...emptyForm })

  React.useEffect(() => {
    if (open) {
      setFormData(initialData ? { ...initialData } : { ...emptyForm })
    }
  }, [open, initialData])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit School" : "Add School"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="name">School name</Label>
            <Input
              id="name"
              required
              placeholder="e.g. Springfield Academy"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input
              id="supportEmail"
              type="email"
              required
              placeholder="admin@springfield.edu"
              value={formData.supportEmail}
              onChange={(e) => updateField("supportEmail", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Education Lane, City"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          {!editingId && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                School admin
              </p>

              <div className="space-y-2">
                <Label htmlFor="adminName">Admin name</Label>
                <Input
                  id="adminName"
                  required
                  placeholder="Jane Doe"
                  value={formData.adminName}
                  onChange={(e) => updateField("adminName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@springfield.edu"
                  value={formData.adminEmail}
                  onChange={(e) => updateField("adminEmail", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={(e) => updateField("adminPassword", e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                This admin will only be able to sign in to this school.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editingId ? "Saving…" : "Adding…") : editingId ? "Save changes" : "Add School"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
