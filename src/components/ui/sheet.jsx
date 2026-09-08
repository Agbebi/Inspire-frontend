import { createContext, useContext, useEffect, useRef } from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const SheetContext = createContext(null)

function Sheet({ open, onOpenChange, children }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      onOpenChange?.(false)
    }
  }

  if (!open) return null

  return (
    <SheetContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50">
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <div className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-background shadow-2xl">
            {children}
          </div>
        </div>
      </div>
    </SheetContext.Provider>
  )
}

function SheetHeader({ className, ...props }) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex items-center justify-between border-b px-6 py-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetClose({ className, ...props }) {
  const ctx = useContext(SheetContext)
  return (
    <button
      type="button"
      onClick={() => ctx?.onOpenChange?.(false)}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

function SheetContent({ className, ...props }) {
  return (
    <div
      data-slot="sheet-content"
      className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("border-t px-6 py-4", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetContent,
  SheetFooter,
}
