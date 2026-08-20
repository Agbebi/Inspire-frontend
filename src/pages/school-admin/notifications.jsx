import { useEffect, useState, useMemo } from "react"
import {
  BellIcon,
  SendIcon,
  Loader2Icon,
  SearchIcon,
  CheckIcon,
  TrashIcon,
  UsersIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/common/modal"
import API from "@/api/axios"
import { toast } from "sonner"

const emptyForm = {
  title: "",
  message: "",
  target: "all",
  parentId: "",
  studentId: "",
}

export default function SchoolAdminNotifications() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [parents, setParents] = useState([])
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  const filteredParents = useMemo(() => {
    if (!search.trim()) return parents
    const q = search.trim().toLowerCase()
    return parents.filter((p) => {
      const name = `${p.name || ""}`.toLowerCase()
      const email = `${p.email || ""}`.toLowerCase()
      const students = (p.students || [])
        .map((s) => `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase())
        .join(" ")
      return name.includes(q) || email.includes(q) || students.includes(q)
    })
  }, [parents, search])

  async function handleMarkRead(id) {
    try {
      await API.put(`/api/school/manage/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  async function handleDelete(id) {
    try {
      await API.delete(`/api/school/manage/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success("Notification deleted")
    } catch {
      toast.error("Failed to delete notification")
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [notifRes, parentsRes] = await Promise.all([
          API.get("/api/school/manage/notifications"),
          API.get("/api/school/manage/parents"),
        ])
        setNotifications(notifRes.data?.data || [])
        setParents(parentsRes.data?.data || [])
      } catch {
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target,
        parentId: form.target === "specific" ? form.parentId : undefined,
        studentId: form.target === "specific" && form.studentId ? form.studentId : undefined,
      }
      const res = await API.post("/api/school/manage/notifications", payload)
      if (res.data?.success) {
        toast.success(res.data.message || "Notification sent")
        setModalOpen(false)
        setForm({ ...emptyForm })
        setNotifications((prev) => [...(res.data.data || []), ...prev])
      } else {
        toast.error(res.data?.message || "Failed to send notification")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  const selectedParent = parents.find((p) => p._id === form.parentId)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Communication
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
            Parent Notifications
          </h1>
          <p className="text-base text-muted-foreground">
            Send updates and announcements to parents in real time.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 w-full sm:w-auto">
          <SendIcon className="size-4" /> New Notification
        </Button>
      </header>

      <section className="rounded-2xl border border-border bg-card p-7">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Notifications</h2>
          <p className="text-sm text-muted-foreground">Messages sent to parents appear here.</p>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-12">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellIcon className="size-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
              Send your first notification to keep parents informed.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  n.read ? "border-border bg-background" : "border-brand/30 bg-brand/5"
                }`}
              >
                <span className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-brand"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.recipient?.name
                      ? `To: ${n.recipient.name}`
                      : "To: All parents"}
                    {n.studentId && (
                      <span>
                        {" "}
                        · Student: {n.studentId?.firstName} {n.studentId?.lastName}
                      </span>
                    )}
                    {" · "}
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleMarkRead(n._id)}
                      aria-label="Mark as read"
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(n._id)}
                    aria-label="Delete notification"
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setForm({ ...emptyForm })
        }}
        title="New Notification"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false)
                setForm({ ...emptyForm })
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="notification-form" disabled={sending}>
              {sending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </>
        }
      >
        <form id="notification-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Results Published"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              required
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write your message to parents…"
              className="h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
            />
          </div>
          <div className="space-y-2">
            <Label>Target</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, target: "all" }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.target === "all"
                    ? "border-brand/30 bg-brand/5 text-brand"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <UsersIcon className="size-4" />
                All Parents
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, target: "specific" }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.target === "specific"
                    ? "border-brand/30 bg-brand/5 text-brand"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserIcon className="size-4" />
                Specific Parent
              </button>
            </div>
          </div>

          {form.target === "specific" && (
            <div className="space-y-2">
              <Label htmlFor="parent">Select Parent</Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="parent"
                  required
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search parent name or email…"
                  className="h-10 pl-9"
                />
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {selectedParent && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedParent.name}</span> ({selectedParent.email})
                </p>
              )}
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
                {filteredParents.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No parents found</p>
                ) : (
                  filteredParents.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, parentId: p._id }))
                        setSearch(p.name)
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                        form.parentId === p._id ? "bg-brand/5 text-brand" : "text-foreground"
                      }`}
                    >
                      <span>
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{p.email}</span>
                      </span>
                      {p.students?.length > 0 && (
                        <span className="text-[0.65rem] text-muted-foreground">
                          {p.students.length} student{p.students.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
