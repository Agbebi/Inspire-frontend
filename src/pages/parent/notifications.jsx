import { useSocket } from "@/context/socket"
import { BellIcon } from "lucide-react"

export default function ParentNotifications() {
  const { notifications, markRead } = useSocket()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Alerts</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
          Notifications
        </h1>
        <p className="text-base text-muted-foreground">Updates from the school appear here in real time.</p>
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BellIcon className="size-6" />
          </div>
          <h3 className="mt-5 text-base font-semibold text-foreground">No notifications yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            You&apos;ll be alerted here as soon as new results are published.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.read && markRead(n._id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-5 text-left transition-colors ${
                n.read ? "border-border bg-card" : "border-brand/30 bg-brand/5"
              }`}
            >
              <span className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-brand"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] font-semibold text-brand">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
