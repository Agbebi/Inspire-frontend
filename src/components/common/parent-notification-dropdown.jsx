import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BellIcon, TrashIcon } from "lucide-react"

import { useSocket } from "@/context/socket"
import { toast } from "sonner"

export default function ParentNotificationDropdown() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { notifications, messages, unreadCount, markRead, markMessageRead, markAllRead } = useSocket()
  const [open, setOpen] = useState(false)

  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 10)
  const unreadMessages = messages.filter((m) => m.senderType === "school" && !m.read).slice(0, 10)
  const unreadItems = useMemo(() => {
    const mapped = [
      ...unreadNotifications.map((n) => ({ ...n, itemType: "notification" })),
      ...unreadMessages.map((m) => ({ ...m, itemType: "message" })),
    ]
    return mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20)
  }, [unreadNotifications, unreadMessages])

  async function handleItemClick(item) {
    setOpen(false)
    if (item.itemType === "message") {
      await markMessageRead(item._id)
      navigate(`/${slug}/parent/messages`)
    } else {
      await markRead(item._id)
      navigate(`/${slug}/parent/notifications`)
    }
  }

  async function handleDelete(item, e) {
    e.stopPropagation()
    try {
      if (item.itemType === "message") {
        markMessageRead(item._id)
      } else {
        markRead(item._id)
      }
      toast.success("Marked as read")
    } catch {
      toast.error("Failed to update")
    }
  }

  async function handleClearAll() {
    try {
      await markAllRead()
      toast.success("All notifications cleared")
    } catch {
      toast.error("Failed to clear notifications")
    }
  }

  return (
    <div className="relative">
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
            {unreadItems.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No new notifications</p>
            ) : (
              unreadItems.map((item) => (
                <button
                  key={`${item.itemType}-${item._id}`}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title || item.body}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.message || item.body}</p>
                    <p className="mt-1 text-[0.65rem] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item, e)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
