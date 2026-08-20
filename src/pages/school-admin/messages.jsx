import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import {
  MessageSquareIcon,
  SendIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import API from "@/api/axios"
import { toast } from "sonner"
import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:3000"

export default function SchoolAdminMessages() {
  const [searchParams] = useSearchParams()
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [parents, setParents] = useState([])
  const [selectedParentId, setSelectedParentId] = useState("")
  const [search, setSearch] = useState("")
  const [body, setBody] = useState("")
  const socketRef = useRef(null)

  const initialParentId = searchParams.get("parentId")
  const selectedParent = parents.find((p) => p._id === (selectedParentId || initialParentId || ""))

  const filteredParents = parents.filter((p) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return `${p.name || ""}`.toLowerCase().includes(q) || `${p.email || ""}`.toLowerCase().includes(q)
  })

  useEffect(() => {
    async function load() {
      try {
        const [msgRes, parentsRes] = await Promise.all([
          API.get("/api/school/manage/messages"),
          API.get("/api/school/manage/parents"),
        ])
        setMessages(msgRes.data?.data || [])
        setParents(parentsRes.data?.data || [])
      } catch {
        toast.error("Failed to load messages")
      }
    }
    load()
  }, [])

  useEffect(() => {
    const authRaw = localStorage.getItem("school_auth")
    if (!authRaw) return

    let token
    try {
      token = JSON.parse(authRaw)?.token
    } catch {
      return
    }

    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    })
    socketRef.current = socket

    socket.on("connect_error", () => {})

    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    if (!body.trim() || !selectedParentId) return
    setSending(true)
    try {
      const res = await API.post("/api/school/manage/messages", {
        body: body.trim(),
        parentId: selectedParentId,
        studentId: selectedParent?.students?.[0]?._id || undefined,
      })
      if (res.data?.success) {
        setBody("")
        toast.success("Reply sent")
        setMessages((prev) => [...prev, res.data.data])
      } else {
        toast.error(res.data?.message || "Failed to send")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Communication
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
            Parent Messages
          </h1>
          <p className="text-base text-muted-foreground">
            View and reply to messages from parents.
          </p>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card lg:col-span-1">
          <div className="space-y-1.5 p-5 pb-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Parents</h2>
            <p className="text-xs text-muted-foreground">Select a parent to view conversation.</p>
          </div>
          <div className="px-3 pb-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parents…"
                className="h-9 pl-9"
              />
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto px-2 pb-2">
            {filteredParents.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">No parents found</p>
            ) : (
              filteredParents.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelectedParentId(p._id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedParentId === p._id ? "bg-brand/5 text-brand" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand dark:bg-brand/15">
                    {p.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          {selectedParent ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-5 pb-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand dark:bg-brand/15">
                  {selectedParent.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{selectedParent.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{selectedParent.email}</p>
                </div>
              </div>

              <div className="max-h-[460px] space-y-3 overflow-y-auto p-5 pt-4">
                {messages
                  .filter((m) => {
                    const sid = String(m.senderId?._id || m.senderId)
                    const rid = String(m.receiverId?._id || m.receiverId)
                    const pid = String(selectedParent._id)
                    if (m.senderType === "parent" && sid === pid) return true
                    if (m.senderType === "school" && rid === pid) return true
                    return false
                  })
                  .length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No messages from this parent yet.</p>
                ) : (
                  messages
                    .filter((m) => {
                      const sid = String(m.senderId?._id || m.senderId)
                      const rid = String(m.receiverId?._id || m.receiverId)
                      const pid = String(selectedParent._id)
                      if (m.senderType === "parent" && sid === pid) return true
                      if (m.senderType === "school" && rid === pid) return true
                      return false
                    })
                    .map((m) => {
                      const fromParent = m.senderType === "parent"
                      return (
                        <div key={m._id} className={`flex ${fromParent ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                              fromParent ? "bg-muted text-foreground" : "bg-brand text-brand-foreground"
                            }`}
                          >
                            {m.body}
                            <p className={`mt-1 text-[0.65rem] ${fromParent ? "text-muted-foreground" : "text-brand-foreground/70"}`}>
                              {new Date(m.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your reply…"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending} className="gap-2">
                    <SendIcon className="size-4" /> {sending ? "Sending…" : "Reply"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MessageSquareIcon className="size-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Select a parent</p>
              <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
                Choose a parent from the list to view their messages and reply.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
