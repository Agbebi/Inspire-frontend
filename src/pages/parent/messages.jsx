import { useEffect, useState } from "react"
import { SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import parentAPI from "@/api/parent"
import { useSocket } from "@/context/socket"
import { toast } from "sonner"

export default function ParentMessages() {
  const { messages } = useSocket()
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    parentAPI
      .get("/parent/students")
      .then((res) => setStudents(res.data?.data || []))
      .catch(() => setStudents([]))
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    try {
      await parentAPI.post("/parent/messages", { body: body.trim(), studentId: studentId || undefined })
      setBody("")
      toast.success("Message sent")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send")
    } finally {
      setSending(false)
    }
  }

  const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Communication</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
          Messages
        </h1>
        <p className="text-base text-muted-foreground">Chat with your child&apos;s school securely.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card">
        <div className="max-h-[460px] space-y-3 overflow-y-auto p-6">
          {sorted.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation below.
            </p>
          ) : (
            sorted.map((m) => {
              const fromParent = m.senderType === "parent"
              return (
                <div key={m._id} className={`flex ${fromParent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      fromParent
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.body}
                    <p className={`mt-1 text-[0.65rem] ${fromParent ? "text-brand-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-border p-4">
          <div className="mb-3">
            <Label htmlFor="msgStudent" className="mb-1.5 block">Related child (optional)</Label>
            <select
              id="msgStudent"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="select-premium"
            >
              <option value="">General enquiry</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message…"
              className="flex-1"
            />
            <Button type="submit" disabled={sending} className="gap-2">
              <SendIcon className="size-4" /> {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
