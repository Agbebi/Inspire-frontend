import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SchoolIcon, ClipboardCheckIcon, CreditCardIcon, CheckCircle, XCircle, Loader2Icon, LockKeyhole, EyeIcon, EyeOffIcon } from "lucide-react"

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
    const [banks, setBanks] = useState([])
    const [payout, setPayout] = useState(null)
    const [bankForm, setBankForm] = useState({ bankCode: "", bankAccountNumber: "", bankAccountName: "" })
    const [lastVerifiedKey, setLastVerifiedKey] = useState("")
    const [banksLoading, setBanksLoading] = useState(false)
    const [accountVerifying, setAccountVerifying] = useState(false)
    const [verifyStatus, setVerifyStatus] = useState("idle") // 'idle' | 'verifying' | 'verified' | 'error'
    const [verifyError, setVerifyError] = useState("")
    const [payoutSaving, setPayoutSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
    const verifySeq = useRef(0)

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
            }

            setBanksLoading(true)
            try {
                const [banksRes, payoutRes] = await Promise.all([
                    API.get("/api/school/manage/payout-details/banks"),
                    API.get("/api/school/manage/payout-details"),
                ])
                const bankList = banksRes.data?.data || []
                setBanks(bankList)
                const payoutData = payoutRes.data?.data || null
                setPayout(payoutData)
                setBankForm({
                    bankCode: payoutData?.bankCode || "",
                    bankAccountNumber: payoutData?.bankAccountNumber || "",
                    bankAccountName: payoutData?.bankAccountName || "",
                })
            } catch {
                // ignore — payout details may not be set yet
            } finally {
                setBanksLoading(false)
            }
            setLoading(false)
        }
        load()
    }, [])

    function updateCaMaxScore(index, value) {
        const next = [...caMaxScores]
        next[index] = value === "" ? 0 : Number(value)
        setCaMaxScores(next)
    }

    async function runVerify({ bankCode, accountNumber }, seq) {
        setAccountVerifying(true)
        setVerifyStatus("verifying")
        setVerifyError("")
        try {
            const res = await API.get("/api/school/manage/payout-details/banks/verify", {
                params: { bankCode, accountNumber },
            })
            // If a newer verify call has been started, drop this result.
            if (seq !== verifySeq.current) return
            const accountName =
                res.data?.data?.account_name ||
                res.data?.data?.accountName ||
                ""
            if (res.data?.success && accountName) {
                setLastVerifiedKey(`${bankCode}|${accountNumber}`)
                setBankForm((p) => ({ ...p, bankAccountName: accountName }))
                setVerifyStatus("verified")
            } else {
                setBankForm((p) => ({ ...p, bankAccountName: "" }))
                setVerifyStatus("error")
                setVerifyError("Could not resolve account name")
            }
        } catch (err) {
            if (seq !== verifySeq.current) return
            setBankForm((p) => ({ ...p, bankAccountName: "" }))
            setVerifyStatus("error")
            setVerifyError(
                err.response?.data?.message || "Failed to verify account",
            )
        } finally {
            if (seq === verifySeq.current) setAccountVerifying(false)
        }
    }

    function handleManualVerify() {
        if (!bankForm.bankCode || bankForm.bankAccountNumber.length !== 10) {
            toast.error("Select a bank and enter a 10-digit account number")
            return
        }
        const seq = ++verifySeq.current
        runVerify(
            {
                bankCode: bankForm.bankCode,
                accountNumber: bankForm.bankAccountNumber,
            },
            seq,
        )
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

    async function handlePayoutSubmit(e) {
        e.preventDefault()
        if (!bankForm.bankCode || !bankForm.bankAccountNumber) {
            toast.error("Bank and account number are required")
            return
        }
        if (!/^\d{10}$/.test(bankForm.bankAccountNumber)) {
            toast.error("Account number must be 10 digits")
            return
        }
        if (verifyStatus !== "verified" || !bankForm.bankAccountName) {
            toast.error("Please verify the account before saving")
            return
        }
        setPayoutSaving(true)
        try {
            // Do NOT send bankAccountName — the server resolves it itself
            // from the bank code + account number, and trusts only its own
            // Paystack resolve call.
            const res = await API.put("/api/school/manage/payout-details", {
                bankCode: bankForm.bankCode,
                bankAccountNumber: bankForm.bankAccountNumber,
            })
            setPayout(res.data?.data)
            toast.success("Payout details saved successfully")
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save payout details")
        } finally {
            setPayoutSaving(false)
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault()
        setPasswordSaving(true)
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                toast.error("New passwords do not match")
                return
            }
            const res = await API.put("/api/school/manage/settings/password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            })
            if (res.data?.success) {
                toast.success("Password changed successfully")
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
            } else {
                toast.error(res.data?.message || "Failed to change password")
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password")
        } finally {
            setPasswordSaving(false)
        }
    }

    // Account holder name is only meaningful while the displayed value
    // corresponds to the currently-entered bank + account. If either has
    // changed since the last successful verification, the name is stale
    // and we treat it as empty (the status pill also reflects this).
    const currentKey = `${bankForm.bankCode}|${bankForm.bankAccountNumber}`
    const displayedAccountName =
        currentKey === lastVerifiedKey ? bankForm.bankAccountName : ""
    const isVerified = verifyStatus === "verified" && currentKey === lastVerifiedKey
    const canSave =
        !!bankForm.bankCode &&
        bankForm.bankAccountNumber.length === 10 &&
        isVerified &&
        !!displayedAccountName

    if (loading) {
        return <PageLoading />
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Configuration</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your school profile and result configuration.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <SchoolIcon className="size-5" />
                            </div>
                            <div>
                                <p className="text-[0.8rem] font-medium text-foreground">School Profile</p>
                                <p className="text-xs text-muted-foreground">{school?.subDomain}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">School name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supportEmail">Support email</Label>
                                <Input id="supportEmail" type="email" value={formData.supportEmail} onChange={(e) => setFormData((p) => ({ ...p, supportEmail: e.target.value }))} />
                            </div>
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

                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ClipboardCheckIcon className="size-5" />
                            </div>
                            <div>
                                <p className="text-[0.8rem] font-medium text-foreground">Result Configuration</p>
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
                                className="select-premium"
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

                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </Button>
                </form>

                <div className="space-y-6">
                    <form onSubmit={handlePayoutSubmit} className="space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CreditCardIcon className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[0.8rem] font-medium text-foreground">Bank & Payout Details</p>
                                    <p className="text-xs text-muted-foreground">
                                        Configure your school's bank account to receive fee payments directly via Paystack.
                                    </p>
                                </div>
                            </div>

                            {payout?.paystackSubaccountCode && (
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                                    <span className={payout.paystackAccountVerified ? "text-green-600" : "text-amber-600"}>
                                        {payout.paystackAccountVerified ? <CheckCircle /> : <XCircle />}
                                    </span>
                                    <span className="font-medium">
                                        {payout.paystackAccountVerified
                                            ? "Payout account verified"
                                            : "Payout account pending verification"}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="bankCode">Bank *</Label>
                                <select
                                    id="bankCode"
                                    value={bankForm.bankCode}
                                    onChange={(e) => setBankForm((p) => ({ ...p, bankCode: e.target.value }))}
                                    className="select-premium w-full"
                                    required
                                    disabled={banksLoading}
                                >
                                    <option value="">
                                        {banksLoading ? "Loading banks…" : "Select a bank"}
                                    </option>
                                    {banks.map((b) => (
                                        <option key={b.code || b.name} value={b.code}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bankAccountNumber">Account Number *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="bankAccountNumber"
                                        type="text"
                                        inputMode="numeric"
                                        value={bankForm.bankAccountNumber}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                                            setBankForm((p) => ({ ...p, bankAccountNumber: digits }))
                                        }}
                                        placeholder="e.g. 0123456789"
                                        required
                                        maxLength={10}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleManualVerify}
                                        disabled={
                                            accountVerifying ||
                                            !bankForm.bankCode ||
                                            bankForm.bankAccountNumber.length < 10
                                        }
                                    >
                                        {accountVerifying ? "Verifying…" : "Verify"}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bankAccountName">Account Holder Name</Label>
                                    {isVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-green-600">
                                            <CheckCircle className="size-3" /> Verified
                                        </span>
                                    )}
                                    {verifyStatus === "verifying" && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                                            <Loader2Icon className="size-3 animate-spin" /> Verifying
                                        </span>
                                    )}
                                    {verifyStatus === "error" && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-medium text-destructive">
                                            <XCircle className="size-3" /> Unverified
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="bankAccountName"
                                    type="text"
                                    value={displayedAccountName}
                                    readOnly
                                    disabled
                                    placeholder={
                                        verifyStatus === "verifying"
                                            ? "Resolving account…"
                                            : isVerified
                                                ? ""
                                                : "Will populate after account verification"
                                    }
                                    className="bg-muted/40"
                                />
                                {verifyStatus === "error" && verifyError && (
                                    <p className="text-xs text-destructive">{verifyError}</p>
                                )}
                                {verifyStatus === "idle" && !displayedAccountName && (
                                    <p className="text-xs text-muted-foreground">
                                        Click <span className="font-medium text-foreground">Verify</span> to resolve the account holder name from Paystack.
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={payoutSaving || !canSave}
                            >
                                {payoutSaving ? "Saving…" : "Save Payout Details"}
                            </Button>
                        </div>
                    </form>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <LockKeyhole className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-medium text-foreground">Change Password</p>
                                    <p className="text-xs text-muted-foreground">Update your account password.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                        required
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
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                        required
                                        minLength={6}
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
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm new password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                        required
                                        minLength={6}
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

                            <Button type="submit" disabled={passwordSaving}>
                                {passwordSaving ? "Updating…" : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
