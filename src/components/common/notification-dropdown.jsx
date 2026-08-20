import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BellIcon, Loader2Icon, TrashIcon } from "lucide-react"

import API from "@/api/axios"
import { toast } from "sonner"
import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:3000"

export default function NotificationDropdown() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    function onClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [notifRes, msgRes] = await Promise.all([
          API.get("/api/school/manage/notifications"),
          API.get("/api/school/manage/messages"),
        ])
        const notifications = (notifRes.data?.data || [])
          .filter((n) => !n.read)
          .map((n) => ({
            id: n._id,
            type: "notification",
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            read: n.read,
            parentId: n.recipient?._id,
            parentName: n.recipient?.name,
            studentId: n.studentId?._id,
            studentName: n.studentId ? `${n.studentId.firstName} ${n.studentId.lastName}` : null,
          }))
        const messages = (msgRes.data?.data || [])
          .filter((m) => m.senderType === 'parent' && !m.read)
          .map((m) => ({
            id: m._id,
            type: "message",
            title: `Message from ${m.senderId?.name || "parent"}`,
            message: m.body,
            createdAt: m.createdAt,
            read: m.read,
            parentId: m.senderId?._id,
            parentName: m.senderId?.name,
            studentId: m.studentId?._id,
            studentName: m.studentId ? `${m.studentId.firstName} ${m.studentId.lastName}` : null,
          }))
        const combined = [...notifications, ...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setItems(combined.slice(0, 20))
        setUnreadCount(combined.length)
      } catch {
        toast.error("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const authRaw = localStorage.getItem("school_auth")
    if (!authRaw) return
    let auth
    try { auth = JSON.parse(authRaw) } catch { return }
    const token = auth?.token
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    })
    socketRef.current = socket

    socket.on("connect_error", () => {})

    socket.on("notification:new", (notif) => {
      if (notif.read) return
      setItems((prev) => {
        const next = [
          {
            id: notif._id,
            type: "notification",
            title: notif.title,
            message: notif.message,
            createdAt: notif.createdAt,
            read: notif.read,
            parentId: notif.recipient?._id,
            parentName: notif.recipient?.name,
            studentId: notif.studentId?._id,
            studentName: notif.studentId ? `${notif.studentId.firstName} ${notif.studentId.lastName}` : null,
          },
          ...prev,
        ]
        return next.slice(0, 20)
      })
      setUnreadCount((c) => c + 1)
    })

    socket.on("message:new", (msg) => {
      if (msg.senderType !== "parent" || msg.read) return
      setItems((prev) => {
        const item = {
          id: msg._id,
          type: "message",
          title: `Message from ${msg.senderId?.name || "parent"}`,
          message: msg.body,
          createdAt: msg.createdAt,
          read: msg.read,
          parentId: msg.senderId?._id,
          parentName: msg.senderId?.name,
          studentId: msg.studentId?._id,
          studentName: msg.studentId ? `${msg.studentId.firstName} ${msg.studentId.lastName}` : null,
        }
        return [item, ...prev].slice(0, 20)
      })
      setUnreadCount((c) => c + 1)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  async function handleItemClick(item) {
    setOpen(false)
    if (item.type === "notification") {
      await API.put(`/api/school/manage/notifications/${item.id}/read`).catch(() => {})
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setUnreadCount((c) => Math.max(0, c - 1))
      navigate(`/${slug}/admin/notifications`)
    } else if (item.type === "message") {
      await API.put(`/api/school/manage/messages/${item.id}/read`).catch(() => {})
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setUnreadCount((c) => Math.max(0, c - 1))
      navigate({
        pathname: `/${slug}/admin/messages`,
        search: item.parentId ? `?parentId=${item.parentId}` : "",
      })
    }
  }

  async function handleDeleteItem(item, e) {
    e.stopPropagation()
    try {
      if (item.type === "notification") {
        await API.put(`/api/school/manage/notifications/${item.id}/read`).catch(() => {})
      } else if (item.type === "message") {
        await API.put(`/api/school/manage/messages/${item.id}/read`).catch(() => {})
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      if (!item.read) {
        setUnreadCount((c) => Math.max(0, c - 1))
      }
    } catch {
      toast.error("Failed to update")
    }
  }

  async function handleClearAll() {
    try {
      await Promise.all([
        API.put("/api/school/manage/messages/read-all").catch(() => {}),
        items
          .filter((i) => i.type === "notification" && !i.read)
          .map((i) => API.put(`/api/school/manage/notifications/${i.id}/read`).catch(() => {})),
      ])
      setItems([])
      setUnreadCount(0)
      toast.success("All notifications cleared")
    } catch {
      toast.error("Failed to clear notifications")
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Notifications"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.65rem] font-semibold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              )}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
            ) : (
              items.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                      {item.parentName && <span>From: {item.parentName}</span>}
                      {item.studentName && <span>· Student: {item.studentName}</span>}
                      <span>· {new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {item.type === "notification" && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item, e)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
