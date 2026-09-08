import { XIcon } from "lucide-react"

export default function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = "max-w-lg" }) {
    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className={`flex w-full ${maxWidth} max-h-[calc(100dvh-2rem)] flex-col rounded-xl border border-border bg-background shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        aria-label="Close"
                    >
                        <XIcon className="size-4" />
                    </button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
                {footer && (
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
