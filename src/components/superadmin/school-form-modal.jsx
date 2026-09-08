/* eslint-disable react-hooks/set-state-in-effect */
import * as React from "react"
import { XIcon, EyeIcon, EyeOffIcon } from "lucide-react"
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
  session: "",
  term: "",
}

const STEP_SCHOOL = 1
const STEP_ADMIN = 2

export default function SchoolFormModal({ open, onClose, editingId, initialData, onSubmit, loading }) {
  const [step, setStep] = React.useState(STEP_SCHOOL)
  const [formData, setFormData] = React.useState({ ...emptyForm })
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFormData(initialData ? { ...initialData } : { ...emptyForm })
      setStep(STEP_SCHOOL)
    }
  }, [open, initialData])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function validateStep(currentStep) {
    if (currentStep === STEP_SCHOOL) {
      return Boolean(formData.name.trim() && formData.supportEmail.trim())
    }
    if (currentStep === STEP_ADMIN) {
      return Boolean(formData.adminName.trim() && formData.adminEmail.trim() && formData.adminPassword)
    }
    return true
  }

  function goNext() {
    if (validateStep(step) && step < STEP_ADMIN) {
      setStep(step + 1)
    }
  }

  function goBack() {
    if (step > STEP_SCHOOL) {
      setStep(step - 1)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!open) return null

  const isEditing = Boolean(editingId)
  const showSteps = !isEditing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit School" : "Add School"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {showSteps && (
          <div className="flex items-center gap-2 px-5 pt-4">
            <div className="flex items-center gap-2">
              <div className={`flex size-7 items-center justify-center rounded-full text-xs font-medium border ${
                step === STEP_SCHOOL ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
              }`}>1</div>
              <span className="text-sm text-muted-foreground">School details</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2">
              <div className={`flex size-7 items-center justify-center rounded-full text-xs font-medium border ${
                step === STEP_ADMIN ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
              }`}>2</div>
              <span className="text-sm text-muted-foreground">School admin</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {showSteps && step === STEP_SCHOOL && (
            <div className="space-y-4">
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

              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  First Academic Cycle
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="session">Session</Label>
                    <Input
                      id="session"
                      placeholder="e.g. 2025/2026"
                      value={formData.session}
                      onChange={(e) => updateField("session", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Input
                      id="term"
                      placeholder="e.g. First Term"
                      value={formData.term}
                      onChange={(e) => updateField("term", e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Seeds the school's current session/term; the school admin can add more later.
                </p>
              </div>
            </div>
          )}

          {showSteps && step === STEP_ADMIN && (
            <div className="space-y-4">
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
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => updateField("adminPassword", e.target.value)}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  This admin will only be able to sign in to this school.
                </p>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="space-y-4">
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
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {showSteps && step === STEP_SCHOOL && (
              <Button type="button" onClick={goNext} disabled={!validateStep(step)}>
                Next
              </Button>
            )}
            {showSteps && step === STEP_ADMIN && (
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            {(isEditing || step === STEP_ADMIN) && (
              <Button type="submit" disabled={loading}>
                {loading ? (isEditing ? "Saving…" : "Adding…") : isEditing ? "Save changes" : "Add School"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
