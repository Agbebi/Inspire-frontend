import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon, SchoolIcon, Loader2Icon, ChevronRightIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import API from "@/api/axios"

export default function FindSchool() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

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
    const q = query.trim()
    if (!q) {
      setSuggestions([])
      setOpen(false)
      setError("")
      return
    }

    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await API.get("/api/school/search", { params: { q } })
        setSuggestions(response.data?.data || [])
        setOpen(true)
        setError("")
      } catch {
        setError("Failed to load suggestions. Please try again.")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleSelect(school) {
    setQuery("")
    setOpen(false)
    setSuggestions([])
    navigate(`/auth/school/${school.subDomain}/login`)
  }

  const showEmpty = open && !loading && query.trim() && suggestions.length === 0

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
          <SchoolIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Find your school
          </h1>
          <p className="text-sm text-muted-foreground">
            Start typing your school name or domain and we'll suggest a match.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school-search">School name or domain</Label>
        <div className="relative">
          {loading ? (
            <Loader2Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id="school-search"
            type="text"
            autoComplete="off"
            placeholder="e.g. Springfield Academy"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className="h-10 pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Start typing your school's name and the matching school will appear below.
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {open && suggestions.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {suggestions.map((school) => (
            <li key={school._id}>
              <button
                type="button"
                onClick={() => handleSelect(school)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                    <SchoolIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {school.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {school.subDomain}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SchoolIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No schools found
            </p>
            <p className="text-xs text-muted-foreground">
              We couldn't find a school matching "{query}". Try a different name or domain.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
