import * as React from "react"
import { XIcon } from "lucide-react"

export default function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        aria-label="Close"
                    >
                        <XIcon className="size-4" />
                    </button>
                </div>
                <div className="space-y-4 p-5">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
